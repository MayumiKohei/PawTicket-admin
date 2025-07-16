"use client";

import { Sidebar } from "../components/Sidebar";
import { useState } from "react";
import styles from "./index.module.scss";
import { Icon } from "../components/Icon";

export default function NotificationsPage() {
	const [notificationTitle, setNotificationTitle] = useState("");
	const [notificationBody, setNotificationBody] = useState("");
	const [targetGroup, setTargetGroup] = useState("all");

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
			<Sidebar />
			<main className={styles.main}>
				<div className={styles.main__header}>
					<h2 className={styles.main__title}>プッシュ通知</h2>
				</div>
				<div className={styles.main__content}>
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
								<Icon name="bell" />
								<span>通知を送信</span>
							</button>
						</form>
					</div>
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
