"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "./components/AuthProvider";
import styles from "./index.module.scss";
import { Sidebar } from "./components/Sidebar";

// アイコンコンポーネントは変更なし
// ダッシュボードコンテンツコンポーネント
function DashboardContent() {
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
	// コンポーネントマウント時にダッシュボードデータを取得
	useEffect(() => {
		fetchDashboardData();
	}, []);

	return (
		<div className={styles.dashboard}>
			{/* サイドバー */}
			<Sidebar />

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
									{/* アイコンはSidebarに統一したのでここでは省略可 */}
								</div>
								<h4>承認待ち</h4>
								<div className={styles.value}>
									{dashboardStats.pending}
								</div>
							</div>

							<div className={styles["stat-card"]}>
								<div className={styles.icon}></div>
								<h4>承認済み</h4>
								<div className={styles.value}>
									{dashboardStats.approved}
								</div>
							</div>

							<div className={styles["stat-card"]}>
								<div className={styles.icon}></div>
								<h4>通知送信数</h4>
								<div className={styles.value}>
									{dashboardStats.notifications}
								</div>
							</div>

							<div className={styles["stat-card"]}>
								<div className={styles.icon}></div>
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
