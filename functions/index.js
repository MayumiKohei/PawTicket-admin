/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const next = require("next");

// 型エラー対策: @types/express, @types/firebase-functions, @types/firebase-admin など型定義パッケージのインストールが必要です
// npm install --save-dev @types/express @types/firebase-functions @types/firebase-admin

// Firebase Admin初期化（Cloud Functions環境ではこれだけでOK）
if (!admin.apps.length) {
	admin.initializeApp();
}
const db = admin.firestore();

// お知らせCRUD
exports.announcements = functions.https.onRequest(async (req, res) => {
	try {
		if (req.method === "GET") {
			// 一覧取得
			const snapshot = await db
				.collection("announcements")
				.orderBy("date", "desc")
				.get();
			const announcements = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			res.json({ success: true, announcements });
		} else if (req.method === "POST") {
			// 新規作成
			const { title, date, photoUrl, body } = req.body;
			if (!title || !date || !body) {
				res.status(400).json({
					success: false,
					message: "必須項目が不足しています",
				});
				return;
			}
			const docRef = await db.collection("announcements").add({
				title,
				date,
				photoUrl: photoUrl || null,
				body,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			res.json({ success: true, id: docRef.id });
		} else if (req.method === "PUT") {
			// 編集
			const { id, title, date, photoUrl, body } = req.body;
			if (!id || !title || !date || !body) {
				res.status(400).json({
					success: false,
					message: "必須項目が不足しています",
				});
				return;
			}
			await db
				.collection("announcements")
				.doc(id)
				.update({
					title,
					date,
					photoUrl: photoUrl || null,
					body,
					updatedAt: new Date(),
				});
			res.json({ success: true });
		} else if (req.method === "DELETE") {
			// 削除
			const { id } = req.body;
			if (!id) {
				res.status(400).json({
					success: false,
					message: "IDが必要です",
				});
				return;
			}
			await db.collection("announcements").doc(id).delete();
			res.json({ success: true });
		} else {
			res.status(405).json({
				success: false,
				message: "Method Not Allowed",
			});
		}
	} catch (error) {
		res.status(500).json({ success: false, message: String(error) });
	}
});

// Next.js SSR/API用Cloud Function
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, conf: { distDir: ".next" } });
const handle = app.getRequestHandler();

exports.nextjsFunc = functions.https.onRequest((req, res) => {
	return app.prepare().then(() => handle(req, res));
});
