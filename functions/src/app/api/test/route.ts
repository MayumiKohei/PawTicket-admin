// app/api/test/route.ts
import { NextResponse } from "next/server";
import { pawticketDb } from "../../../lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET() {
	try {
		console.log("テストAPI: Firebase Admin SDK 接続テスト開始");

		// 簡単なテスト: users コレクションのドキュメント数を取得
		const usersSnapshot = await pawticketDb.collection("users").get();
		const totalUsers = usersSnapshot.size;

		console.log(`テストAPI: 成功 - ユーザー数: ${totalUsers}`);

		return NextResponse.json({
			success: true,
			message: "Firebase Admin SDK 接続成功",
			totalUsers,
			timestamp: new Date().toISOString(),
		});
	} catch (error: unknown) {
		console.error("テストAPI: エラー", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}
