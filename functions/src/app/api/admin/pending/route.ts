import { NextResponse } from "next/server";
import { pawticketDb } from "../../../../lib/firebaseAdmin";

// Node.js ランタイムで実行する
export const runtime = "nodejs";

export async function GET() {
	try {
		// デバッグ情報を追加
		console.log("Pending API: pawticketDb の確認:", {
			isDefined: !!pawticketDb,
		});

		// 全ユーザーを取得
		const usersSnapshot = await pawticketDb.collection("users").get();

		const pendingPets: Array<{
			userId: string;
			petId: string;
			petName: string;
			createdAt: FirebaseFirestore.Timestamp | string | null;
			petData: Record<string, unknown>;
			applicationId: string;
		}> = [];

		// 各ユーザーのpetsサブコレクションから status == "申請中" のペットを取得
		for (const userDoc of usersSnapshot.docs) {
			try {
				const petsSnapshot = await pawticketDb
					.collection("users")
					.doc(userDoc.id)
					.collection("pets")
					.where("status", "==", "申請中")
					.get();

				for (const petDoc of petsSnapshot.docs) {
					const petData = petDoc.data();

					// 申請IDが存在しない場合は生成して保存
					let applicationId = petData.applicationId;
					if (!applicationId) {
						applicationId = await generateSequentialApplicationId();
						// データベースに申請IDを保存
						await petDoc.ref.update({ applicationId });
					}

					pendingPets.push({
						userId: userDoc.id,
						petId: petDoc.id,
						petName: petData.petName ?? "名前なし",
						createdAt: petData.createdAt,
						petData: petData,
						applicationId: applicationId,
					});
				}
			} catch (error) {
				console.warn(
					`Failed to fetch pets for user ${userDoc.id}:`,
					error
				);
			}
		}

		// createdAt で古い順（昇順）にソート
		pendingPets.sort((a, b) => {
			if (!a.createdAt || !b.createdAt) return 0;

			// Firestore Timestamp の場合
			if (
				typeof a.createdAt === "object" &&
				"toDate" in a.createdAt &&
				typeof b.createdAt === "object" &&
				"toDate" in b.createdAt
			) {
				return (
					a.createdAt.toDate().getTime() -
					b.createdAt.toDate().getTime()
				);
			}

			// 文字列の場合
			if (
				typeof a.createdAt === "string" &&
				typeof b.createdAt === "string"
			) {
				return (
					new Date(a.createdAt).getTime() -
					new Date(b.createdAt).getTime()
				);
			}

			return 0;
		});

		const responseData = {
			success: true,
			pendingPets: pendingPets,
		};

		return NextResponse.json(responseData);
	} catch (error: unknown) {
		console.error("Error in /api/admin/pending:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Unknown error occurred",
				pendingPets: [],
			},
			{ status: 500 }
		);
	}
}

// 順次的な申請IDを生成する関数
async function generateSequentialApplicationId(): Promise<string> {
	try {
		const response = await fetch(
			`${
				process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
			}/api/admin/application-counter`,
			{
				method: "POST",
			}
		);

		if (!response.ok) {
			throw new Error("Failed to generate application ID");
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(
				data.message || "Failed to generate application ID"
			);
		}

		return data.applicationId;
	} catch (error) {
		console.error("Error generating sequential application ID:", error);
		// フォールバック: タイムスタンプベースのIDを生成
		const timestamp = Date.now();
		const random = Math.floor(Math.random() * 1000);
		return `P${timestamp}${random.toString().padStart(3, "0")}`;
	}
}
