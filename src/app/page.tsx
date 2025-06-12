"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { authB } from "./firebase"; // 管理画面用の Firebase Client SDK（auth）のみ
import { useAuth } from "./components/AuthProvider";
import styles from "./index.module.scss";

// アイコンコンポーネントは変更なし
const Icon = ({ name }: { name: string }) => {
	if (name === "x-circle") {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				width="24"
				height="24"
			>
				<path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z" />
			</svg>
		);
	} else if (name === "check-circle") {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				width="24"
				height="24"
			>
				<path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
			</svg>
		);
	} else if (name === "clock") {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				width="24"
				height="24"
			>
				<path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z" />
			</svg>
		);
	} else if (name === "bell") {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				width="24"
				height="24"
			>
				<path d="M12 22a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22zm7-7.414V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v4.586l-1.707 1.707A1 1 0 0 0 3 17v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1a1 1 0 0 0-.293-.707L19 14.586z" />
			</svg>
		);
	} else if (name === "dashboard") {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				width="24"
				height="24"
			>
				<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
			</svg>
		);
	} else if (name === "logout") {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				width="24"
				height="24"
			>
				<path d="M16 13v-2H7V8l-5 4 5 4v-3z" />
				<path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" />
			</svg>
		);
	}
	return null;
};

// ダッシュボードコンテンツコンポーネント
function DashboardContent() {
	const pathname = usePathname();
	const router = useRouter();

	// 変更: 集計データを API から取得するための state
	const [dashboardStats, setDashboardStats] = useState<{
		pending: number;
		approved: number;
		rejected: number;
		totalUsers: number;
		notifications: number; // 今回は常に 0 など固定でも OK
	}>({
		pending: 0,
		approved: 0,
		rejected: 0,
		totalUsers: 0,
		notifications: 0,
	});
	const [recentActivities, setRecentActivities] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);

	const handleLogout = async () => {
		try {
			// Firebase Authからサインアウト
			await signOut(authB);

			// サーバーサイドでクッキーを削除
			await fetch("/api/auth/logout", {
				method: "POST",
			});

			// ログインページにリダイレクト
			router.push("/auth/login");
		} catch (error) {
			console.error("ログアウトエラー:", error);
		}
	};

	// ── サーバー側 API を叩いて集計結果を取得 ───────────────────────────────────
	const fetchDashboardData = async () => {
		try {
			setLoading(true);

			const res = await fetch("/api/admin/dashboard");
			const data = await res.json();
			if (!data.success) {
				console.error("API からの取得に失敗:", data.message);
				return;
			}

			// API から返ってきた値を state にセット
			setDashboardStats({
				totalUsers: data.totalUsers,
				pending: data.pendingCount,
				approved: data.approvedCount,
				rejected: data.rejectedCount ?? 0,
				notifications: data.notifications ?? 0,
			});

			// もし「recentActivities」が返ってくるならセット
			if (Array.isArray(data.recentActivities)) {
				setRecentActivities(data.recentActivities);
			} else {
				setRecentActivities([]);
			}
		} catch (error) {
			console.error("ダッシュボードデータの取得に失敗しました:", error);
			setDashboardStats({
				pending: 0,
				approved: 0,
				rejected: 0,
				totalUsers: 0,
				notifications: 0,
			});
			setRecentActivities(["データの取得に失敗しました"]);
		} finally {
			setLoading(false);
		}
	};

	// 現在時刻を更新するフック（変更なし）
	const [currentTime, setCurrentTime] = useState("");
	useEffect(() => {
		const updateClock = () => {
			const now = new Date();
			const timeStr = now.toLocaleTimeString("ja-JP", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
			setCurrentTime(timeStr);
		};
		updateClock();
		const timer = setInterval(updateClock, 1000);
		return () => clearInterval(timer);
	}, []);

	// コンポーネントマウント時にダッシュボードデータを取得
	useEffect(() => {
		fetchDashboardData();
	}, []);

	// ナビゲーションアイテム（変更なし）
	const navItems = [
		{ name: "ダッシュボード", path: "/", icon: "dashboard" },
		{ name: "承認待ち", path: "/pending", icon: "clock" },
		{ name: "承認済み", path: "/approved", icon: "check-circle" },
		{ name: "却下済み", path: "/rejected", icon: "x-circle" },
		{ name: "プッシュ通知", path: "/notifications", icon: "bell" },
	];

	return (
		<div className={styles.dashboard}>
			{/* サイドバー */}
			<aside className={styles.sidebar}>
				<div className={styles.sidebar__header}>
					<h1>PawTicket Admin</h1>
					<p>管理パネル</p>
				</div>

				<nav className={styles.sidebar__nav}>
					<ul>
						{navItems.map((item) => (
							<li key={item.path}>
								<Link
									href={item.path}
									className={
										pathname === item.path
											? styles.active
											: ""
									}
								>
									<Icon name={item.icon} />
									{item.name}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				<div className={styles.sidebar__footer}>
					<div>現在時刻: {currentTime}</div>
					<button
						onClick={handleLogout}
						style={{
							background: "none",
							border: "none",
							color: "#666",
							cursor: "pointer",
							fontSize: "0.9rem",
							marginTop: "0.5rem",
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
						}}
					>
						<Icon name="logout" />
						ログアウト
					</button>
				</div>
			</aside>

			{/* メインコンテンツ */}
			<main className={styles.content}>
				<div className={styles.content__header}>
					<h2>ダッシュボード</h2>
					<button
						onClick={fetchDashboardData}
						style={{
							padding: "0.5rem 1rem",
							backgroundColor: "#0070f3",
							color: "white",
							border: "none",
							borderRadius: "0.25rem",
							cursor: "pointer",
						}}
					>
						データを更新
					</button>
				</div>

				{/* 概要カード */}
				<div className={styles.content__card}>
					<h3>概要</h3>
					{loading ? (
						<div style={{ textAlign: "center", padding: "2rem" }}>
							<p>データを読み込み中...</p>
						</div>
					) : (
						<div className={styles.content__card__stats}>
							<div className={styles["stat-card"]}>
								<div className={styles.icon}>
									<Icon name="clock" />
								</div>
								<h4>承認待ち</h4>
								<div className={styles.value}>
									{dashboardStats.pending}
								</div>
							</div>

							<div className={styles["stat-card"]}>
								<div className={styles.icon}>
									<Icon name="check-circle" />
								</div>
								<h4>承認済み</h4>
								<div className={styles.value}>
									{dashboardStats.approved}
								</div>
							</div>

							<div className={styles["stat-card"]}>
								<div className={styles.icon}>
									<Icon name="bell" />
								</div>
								<h4>通知送信数</h4>
								<div className={styles.value}>
									{dashboardStats.notifications}
								</div>
							</div>

							<div className={styles["stat-card"]}>
								<div className={styles.icon}>
									<Icon name="dashboard" />
								</div>
								<h4>総ユーザー数</h4>
								<div className={styles.value}>
									{dashboardStats.totalUsers}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* 最近の活動 */}
				<div className={styles.content__card}>
					<h3>最近の活動</h3>
					{loading && <p>データを読み込み中...</p>}
					{!loading && recentActivities.length > 0 && (
						<ul style={{ listStyle: "none", padding: 0 }}>
							{recentActivities.map((activity, index) => (
								<li
									key={`activity-${activity.slice(
										0,
										20
									)}-${index}`}
									style={{
										padding: "0.5rem 0",
										borderBottom: "1px solid #eee",
										fontSize: "0.9rem",
									}}
								>
									• {activity}
								</li>
							))}
						</ul>
					)}
					{!loading && recentActivities.length === 0 && (
						<p>最近のアクティビティはありません。</p>
					)}
				</div>
			</main>
		</div>
	);
}

// 認証チェックとリダイレクト処理
export default function Dashboard() {
	const { user, loading: authLoading, isAdmin } = useAuth();
	const router = useRouter();

	// 認証状態に応じてリダイレクト処理
	useEffect(() => {
		if (!authLoading) {
			if (!user) {
				// ログインしていない場合はログインページにリダイレクト
				router.push("/auth/login");
				return;
			}

			if (!isAdmin) {
				// ログインしているが管理者権限がない場合
				console.warn("管理者権限が必要です");
			}
		}
	}, [user, authLoading, isAdmin, router]);

	if (authLoading) {
		return <div className={styles.authLoading}>認証情報を確認中...</div>;
	}

	if (!user) {
		// リダイレクト中の表示
		return (
			<div className={styles.authLoading}>
				ログインページにリダイレクト中...
			</div>
		);
	}

	if (!isAdmin) {
		return <div className={styles.authError}>管理者権限が必要です</div>;
	}

	return <DashboardContent />;
}
