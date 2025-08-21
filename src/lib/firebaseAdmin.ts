// lib/firebaseAdmin.ts
import * as admin from "firebase-admin";

/**
 * 推奨：環境変数 FIREBASE_SERVICE_ACCOUNT_JSON（pawticket用のSA JSON丸ごと）を使う。
 * 無ければ ADC（Application Default Credentials）にフォールバック。
 *
 * - GCP上（Cloud Functions/Run/Hosting(SSR)）では initializeApp() だけでOK（ADC）。
 * - ローカルは `gcloud auth application-default login` でもOK。必要なら env に JSON を入れる。
 */
function initPawticketApp(): admin.app.App {
	const existing = admin.apps.find((a) => a?.name === "pawticket-app");
	if (existing) return existing;

	// 1) 環境変数JSON（最優先）：鍵ファイルを置かないためのやり方
	const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
	if (json) {
		const sa = JSON.parse(json) as {
			project_id: string;
			client_email: string;
			private_key: string;
		};
		return admin.initializeApp(
			{
				credential: admin.credential.cert({
					projectId: sa.project_id,
					clientEmail: sa.client_email,
					privateKey: sa.private_key.replace(/\\n/g, "\n"),
				}),
				// ★ bucket名は ".appspot.com" が正しい（ドメインではなくバケット名）
				storageBucket: `${sa.project_id}.appspot.com`,
				projectId: sa.project_id,
			},
			"pawticket-app"
		);
	}

	// 2) ADC：GCP上ではこれでOK（関数のサービスアカウントに権限を付ける）
	//    ※ pt-admin の関数から pawticket にアクセスするなら、pt-admin のSAに pawticket 側の権限を付与するか、
	//       上の環境変数JSON（pawticket SA）で初期化してください。
	return admin.initializeApp(
		{
			credential: admin.credential.applicationDefault(),
			projectId: "pawticket-6b651",
			storageBucket: "pawticket-6b651.appspot.com", // ← 修正ポイント
		},
		"pawticket-app"
	);
}

const pawticketApp = initPawticketApp();

// 余計な秘密情報ログは出さない（鍵長やclientEmail等はログに残さない）
console.log("Firebase Admin initialized:", {
	appName: pawticketApp.name,
	projectId: pawticketApp.options.projectId,
	hasCredential: Boolean(pawticketApp.options.credential),
	// storageBucket: pawticketApp.options.storageBucket, // 必要なら
});

export const pawticketAuth = pawticketApp.auth();
export const pawticketDb = pawticketApp.firestore();
export const pawticketStorage = pawticketApp.storage();
