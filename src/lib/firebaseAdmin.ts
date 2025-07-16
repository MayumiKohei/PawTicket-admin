// lib/firebaseAdmin.ts
import { readFileSync } from "fs";
import { join } from "path";
import * as admin from "firebase-admin";
import "firebase/storage";

// ① サービスアカウント JSON のパスを組み立て
const serviceAccountPath = join(
	process.cwd(),
	"firebase-admin",
	"pt-admin-firebase.json"
);

// ② JSON ファイルを同期読み込みしてパース
//    JSON はスネークケースのキーをもつ想定
const raw = readFileSync(serviceAccountPath, { encoding: "utf-8" });
const serviceAccount = JSON.parse(raw) as {
	project_id: string;
	private_key: string;
	client_email: string;
	// その他のキーは省略
};

// ③ Admin SDK がすでに初期化済みかどうかをチェック
if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert({
			// ここで必ずスネークケースのキーを使う
			projectId: serviceAccount.project_id,
			clientEmail: serviceAccount.client_email,
			// privateKey は改行を復元する
			privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
		}),
		storageBucket: "pt-admin-4d877.firebasestorage.app", // ←ここを必ず指定
		// （必要に応じて databaseURL や storageBucket を指定）
		// databaseURL: "https://<APP_PROJECT_ID>.firebaseio.com",
		// storageBucket: "<APP_PROJECT_ID>.appspot.com",
	});
}

// ④ Exportしておく
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
