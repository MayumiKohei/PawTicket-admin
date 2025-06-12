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

		await petRef.update({
			status: "認証済み",
			approvedAt: new Date(),
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
