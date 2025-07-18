// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { pawticketDb } from "../../../../lib/firebaseAdmin";

// Node.js ランタイムで実行する (Edge ランタイムでは firebase-admin が動かないため必須)
export const runtime = "nodejs";

export async function GET() {
	try {
		// ── (A) totalUsers: /users コレクションのドキュメント数を取得 ────────────
		const usersSnapshot = await pawticketDb.collection("users").get();
		const totalUsers = usersSnapshot.size;

		// ── (B & C) 一時的な回避策: 各ユーザーのpetsを個別に取得して集計 ────────────
		let pendingCount = 0;
		let approvedCount = 0;

		// 全ユーザーのpetsサブコレクションを順次取得
		for (const userDoc of usersSnapshot.docs) {
			try {
				const petsSnapshot = await pawticketDb
					.collection("users")
					.doc(userDoc.id)
					.collection("pets")
					.get();

				petsSnapshot.docs.forEach((petDoc) => {
					const petData = petDoc.data();
					if (petData.status === "申請中") {
						pendingCount++;
					} else if (petData.status === "認証済み") {
						approvedCount++;
					}
				});
			} catch (error) {
				console.warn(
					`Failed to fetch pets for user ${userDoc.id}:`,
					error
				);
				// 個別のユーザーのエラーは無視して続行
			}
		}

		// （必要ならさらに「通知件数」「最近のアクティビティ」などを追加集計できる）

		const responseData = {
			success: true,
			totalUsers,
			pendingCount,
			approvedCount,
			// notifications: 0,         // 例：通知数を別コレクションから取得したい場合など
			// recentActivities: [...],  // 例：ログコレクションから最新 5 件を取得
		};
		return NextResponse.json(responseData);
	} catch (error: unknown) {
		console.error("Error in /api/admin/dashboard:", error);
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
