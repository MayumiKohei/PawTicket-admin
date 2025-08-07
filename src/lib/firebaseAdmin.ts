// lib/firebaseAdmin.ts
import { readFileSync } from "fs";
import { join } from "path";
import * as admin from "firebase-admin";
// import "firebase/storage";

function getAppByName(name: string): admin.app.App | undefined {
	return admin.apps.find((app) => app?.name === name) || undefined;
}

// 認証方法を決定する関数
function getPawticketCredential(): admin.credential.Credential {
	// GOOGLE_APPLICATION_CREDENTIALS が設定されている場合はそれを使用
	if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
		console.log(
			"GOOGLE_APPLICATION_CREDENTIALSを使用してFirebase Admin SDKを初期化"
		);
		return admin.credential.applicationDefault();
	}

	// ローカル環境では sa.json を使用
	const saPath = join(process.cwd(), "sa.json");
	try {
		const saRaw = readFileSync(saPath, { encoding: "utf-8" });
		const saServiceAccount = JSON.parse(saRaw);
		console.log("sa.jsonを使用してFirebase Admin SDKを初期化");
		return admin.credential.cert({
			projectId: saServiceAccount.project_id,
			clientEmail: saServiceAccount.client_email,
			privateKey: saServiceAccount.private_key.replace(/\\n/g, "\n"),
		});
	} catch (error) {
		console.log(
			"sa.jsonが見つからないため、Application Default Credentialsを使用"
		);
		return admin.credential.applicationDefault();
	}
}

// アプリ用Admin - 包括的な認証方法を使用
const pawticketApp =
	getAppByName("pawticket-app") ??
	admin.initializeApp(
		{
			credential: getPawticketCredential(),
			projectId: "pawticket-6b651",
			storageBucket: "pawticket-6b651.firebasestorage.app",
		},
		"pawticket-app"
	);

// デバッグ情報を出力
console.log("Firebase Admin SDK 初期化完了:", {
	pawticketProjectId: pawticketApp.options.projectId,
	credentialType: pawticketApp.options.credential ? "設定済み" : "未設定",
});

// エクスポート
export const pawticketAuth = pawticketApp.auth();
export const pawticketDb = pawticketApp.firestore();
export const pawticketStorage = pawticketApp.storage();
