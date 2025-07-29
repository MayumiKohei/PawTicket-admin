// lib/firebase.ts
import { initializeApp, getApp, FirebaseApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/** ─── プロジェクト B の設定（Next.js 側で使っているデフォルト） ─────────────────── */
const firebaseConfigB = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** ─── プロジェクト A の設定（React Native で使っている既存のプロジェクト） ─────────── */
const firebaseConfigA = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_EXPO_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_EXPO_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_EXPO_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_EXPO_STORAGE_BUCKET,
	messagingSenderId:
		process.env.NEXT_PUBLIC_FIREBASE_EXPO_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_EXPO_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_EXPO_MEASUREMENT_ID,
};

/** ─── Firebase アプリを初期化 ─────────────────────────────────────────────── */
// Next.js のホットリロード時に二重初期化を避けるため、まず既存アプリの有無をチェックする。
let appB: FirebaseApp;

// クライアントサイドでのみ初期化
if (typeof window !== "undefined") {
	if (getApps().length === 0) {
		appB = initializeApp(firebaseConfigB);
	} else {
		appB = getApp();
	}
} else {
	// サーバーサイドではダミーアプリ
	appB = {} as FirebaseApp;
}

// 「アプリ A」は別名をつけて初期化。すでに同名のアプリがあれば再取得
const APP_EXPO_NAME = "appExpo"; // 任意の名前をつける
let appA: FirebaseApp;
try {
	appA = getApp(APP_EXPO_NAME);
} catch {
	appA = initializeApp(firebaseConfigA, APP_EXPO_NAME);
}

/** ─── 各プロジェクトごとにサービスを取得 ─────────────────────────────────── */
// プロジェクト B 用
export const authB = typeof window !== "undefined" ? getAuth(appB) : null;
export const firestoreB =
	typeof window !== "undefined" ? getFirestore(appB) : null;
export const storageB = typeof window !== "undefined" ? getStorage(appB) : null;

// プロジェクト A 用
export const firestoreA =
	typeof window !== "undefined" ? getFirestore(appA) : null;
export const storageA = typeof window !== "undefined" ? getStorage(appA) : null;
