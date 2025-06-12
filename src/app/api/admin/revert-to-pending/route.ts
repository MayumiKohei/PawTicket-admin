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

		// ペットのステータスを"承認待ち"に戻す
		const petRef = adminDb
			.collection("users")
			.doc(userId)
			.collection("pets")
			.doc(petId);

		// approvedAtフィールドを削除し、statusを承認待ちに戻す
		await petRef.update({
			status: "申請中",
			approvedAt: null,
		});

		return NextResponse.json({
			success: true,
			message: "ペットを承認待ちに戻しました",
		});
	} catch (error: unknown) {
		console.error("Error in /api/admin/revert-to-pending:", error);
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
