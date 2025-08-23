'use strict';

const express = require('express');
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

/**
 * Firebase Admin 初期化（ADC / クロスプロジェクト）
 * - ここでは「pawticket-6b651」の Firestore/Storage にアクセスしたい想定。
 * - Cloud Functions(Gen2) では Application Default Credentials(ADC) が使われるので
 *   鍵ファイルは不要。実行SAに pawticket 側の権限を付与しておくこと。
 *   例: roles/datastore.user（必要に応じて roles/firestore.user）
 */
if (!admin.apps.length) {
  admin.initializeApp({
    // ★ 認証は ADC（デフォルト）を使用するので、credential は渡さない
    projectId: 'pawticket-6b651',
    // 新形式のデフォルトバケット名（Firebase コンソールの表示に合わせる）
    storageBucket: 'pawticket-6b651.firebasestorage.app',
  });
}
const app = admin.app();
const db = admin.firestore();

// デバッグ：どの認証経路か確認（本番でも harmless な範囲で）
console.log('Functions Admin initialized:', {
  projectId: app.options.projectId,
  credentialClass: app.options.credential?.constructor?.name, // 例: GoogleAuthCredential = ADC
});

const api = express();
api.use(express.json());

/** GET /api/announcements */
api.get('/api/announcements', async (_req, res) => {
  try {
    const snap = await db.collection('announcements').orderBy('date', 'desc').get();
    const announcements = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ success: true, announcements });
  } catch (err) {
    console.error('Get announcements error:', err);
    res.status(500).json({ success: false, message: String(err) });
  }
});

/** POST /api/announcements  body: { title, date, photoUrl?, body } */
api.post('/api/announcements', async (req, res) => {
  try {
    const { title, date, photoUrl, body } = req.body ?? {};
    if (!title || !date || !body) {
      return res.status(400).json({ success: false, message: '必須項目が不足しています' });
    }
    const now = new Date();
    const docRef = await db.collection('announcements').add({
      title,
      date,
      photoUrl: photoUrl || null,
      body,
      createdAt: now,
      updatedAt: now,
    });
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ success: false, message: String(err) });
  }
});

/** PUT /api/announcements  body: { id, title, date, photoUrl?, body } */
api.put('/api/announcements', async (req, res) => {
  try {
    const { id, title, date, photoUrl, body } = req.body ?? {};
    if (!id || !title || !date || !body) {
      return res.status(400).json({ success: false, message: '必須項目が不足しています' });
    }
    await db.collection('announcements').doc(id).update({
      title,
      date,
      photoUrl: photoUrl || null,
      body,
      updatedAt: new Date(),
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Update announcement error:', err);
    res.status(500).json({ success: false, message: String(err) });
  }
});

/** DELETE /api/announcements  body: { id } */
api.delete('/api/announcements', async (req, res) => {
  try {
    const { id } = req.body ?? {};
    if (!id) return res.status(400).json({ success: false, message: 'IDが必要です' });
    await db.collection('announcements').doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error('Delete announcement error:', err);
    res.status(500).json({ success: false, message: String(err) });
  }
});

/**
 * エクスポート名は "api" など（"nextjsfunc" は使わない）。
 * リージョンやメモリは per-function オプションで指定（firebase.json では指定しない）。
 */
exports.api = onRequest(
  { region: 'us-central1', memory: '512MiB', timeoutSeconds: 60 },
  api
);
