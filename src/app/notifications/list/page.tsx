"use client";
import React, { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import styles from "./list.module.scss";
import Image from "next/image";

// モーダル用コンポーネント
function Modal({
	open,
	onClose,
	children,
}: {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}) {
	if (!open) return null;
	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<button onClick={onClose} className={styles.modalClose}>
					&times;
				</button>
				{children}
			</div>
		</div>
	);
}

type Announcement = {
	id: string;
	title: string;
	date: string;
	photoUrl?: string;
	body: string;
};

export default function NotificationListPage() {
	const [announcements, setAnnouncements] = useState<Announcement[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [selected, setSelected] = useState<Announcement | null>(null);

	// モーダルで編集内容を保持
	const [modalEditData, setModalEditData] = useState<Partial<Announcement>>(
		{}
	);

	const fetchAnnouncements = async () => {
		setLoading(true);
		const res = await fetch("/api/admin/notifications");
		const data = await res.json();
		if (data.success) {
			setAnnouncements(data.announcements);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchAnnouncements();
	}, []);

	const openModal = (item: Announcement) => {
		setSelected(item);
		setModalEditData({ ...item });
		setModalOpen(true);
	};
	const closeModal = () => {
		setModalOpen(false);
		setSelected(null);
	};

	const handleModalEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const res = await fetch("/api/admin/notifications", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(modalEditData),
		});
		const data = await res.json();
		if (data.success) {
			alert("更新しました");
			closeModal();
			fetchAnnouncements();
		} else {
			alert("更新に失敗: " + data.message);
		}
	};

	const handleModalDelete = async () => {
		if (!selected) return;
		if (!confirm("本当に削除しますか？")) return;
		const res = await fetch("/api/admin/notifications", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: selected.id }),
		});
		const data = await res.json();
		if (data.success) {
			alert("削除しました");
			closeModal();
			fetchAnnouncements();
		} else {
			alert("削除に失敗: " + data.message);
		}
	};

	const sortedAnnouncements = [...announcements].sort((a, b) => {
		// 日付が未入力の場合は一番下に
		if (!a.date) return 1;
		if (!b.date) return -1;
		// 降順（新しい順）
		return b.date.localeCompare(a.date);
	});

	return (
		<div className={styles.container}>
			<Sidebar />
			<main className={styles.main}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "1.5rem",
					}}
				>
					<h2>お知らせ一覧</h2>
				</div>
				{loading ? (
					<p>読み込み中...</p>
				) : (
					<div className={styles.tableWrapper}>
						<table className={styles.listTable}>
							<thead>
								<tr>
									<th>タイトル</th>
									<th>日付</th>
									<th>本文</th>
								</tr>
							</thead>
							<tbody>
								{sortedAnnouncements.map((item) => (
									<tr
										key={item.id}
										onClick={() => openModal(item)}
									>
										<td>{item.title}</td>
										<td>{item.date}</td>
										<td className={styles.bodyCell}>
											{item.body}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{/* モーダル */}
				<Modal open={modalOpen} onClose={closeModal}>
					{selected && (
						<form
							onSubmit={handleModalEditSubmit}
							className={styles.modalForm}
						>
							<div>
								<label>タイトル</label>
								<input
									value={modalEditData.title || ""}
									onChange={(e) =>
										setModalEditData({
											...modalEditData,
											title: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<label>日付</label>
								<input
									type="date"
									value={modalEditData.date || ""}
									onChange={(e) =>
										setModalEditData({
											...modalEditData,
											date: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<label>写真</label>
								<br />
								{modalEditData.photoUrl && (
									<Image
										src={modalEditData.photoUrl}
										alt="写真"
										width={80}
										height={60}
										style={{ maxWidth: 80, height: "auto" }}
									/>
								)}
							</div>
							<div>
								<label>本文</label>
								<textarea
									value={modalEditData.body || ""}
									onChange={(e) =>
										setModalEditData({
											...modalEditData,
											body: e.target.value,
										})
									}
								/>
							</div>
							<div className={styles.modalButtonRow}>
								<button
									type="submit"
									className={`${styles.modalButton} ${styles.save}`}
								>
									保存
								</button>
								<button
									type="button"
									onClick={handleModalDelete}
									className={`${styles.modalButton} ${styles.delete}`}
								>
									削除
								</button>
								<button
									type="button"
									onClick={closeModal}
									className={`${styles.modalButton} ${styles.close}`}
								>
									閉じる
								</button>
							</div>
						</form>
					)}
				</Modal>
			</main>
		</div>
	);
}
