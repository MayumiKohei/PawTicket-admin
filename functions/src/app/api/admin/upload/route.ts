import { NextRequest, NextResponse } from "next/server";
import { ptAdminStorage } from "@/lib/firebaseAdmin";

const bucket = ptAdminStorage.bucket();

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json(
				{ success: false, message: "ファイルがありません" },
				{ status: 400 }
			);
		}

		// ファイル名を生成（重複を避けるためタイムスタンプを追加）
		const timestamp = Date.now();
		const fileName = `notifications/${timestamp}_${file.name}`;

		// ファイルをバッファに変換
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Firebase Storageにアップロード
		const fileUpload = bucket.file(fileName);
		await fileUpload.save(buffer, {
			metadata: {
				contentType: file.type,
			},
		});

		// 公開URLを取得
		const [url] = await fileUpload.getSignedUrl({
			action: "read",
			expires: "03-01-2500", // 長期間有効
		});

		return NextResponse.json({
			success: true,
			url: url,
			fileName: fileName,
		});
	} catch (error) {
		console.error("アップロードエラー:", error);
		return NextResponse.json(
			{ success: false, message: "アップロードに失敗しました" },
			{ status: 500 }
		);
	}
}
