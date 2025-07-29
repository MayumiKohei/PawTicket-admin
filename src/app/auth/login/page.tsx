"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { authB } from "../../firebase";
import { useRouter } from "next/navigation";
import styles from "./login.module.scss";

export default function AdminLogin() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (!authB) {
			setError("認証サービスが利用できません。");
			setLoading(false);
			return;
		}

		try {
			const userCredential = await signInWithEmailAndPassword(
				authB,
				email,
				password
			);

			// 管理者UIDの確認（現在のルールに記載されているUID）
			const adminUIDs = [
				"3S6PdCwFK2TjGgQMUBnGkp9gTn53",
				"U0rr9czqZGbmR1khmfhUSuPXEtJ2",
				"3S6PdCwFK2TjGgQMUBnGkp9gTn53",
			];

			if (adminUIDs.includes(userCredential.user.uid)) {
				// IDトークンを取得
				const idToken = await userCredential.user.getIdToken();

				// サーバーサイドでHttpOnlyクッキーを設定
				const response = await fetch("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ idToken }),
				});

				const data = await response.json();

				if (data.success) {
					router.push("/");
				} else {
					setError("セッションの設定に失敗しました。");
				}
			} else {
				setError("管理者権限がありません。");
				await authB?.signOut();
			}
		} catch (error) {
			console.error("ログインエラー:", error);
			setError(
				"ログインに失敗しました。メールアドレスとパスワードを確認してください。"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.loginContainer}>
			<div className={styles.loginCard}>
				<h1>PawTicket Admin</h1>
				<h2>管理者ログイン</h2>

				<form onSubmit={handleLogin} className={styles.loginForm}>
					<div className={styles.formGroup}>
						<label htmlFor="email">メールアドレス</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder="admin@example.com"
						/>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor="password">パスワード</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							placeholder="パスワードを入力"
						/>
					</div>

					{error && <div className={styles.error}>{error}</div>}

					<button
						type="submit"
						disabled={loading}
						className={styles.loginButton}
					>
						{loading ? "ログイン中..." : "ログイン"}
					</button>
				</form>
			</div>
		</div>
	);
}
