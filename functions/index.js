const express = require('express');
const admin = require('firebase-admin');
const next = require('next');

// Firebase Admin 初期化
if (!admin.apps.length) {
  // 本番環境では自動的にサービスアカウントが使用される
  admin.initializeApp({
    projectId: "pawticket-6b651",
    storageBucket: "pawticket-6b651.firebasestorage.app",
  });
}
const db = admin.firestore();

// pawticket-app プロジェクト用の Admin SDK 初期化
let pawticketApp;
try {
  pawticketApp = admin.app('pawticket-app');
} catch (error) {
  // 包括的な認証方法を使用
  let credential;
  
  // 1. 環境変数が設定されている場合は環境変数を使用
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    console.log('環境変数を使用してFirebase Admin SDKを初期化');
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }
  // 2. sa.jsonファイルが存在する場合はsa.jsonを使用
  else {
    const fs = require('fs');
    const path = require('path');
    const saPath = path.join(__dirname, 'sa.json');
    console.log('sa.json パス:', saPath);
    console.log('sa.json 存在:', fs.existsSync(saPath));
    
    if (fs.existsSync(saPath)) {
      try {
        const serviceAccount = require('./sa.json');
        console.log('sa.json 読み込み成功, project_id:', serviceAccount.project_id);
        credential = admin.credential.cert(serviceAccount);
      } catch (saError) {
        console.error('sa.json 読み込みエラー:', saError);
        console.log('Application Default Credentialsを使用');
        credential = admin.credential.applicationDefault();
      }
    } else {
      console.log('sa.jsonが見つからないため、Application Default Credentialsを使用');
      credential = admin.credential.applicationDefault();
    }
  }
  
  pawticketApp = admin.initializeApp({
    credential,
    projectId: "pawticket-6b651",
    storageBucket: "pawticket-6b651.firebasestorage.app",
  }, 'pawticket-app');
}
const pawticketDb = pawticketApp.firestore();

// グローバル変数として設定（Next.js API ルートで使用）
global.pawticketDb = pawticketDb;

// Next.js アプリを最初に初期化
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, conf: { distDir: '.next' } });
const handle = nextApp.getRequestHandler();

// Next.jsアプリを事前に準備
let isNextAppReady = false;
const prepareNextApp = async () => {
  if (!isNextAppReady) {
    await nextApp.prepare();
    isNextAppReady = true;
  }
};

// Express アプリ作成
const app = express();
app.use(express.json());

// お知らせ CRUD エンドポイント
app.get('/api/announcements', async (req, res) => {
  try {
    const snapshot = await db
      .collection('announcements')
      .orderBy('date', 'desc')
      .get();
    const announcements = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ success: false, message: String(error) });
  }
});

app.post('/api/announcements', async (req, res) => {
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
    console.error('Create announcement error:', error);
    res.status(500).json({ success: false, message: String(error) });
  }
});

app.put('/api/announcements', async (req, res) => {
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
    console.error('Update announcement error:', error);
    res.status(500).json({ success: false, message: String(error) });
  }
});

app.delete('/api/announcements', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'IDが必要です' });
    }
    await db.collection('announcements').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ success: false, message: String(error) });
  }
});

// Next.js SSR 用ハンドラ（すべてのその他のルートをキャッチ）
app.all('*', async (req, res) => {
  try {
    await prepareNextApp();
    return handle(req, res);
  } catch (error) {
    console.error('Next.js SSR Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Firebase Functionsとしてエクスポート
const functions = require('firebase-functions/v2');
exports.nextjsfunc = functions.https.onRequest({
  memory: '512MiB',
  timeoutSeconds: 60,
  region: 'us-central1'  // firebase.jsonと一致させる
}, app);