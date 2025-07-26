import { NextResponse } from "next/server";
import { pawticketDb } from "../../../../lib/firebaseAdmin";

// Node.js ランタイムで実行する
export const runtime = "nodejs";

// 次の申請IDを取得する関数
export async function GET() {
	try {
		const counterRef = pawticketDb
			.collection("system")
			.doc("applicationCounter");
		const counterDoc = await counterRef.get();

		if (!counterDoc.exists) {
			// カウンターが存在しない場合は初期化
			await counterRef.set({ currentId: 1 });
			return NextResponse.json({ nextId: 1 });
		}

		const counterData = counterDoc.data();
		const currentId = counterData?.currentId || 1;

		return NextResponse.json({ nextId: currentId });
	} catch (error: unknown) {
		console.error("Error in /api/admin/application-counter:", error);
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

// 申請IDを生成してカウンターをインクリメントする関数
export async function POST() {
	try {
		const counterRef = pawticketDb
			.collection("system")
			.doc("applicationCounter");

		// トランザクションを使用してカウンターを安全にインクリメント
		const result = await pawticketDb.runTransaction(async (transaction) => {
			const counterDoc = await transaction.get(counterRef);

			let currentId = 1;
			if (counterDoc.exists) {
				currentId = counterDoc.data()?.currentId || 1;
			}

			// 次のIDを計算
			const nextId = currentId + 1;

			// カウンターを更新
			transaction.set(counterRef, { currentId: nextId });

			return currentId;
		});

		// 申請IDを生成（P000001形式）
		const applicationId = `P${String(result).padStart(6, "0")}`;

		return NextResponse.json({
			success: true,
			applicationId: applicationId,
			nextId: result + 1,
		});
	} catch (error: unknown) {
		console.error("Error in /api/admin/application-counter:", error);
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
