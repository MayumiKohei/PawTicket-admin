import { NextResponse } from "next/server";

export async function POST() {
	try {
		// レスポンスを作成
		const response = NextResponse.json({
			success: true,
			message: "ログアウトしました",
		});

		// クッキーを削除（maxAge: 0で即座に期限切れにする）
		response.cookies.set("admin-session", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 0,
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("ログアウトエラー:", error);
		return NextResponse.json(
			{ success: false, message: "ログアウトに失敗しました" },
			{ status: 500 }
		);
	}
}
