const express = require('express');
const admin = require('firebase-admin');
const next = require('next');

// Firebase Admin 初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-admin/pt-admin-firebase.json'))
  });
}
const db = admin.firestore();

// Express アプリ作成
const app = express();
app.use(express.json());

// お知らせ CRUD
app.get('/announcements', async (req, res) => {
  try {
    const snapshot = await db
      .collection('announcements')
      .orderBy('date', 'desc')
      .get();
    const announcements = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: String(error) });
  }
});

app.post('/announcements', async (req, res) => {
  try {
    const { title, date, photoUrl, body } = req.body;
    if (!title || !date || !body) {
      return res.status(400).json({ success: false, message: '必須項目が不足しています' });
    }
    const docRef = await db.collection('announcements').add({
      title,
      date,
      photoUrl: photoUrl || null,
      body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, message: String(error) });
  }
});

app.put('/announcements', async (req, res) => {
  try {
    const { id, title, date, photoUrl, body } = req.body;
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
  } catch (error) {
    res.status(500).json({ success: false, message: String(error) });
  }
});

app.delete('/announcements', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'IDが必要です' });
    }
    await db.collection('announcements').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: String(error) });
  }
});

// Next.js SSR 用ハンドラ
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, conf: { distDir: '.next' } });
const handle = nextApp.getRequestHandler();

app.all('/*', async (req, res) => {
  try {
    await nextApp.prepare();
    return handle(req, res);
  } catch (error) {
    console.error('Next.js SSR Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: error.stack 
    });
  }
});

// Firebase Functionsとしてエクスポート
const functions = require('firebase-functions/v2');
exports.nextjsfunc = functions.https.onRequest({
  memory: '512MiB',
  timeoutSeconds: 60
}, app);
