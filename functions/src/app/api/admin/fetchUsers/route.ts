// app/api/admin/fetchUsers/route.ts
import { NextResponse } from "next/server";
import { pawticketDb } from "../../../../lib/firebaseAdmin";

// この API は Node.js ランタイムで実行
export const runtime = "nodejs";

export async function GET() {
	try {
		// Firestore の users コレクションを取得
		const snapshot = await pawticketDb.collection("users").get();
		const users = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		return NextResponse.json({ success: true, users });
	} catch (error: unknown) {
		console.error("Error fetching users:", error);
		const message =
			error instanceof Error ? error.message : "Unknown error occurred";
		return NextResponse.json({ success: false, message }, { status: 500 });
	}
}
