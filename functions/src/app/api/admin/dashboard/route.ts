// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { pawticketDb } from "../../../../lib/firebaseAdmin";

// Node.js ランタイムで実行する (Edge ランタイムでは firebase-admin が動かないため必須)
export const runtime = "nodejs";

export async function GET() {
	try {
		// 認証チェック（一時的に無効化）
		/*
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get("admin-session")?.value;

		if (!sessionCookie) {
			return NextResponse.json(
				{ success: false, message: "認証が必要です" },
				{ status: 401 }
			);
		}

		// IDトークンを検証
		try {
			const decodedToken = await getAuth().verifyIdToken(sessionCookie);
			console.log("認証成功:", decodedToken.uid);
		} catch (error) {
			console.error("トークン検証エラー:", error);
			return NextResponse.json(
				{ success: false, message: "無効なトークンです" },
				{ status: 401 }
			);
		}
		*/

		// デバッグ情報を追加
		console.log("Firebase Admin SDK 初期化確認: pawticketDb が利用可能");

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
