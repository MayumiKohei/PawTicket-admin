"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../components/Sidebar";
import styles from "./post.module.scss";
import Image from "next/image";

export default function NotificationSendPage() {
	const [title, setTitle] = useState("");
	const [date, setDate] = useState("");
	const [body, setBody] = useState("");
	const [photo, setPhoto] = useState<File | null>(null);
	const [photoUrl, setPhotoUrl] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const [postType, setPostType] = useState<"now" | "reserve">("now");
	const [publishAt, setPublishAt] = useState("");

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setPhoto(e.target.files[0]);
		}
	};

	const handleUploadPhoto = async () => {
		if (!photo) return "";
		const formData = new FormData();
		formData.append("file", photo);
		const res = await fetch("/api/admin/upload", {
			method: "POST",
			body: formData,
		});
		const data = await res.json();
		if (data.success) {
			setPhotoUrl(data.url);
			return data.url;
		} else {
			alert("写真のアップロードに失敗しました");
			return "";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			let url = photoUrl;

			// 画像がある場合は先にFirebase Storageにアップロード
			if (photo && !photoUrl) {
				url = await handleUploadPhoto();
			}

			// 通知データをFirestoreに保存
			const notificationData = {
				title,
				date,
				photoUrl: url,
				body,
				postType,
				publishAt: postType === "reserve" ? publishAt : null,
				sent: postType === "now", // 即時投稿なら送信済み、予約投稿なら未送信
				createdAt: new Date().toISOString(),
			};

			const res = await fetch("/api/admin/notifications", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(notificationData),
			});

			const data = await res.json();

			if (data.success) {
				alert(
					postType === "now"
						? "お知らせを送信しました"
						: "お知らせを予約投稿しました"
				);
				router.push("/notifications/list");
			} else {
				alert("送信に失敗しました: " + data.message);
			}
		} catch (error) {
			console.error("送信エラー:", error);
			alert("送信に失敗しました");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<Sidebar />
			<main className={styles.main}>
				<h2 className={styles.main__title}>お知らせ送信</h2>
				<form onSubmit={handleSubmit}>
					<div className={styles.formGroup}>
						<label className={styles.formGroup__label}>
							タイトル
						</label>
						<input
							className={styles.formGroup__input}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>
					<div className={styles.formGroup}>
						<label className={styles.formGroup__label}>日付</label>
						<input
							className={styles.formGroup__input}
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							required
						/>
					</div>
					<div className={styles.formGroup}>
						<label className={styles.formGroup__label}>写真</label>
						<input
							className={styles.formGroup__input}
							type="file"
							accept="image/*"
							onChange={handlePhotoChange}
						/>
						{photo && (
							<button type="button" onClick={handleUploadPhoto}>
								写真をアップロード
							</button>
						)}
						{photoUrl && (
							<Image
								src={photoUrl}
								alt="お知らせ画像"
								width={200}
								height={120}
								style={{
									marginTop: 8,
									borderRadius: 6,
									objectFit: "cover",
								}}
							/>
						)}
					</div>
					<div className={styles.formGroup}>
						<label className={styles.formGroup__label}>
							投稿タイミング
						</label>
						<div>
							<label>
								<input
									type="radio"
									name="postType"
									value="now"
									checked={postType === "now"}
									onChange={() => setPostType("now")}
								/>
								今すぐ投稿
							</label>
							<label style={{ marginLeft: 16 }}>
								<input
									type="radio"
									name="postType"
									value="reserve"
									checked={postType === "reserve"}
									onChange={() => setPostType("reserve")}
								/>
								予約投稿
							</label>
						</div>
					</div>
					{postType === "reserve" && (
						<div className={styles.formGroup}>
							<label className={styles.formGroup__label}>
								公開日時
							</label>
							<input
								type="datetime-local"
								className={styles.formGroup__input}
								value={publishAt}
								onChange={(e) => setPublishAt(e.target.value)}
								required
							/>
						</div>
					)}
					<div className={styles.formGroup}>
						<label className={styles.formGroup__label}>本文</label>
						<textarea
							className={styles.formGroup__textarea}
							value={body}
							onChange={(e) => setBody(e.target.value)}
							required
							style={{ minHeight: 120 }}
						/>
					</div>
					<button
						type="submit"
						className={styles.submitButton}
						disabled={loading}
						style={{ marginTop: 16 }}
					>
						{loading ? "送信中..." : "送信"}
					</button>
				</form>
			</main>
		</div>
	);
}
