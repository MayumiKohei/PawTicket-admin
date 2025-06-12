"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./index.module.scss";

// Font Awesome風のアイコンコンポーネント
const Icon = ({ name }: { name: string }) => {
	switch (name) {
		case "home":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
					<path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
				</svg>
			);
		case "clock-pending":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
						clipRule="evenodd"
					/>
				</svg>
			);
		case "check-approved":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
						clipRule="evenodd"
					/>
				</svg>
			);
		case "bell-notification":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
						clipRule="evenodd"
					/>
				</svg>
			);
		case "paper-plane":
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
				</svg>
			);
		default:
			return null;
	}
};

export default function NotificationsPage() {
	const pathname = usePathname();
	const [currentTime, setCurrentTime] = useState(new Date());
	const [notificationTitle, setNotificationTitle] = useState("");
	const [notificationBody, setNotificationBody] = useState("");
	const [targetGroup, setTargetGroup] = useState("all");

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => {
			clearInterval(timer);
		};
	}, []);

	const navItems = [
		{ name: "ダッシュボード", path: "/", icon: "home" },
		{ name: "承認待ち", path: "/pending", icon: "clock-pending" },
		{ name: "承認済み", path: "/approved", icon: "check-approved" },
		{
			name: "プッシュ通知",
			path: "/notifications",
			icon: "bell-notification",
		},
	];

	// 過去の通知履歴（モックデータ）
	const notificationHistory = [
		{
			id: 1,
			title: "夏季メンテナンスのお知らせ",
			body: "8月15日午前2時から5時までメンテナンスを行います。その間はサービスをご利用いただけません。",
			sentTo: "すべてのユーザー",
			sentDate: "2023/08/10 12:30",
			sentBy: "管理者1",
		},
		{
			id: 2,
			title: "ワクチン接種のリマインダー",
			body: "ペットのワクチン接種日が近づいています。動物病院での予約をお忘れなく。",
			sentTo: "一部のユーザー",
			sentDate: "2023/09/05 09:15",
			sentBy: "管理者2",
		},
		{
			id: 3,
			title: "新機能のお知らせ",
			body: "アプリに新しい機能が追加されました！ペットの健康記録を簡単に管理できるようになりました。",
			sentTo: "すべてのユーザー",
			sentDate: "2023/10/01 15:45",
			sentBy: "管理者1",
		},
	];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!notificationTitle || !notificationBody) {
			alert("タイトルと本文は必須です。");
			return;
		}

		alert(
			`通知が送信されました！\nタイトル: ${notificationTitle}\n本文: ${notificationBody}\n送信先: ${
				targetGroup === "all" ? "すべてのユーザー" : "一部のユーザー"
			}`
		);

		// 送信後にフォームをリセット
		setNotificationTitle("");
		setNotificationBody("");
		setTargetGroup("all");
	};

	return (
		<div className={styles.container}>
			{/* サイドバー */}
			<aside className={styles.sidebar}>
				<div className={styles.sidebar__header}>
					<h1 className={styles.sidebar__title}>PawTicket</h1>
					<span className={styles.sidebar__subtitle}>管理パネル</span>
				</div>

				<nav className={styles.sidebar__nav}>
					<ul className={styles.sidebar__menu}>
						{navItems.map((item) => (
							<li
								key={item.path}
								className={styles.sidebar__menuItem}
							>
								<Link
									href={item.path}
									className={`${styles.sidebar__link} ${
										pathname === item.path
											? styles.active
											: ""
									}`}
								>
									<Icon name={item.icon} />
									<span>{item.name}</span>
								</Link>
							</li>
						))}
					</ul>
				</nav>

				<div className={styles.sidebar__footer}>
					<p className={styles.sidebar__time}>
						{currentTime.toLocaleTimeString("ja-JP")}
					</p>
				</div>
			</aside>

			{/* メインコンテンツ */}
			<main className={styles.main}>
				<div className={styles.main__header}>
					<h2 className={styles.main__title}>プッシュ通知</h2>
				</div>

				<div className={styles.main__content}>
					{/* 通知送信フォーム */}
					<div className={styles.formSection}>
						<h3 className={styles.formSection__title}>
							新規通知を送信
						</h3>

						<form
							onSubmit={handleSubmit}
							className={styles.notificationForm}
						>
							<div className={styles.formGroup}>
								<label
									htmlFor="title"
									className={styles.formGroup__label}
								>
									タイトル
								</label>
								<input
									type="text"
									id="title"
									value={notificationTitle}
									onChange={(e) =>
										setNotificationTitle(e.target.value)
									}
									className={styles.formGroup__input}
									placeholder="通知のタイトルを入力"
									required
								/>
							</div>

							<div className={styles.formGroup}>
								<label
									htmlFor="body"
									className={styles.formGroup__label}
								>
									本文
								</label>
								<textarea
									id="body"
									value={notificationBody}
									onChange={(e) =>
										setNotificationBody(e.target.value)
									}
									className={styles.formGroup__textarea}
									placeholder="通知の本文を入力"
									rows={4}
									required
								/>
							</div>

							<div className={styles.formGroup}>
								<label
									htmlFor="targetGroup"
									className={styles.formGroup__label}
								>
									送信先
								</label>
								<div
									id="targetGroup"
									className={styles.radioGroup}
								>
									<div className={styles.radioOption}>
										<input
											type="radio"
											id="all"
											name="target"
											value="all"
											checked={targetGroup === "all"}
											onChange={() =>
												setTargetGroup("all")
											}
											className={
												styles.radioOption__input
											}
										/>
										<label
											htmlFor="all"
											className={
												styles.radioOption__label
											}
										>
											すべてのユーザー
										</label>
									</div>

									<div className={styles.radioOption}>
										<input
											type="radio"
											id="partial"
											name="target"
											value="partial"
											checked={targetGroup === "partial"}
											onChange={() =>
												setTargetGroup("partial")
											}
											className={
												styles.radioOption__input
											}
										/>
										<label
											htmlFor="partial"
											className={
												styles.radioOption__label
											}
										>
											一部のユーザー
										</label>
									</div>
								</div>
							</div>

							<button
								type="submit"
								className={styles.submitButton}
							>
								<Icon name="paper-plane" />
								<span>通知を送信</span>
							</button>
						</form>
					</div>

					{/* 通知履歴セクション */}
					<div className={styles.historySection}>
						<h3 className={styles.historySection__title}>
							通知履歴
						</h3>

						<div className={styles.notificationList}>
							<div className={styles.notificationList__header}>
								<div className={styles.notificationList__cell}>
									ID
								</div>
								<div className={styles.notificationList__cell}>
									タイトル
								</div>
								<div className={styles.notificationList__cell}>
									本文
								</div>
								<div className={styles.notificationList__cell}>
									送信先
								</div>
								<div className={styles.notificationList__cell}>
									送信日時
								</div>
								<div className={styles.notificationList__cell}>
									送信者
								</div>
							</div>

							{notificationHistory.map((notification) => (
								<div
									key={notification.id}
									className={styles.notificationList__row}
								>
									<div
										className={
											styles.notificationList__cell
										}
									>
										{notification.id}
									</div>
									<div
										className={
											styles.notificationList__cell
										}
									>
										{notification.title}
									</div>
									<div
										className={
											styles.notificationList__cell
										}
									>
										{notification.body}
									</div>
									<div
										className={
											styles.notificationList__cell
										}
									>
										{notification.sentTo}
									</div>
									<div
										className={
											styles.notificationList__cell
										}
									>
										{notification.sentDate}
									</div>
									<div
										className={
											styles.notificationList__cell
										}
									>
										{notification.sentBy}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
