// src/lib/firebaseAdmin.ts
import * as admin from "firebase-admin";

/**
 * Firebase Admin（pawticket 用）初期化
 * 優先順位:
 *   1) 環境変数 FIREBASE_SERVICE_ACCOUNT_JSON に入っているSA JSON（鍵ファイルは置かない）
 *   2) ADC（Application Default Credentials）
 *
 * 本番（Hosting/Cloud Run/Functions）では 2) の ADC が使われます。
 * その場合は「実行サービスアカウント」に pawticket 側プロジェクトへの権限を付与してください。
 */
function initPawticketApp(): admin.app.App {
	// 既に初期化済みならそれを使う（開発時のホットリロード対策）
	try {
		return admin.app("pawticket-app");
	} catch {
		/* noop - 未初期化なので続行 */
	}

	// 1) 環境変数のサービスアカウント JSON を優先
	const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
	if (json) {
		try {
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
					// バケット名は <project>.appspot.com（ドメインではなくバケット名）
					storageBucket: `${sa.project_id}.appspot.com`,
					projectId: sa.project_id,
				},
				"pawticket-app"
			);
		} catch (e) {
			// JSON が壊れていても停止させず ADC にフォールバック
			console.warn(
				"FIREBASE_SERVICE_ACCOUNT_JSON の解析に失敗。ADC にフォールバックします。",
				e instanceof Error ? e.message : e
			);
		}
	}

	// 2) ADC（Application Default Credentials）
	// Cloud Run/Hosting(SSR)/Functions 上ではこれでOK。
	// ※ クロスプロジェクトアクセス時は、実行SAに pawticket-6b651 側の権限付与が必要。
	return admin.initializeApp(
		{
			credential: admin.credential.applicationDefault(),
			projectId: "pawticket-6b651",
			storageBucket: "pawticket-6b651.appspot.com",
		},
		"pawticket-app"
	);
}

const pawticketApp = initPawticketApp();

// 秘密情報は出さずに、どの認証経路かだけを軽くログ
console.log("Firebase Admin initialized:", {
	appName: pawticketApp.name,
	projectId: pawticketApp.options.projectId,
	credentialClass: pawticketApp.options.credential?.constructor?.name, // 例: "GoogleAuthCredential" なら ADC
});

export const pawticketAuth = pawticketApp.auth();
export const pawticketDb = pawticketApp.firestore();
export const pawticketStorage = pawticketApp.storage();
