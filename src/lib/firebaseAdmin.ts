// lib/firebaseAdmin.ts
import { readFileSync } from "fs";
import { join } from "path";
import * as admin from "firebase-admin";
// import "firebase/storage";

// 管理用
const ptAdminServiceAccountPath = join(
	process.cwd(),
	"firebase-admin",
	"pt-admin-firebase.json"
);
const ptAdminRaw = readFileSync(ptAdminServiceAccountPath, {
	encoding: "utf-8",
});
const ptAdminServiceAccount = JSON.parse(ptAdminRaw);

// アプリ用
const pawticketAppServiceAccountPath = join(
	process.cwd(),
	"firebase-admin",
	"pawticket-app-firebase.json"
);
const pawticketAppRaw = readFileSync(pawticketAppServiceAccountPath, {
	encoding: "utf-8",
});
const pawticketAppServiceAccount = JSON.parse(pawticketAppRaw);

function getAppByName(name: string): admin.app.App | undefined {
	return admin.apps.find((app) => app?.name === name) || undefined;
}

// 管理用Admin
const ptAdminApp =
	getAppByName("pt-admin") ??
	admin.initializeApp(
		{
			credential: admin.credential.cert({
				projectId: ptAdminServiceAccount.project_id,
				clientEmail: ptAdminServiceAccount.client_email,
				privateKey: ptAdminServiceAccount.private_key.replace(
					/\\n/g,
					"\n"
				),
			}),
			storageBucket: "pt-admin-4d877.firebasestorage.app",
		},
		"pt-admin"
	);

// アプリ用Admin
const pawticketApp =
	getAppByName("pawticket-app") ??
	admin.initializeApp(
		{
			projectId: "pawticket-6b651",
			storageBucket: "pawticket-6b651.firebasestorage.app",
		},
		"pawticket-app"
	);

// デバッグ情報を出力
console.log("Firebase Admin SDK 初期化完了:", {
	ptAdminProjectId: ptAdminApp.options.projectId,
	pawticketProjectId: pawticketApp.options.projectId,
});

// エクスポート
export const ptAdminAuth = ptAdminApp.auth();
export const ptAdminDb = ptAdminApp.firestore();
export const ptAdminStorage = ptAdminApp.storage();

export const pawticketAuth = pawticketApp.auth();
export const pawticketDb = pawticketApp.firestore();
export const pawticketStorage = pawticketApp.storage();
