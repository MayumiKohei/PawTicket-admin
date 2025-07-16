import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

// Node.js ランタイムで実行する
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const { userId, petId } = await request.json();

		if (!userId || !petId) {
			return NextResponse.json(
				{
					success: false,
					message: "userId と petId が必要です",
				},
				{ status: 400 }
			);
		}

		// ペットのステータスを"認証済み"に更新
		const petRef = adminDb
			.collection("users")
			.doc(userId)
			.collection("pets")
			.doc(petId);

		// 既存のデータを取得して申請IDを保持
		const petDoc = await petRef.get();
		const petData = petDoc.data();

		await petRef.update({
			status: "認証済み",
			approvedAt: new Date(),
			// 申請IDが存在しない場合は生成して保存
			applicationId:
				petData?.applicationId ||
				(await generateSequentialApplicationId()),
		});

		return NextResponse.json({
			success: true,
			message: "ペットの承認が完了しました",
		});
	} catch (error: unknown) {
		console.error("Error in /api/admin/approve:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Unknown error occurred",
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
