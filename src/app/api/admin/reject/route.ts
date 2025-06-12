import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

// Node.js ランタイムで実行する
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const { userId, petId, rejectionReason } = await request.json();

		if (!userId || !petId) {
			return NextResponse.json(
				{
					success: false,
					message: "userId と petId が必要です",
				},
				{ status: 400 }
			);
		}

		// ペットのステータスを"無効"に更新
		const petRef = adminDb
			.collection("users")
			.doc(userId)
			.collection("pets")
			.doc(petId);

		const updateData: Record<string, unknown> = {
			status: "無効",
			rejectedAt: new Date(),
		};

		// 却下理由が提供されている場合は追加
		if (rejectionReason) {
			updateData.rejectionReason = rejectionReason;
		}

		await petRef.update(updateData);

		return NextResponse.json({
			success: true,
			message: "ペットの却下が完了しました",
		});
	} catch (error: unknown) {
		console.error("Error in /api/admin/reject:", error);
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
