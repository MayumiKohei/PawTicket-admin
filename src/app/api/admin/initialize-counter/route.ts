import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

// Node.js ランタイムで実行する
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const { startId } = await request.json();

		// 開始IDを指定（デフォルトは1）
		const initialId = startId || 1;

		// カウンターを初期化
		const counterRef = adminDb
			.collection("system")
			.doc("applicationCounter");
		await counterRef.set({ currentId: initialId });

		return NextResponse.json({
			success: true,
			message: `申請IDカウンターを ${initialId} で初期化しました`,
			currentId: initialId,
		});
	} catch (error: unknown) {
		console.error("Error in /api/admin/initialize-counter:", error);
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

// 現在のカウンター値を取得
export async function GET() {
	try {
		const counterRef = adminDb
			.collection("system")
			.doc("applicationCounter");
		const counterDoc = await counterRef.get();

		if (!counterDoc.exists) {
			return NextResponse.json({
				success: true,
				message: "カウンターが初期化されていません",
				currentId: null,
			});
		}

		const counterData = counterDoc.data();
		const currentId = counterData?.currentId || 1;

		return NextResponse.json({
			success: true,
			currentId: currentId,
			nextApplicationId: `P${String(currentId).padStart(6, "0")}`,
		});
	} catch (error: unknown) {
		console.error("Error in /api/admin/initialize-counter:", error);
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
