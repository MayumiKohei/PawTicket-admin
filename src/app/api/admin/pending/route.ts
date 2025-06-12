import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

// Node.js ランタイムで実行する
export const runtime = "nodejs";

export async function GET() {
	try {
		// 全ユーザーを取得
		const usersSnapshot = await adminDb.collection("users").get();

		const pendingPets: Array<{
			userId: string;
			petId: string;
			petName: string;
			createdAt: FirebaseFirestore.Timestamp | string | null;
			petData: Record<string, unknown>;
		}> = [];

		// 各ユーザーのpetsサブコレクションから status == "申請中" のペットを取得
		for (const userDoc of usersSnapshot.docs) {
			try {
				const petsSnapshot = await adminDb
					.collection("users")
					.doc(userDoc.id)
					.collection("pets")
					.where("status", "==", "申請中")
					.get();

				petsSnapshot.docs.forEach((petDoc) => {
					const petData = petDoc.data();

					pendingPets.push({
						userId: userDoc.id,
						petId: petDoc.id,
						petName: petData.petName ?? "名前なし",
						createdAt: petData.createdAt,
						petData: petData,
					});
				});
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
