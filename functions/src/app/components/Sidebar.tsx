"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { authB } from "../firebase";
import styles from "../index.module.scss";
import { Icon } from "./Icon";

function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const [currentTime, setCurrentTime] = useState("");
	// const { user, loading: authLoading, isAdmin } = useAuth(); // 未使用のため削除

	const navItems = [
		{ name: "ダッシュボード", path: "/", icon: "dashboard" as const },
		{ name: "承認待ち", path: "/pending", icon: "clock" as const },
		{ name: "承認済み", path: "/approved", icon: "check-circle" as const },
		{ name: "却下済み", path: "/rejected", icon: "x-circle" as const },
		{ name: "プッシュ通知", path: "/notifications", icon: "bell" as const },
		{
			name: "お知らせ一覧",
			path: "/notifications/list",
			icon: "bell" as const,
		},
		{
			name: "お知らせ投稿",
			path: "/notifications/post",
			icon: "bell" as const,
		},
	];

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

	const handleLogout = async () => {
		try {
			await signOut(authB);
			await fetch("/api/auth/logout", { method: "POST" });
			router.push("/auth/login");
		} catch (error) {
			console.error("ログアウトエラー:", error);
		}
	};

	return (
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
									pathname === item.path ? styles.active : ""
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
	);
}

export { Sidebar };
