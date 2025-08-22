'use strict';

const express = require('express');
const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

// Functions 全体のデフォルト設定
setGlobalOptions({
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60,
  // minInstances: 1, // コールドスタートを避けたい場合に検討
});

// 本番（GCP）では ADC により資格情報が提供されるため initializeApp() だけでもOK。
// ここでは明示的に対象プロジェクト/バケットを指定しています。
// ※ 別プロジェクト（pawticket-6b651）にアクセスする場合は、実行SAにクロスプロジェクトの権限付与が必要です。
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'pawticket-6b651',
    storageBucket: 'pawticket-6b651.appspot.com', // ← ドメインではなく "バケット名"
  });
}
const db = admin.firestore();

const app = express();
app.use(express.json());

/** GET /api/announcements */
app.get('/api/announcements', async (_req, res) => {
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
app.post('/api/announcements', async (req, res) => {
  try {
    const { title, date, photoUrl, body } = req.body ?? {};
    if (!title || !date || !body) {
      return res.status(400).json({ success: false, message: '必須項目が不足しています' });
    }
    const now = new Date();
    const docRef = await db.collection('announcements').add({
      title,
      date, // 文字列 or Timestamp。必要に応じて new admin.firestore.Timestamp.fromDate(...)
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
app.put('/api/announcements', async (req, res) => {
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
app.delete('/api/announcements', async (req, res) => {
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
 * エクスポート名は "api" 等の別名にする（"nextjsfunc" は使わない）。
 * Hosting（Frameworks）が SSR 用に生成する関数と衝突しないようにするため。
 */
exports.api = onRequest(app);
