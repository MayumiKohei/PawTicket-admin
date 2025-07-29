import { NextRequest, NextResponse } from "next/server";
import { ptAdminDb } from "../../../../lib/firebaseAdmin";

export const runtime = "nodejs";

// GET: 一覧取得
export async function GET() {
	try {
		const snapshot = await ptAdminDb
			.collection("announcements")
			.orderBy("date", "desc")
			.get();
		const announcements = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		return NextResponse.json({ success: true, announcements });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: String(error) },
			{ status: 500 }
		);
	}
}

// POST: 新規作成
export async function POST(req: NextRequest) {
	try {
		const { title, date, photoUrl, body } = await req.json();
		if (!title || !date || !body) {
			return NextResponse.json(
				{ success: false, message: "必須項目が不足しています" },
				{ status: 400 }
			);
		}
		const docRef = await ptAdminDb.collection("announcements").add({
			title,
			date,
			photoUrl: photoUrl || null,
			body,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		return NextResponse.json({ success: true, id: docRef.id });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: String(error) },
			{ status: 500 }
		);
	}
}

// PUT: 編集
export async function PUT(req: NextRequest) {
	try {
		const { id, title, date, photoUrl, body } = await req.json();
		if (!id || !title || !date || !body) {
			return NextResponse.json(
				{ success: false, message: "必須項目が不足しています" },
				{ status: 400 }
			);
		}
		await ptAdminDb
			.collection("announcements")
			.doc(id)
			.update({
				title,
				date,
				photoUrl: photoUrl || null,
				body,
				updatedAt: new Date(),
			});
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: String(error) },
			{ status: 500 }
		);
	}
}

// DELETE: 削除
export async function DELETE(req: NextRequest) {
	try {
		const { id } = await req.json();
		if (!id) {
			return NextResponse.json(
				{ success: false, message: "IDが必要です" },
				{ status: 400 }
			);
		}
		await ptAdminDb.collection("announcements").doc(id).delete();
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: String(error) },
			{ status: 500 }
		);
	}
}
