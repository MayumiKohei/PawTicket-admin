import { NextRequest, NextResponse } from "next/server";

// Node.js ランタイムで実行する
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			return NextResponse.json(
				{ success: false, message: "IDトークンが必要です" },
				{ status: 400 }
			);
		}

		// Firebase Admin SDKでIDトークンを検証（オプション）
		// const decodedToken = await admin.auth().verifyIdToken(idToken);

		// 24時間（86400秒）の有効期限
		const maxAge = 24 * 60 * 60;

		// レスポンスを作成
		const response = NextResponse.json({
			success: true,
			message: "ログインセッションが設定されました",
		});

		// HttpOnlyクッキーを設定
		response.cookies.set("admin-session", idToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // 本番環境でのみSecure
			sameSite: "strict",
			maxAge: maxAge,
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("ログインセッション設定エラー:", error);
		return NextResponse.json(
			{ success: false, message: "セッション設定に失敗しました" },
			{ status: 500 }
		);
	}
}
