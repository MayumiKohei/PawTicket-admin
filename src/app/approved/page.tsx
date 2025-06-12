"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { signOut } from "firebase/auth";
import { authB } from "../firebase";
import { useAuth } from "../components/AuthProvider";
import { generateApplicationId } from "../../lib/utils";
import { formatDate } from "../../components/common/formatDate";
import { Icon } from "../../components/common/Icon";
import { ApprovedPet } from "../../types/pet";
import styles from "../index.module.scss";
import localStyles from "./index.module.scss";

// 写真拡大表示モーダル
const PhotoModal = ({
	photoUrl,
	onClose,
}: {
	photoUrl: string | null;
	onClose: () => void;
}) => {
	if (!photoUrl) return null;

	return (
		<div
			className={localStyles.modalOverlay}
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					onClose();
				}
			}}
			role="button"
			tabIndex={0}
		>
			<div
				className={localStyles.photoModalContent}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="photo-modal-title"
			>
				<div className={localStyles.photoModalHeader}>
					<h3 id="photo-modal-title">ワクチン証明書</h3>
					<button
						className={localStyles.closeButton}
						onClick={onClose}
						aria-label="閉じる"
					>
						<Icon name="close" />
					</button>
				</div>
				<div className={localStyles.photoModalBody}>
					<Image
						src={photoUrl}
						alt="ワクチン証明書"
						width={800}
						height={600}
						className={localStyles.photoModalImage}
					/>
				</div>
			</div>
		</div>
	);
};

// モーダルコンポーネント
const PetDetailModal = ({
	pet,
	onClose,
	onRevertToPending,
}: {
	pet: ApprovedPet | null;
	onClose: () => void;
	onRevertToPending: (pet: ApprovedPet) => void;
}) => {
	const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

	if (!pet) return null;

	return (
		<div
			className={localStyles.modalOverlay}
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					onClose();
				}
			}}
			role="button"
			tabIndex={0}
		>
			<div
				className={localStyles.modalContent}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
			>
				<div className={localStyles.modalHeader}>
					<h3 id="modal-title">承認済みペット詳細</h3>
					<button
						className={localStyles.closeButton}
						onClick={onClose}
					>
						<Icon name="close" />
					</button>
				</div>

				<div className={localStyles.modalBody}>
					<div className={localStyles.detailRow}>
						<span className={localStyles.detailLabel}>申請ID:</span>
						<span className={localStyles.detailValue}>
							{pet.applicationId}
						</span>
					</div>
					<div className={localStyles.detailRow}>
						<span className={localStyles.detailLabel}>
							ペット名:
						</span>
						<span className={localStyles.detailValue}>
							{pet.petName}
						</span>
					</div>
					<div className={localStyles.detailRow}>
						<span className={localStyles.detailLabel}>申請日:</span>
						<span className={localStyles.detailValue}>
							{formatDate(pet.createdAt)}
						</span>
					</div>
					<div className={localStyles.detailRow}>
						<span className={localStyles.detailLabel}>承認日:</span>
						<span className={localStyles.detailValue}>
							{formatDate(pet.approvedAt)}
						</span>
					</div>
					<div className={localStyles.detailRow}>
						<span className={localStyles.detailLabel}>犬種:</span>
						<span className={localStyles.detailValue}>
							{pet.petData.petBreed ?? "不明"}
						</span>
					</div>
					<div className={localStyles.detailRow}>
						<span className={localStyles.detailLabel}>サイズ:</span>
						<span className={localStyles.detailValue}>
							{pet.petData.size ?? "不明"}
						</span>
					</div>
					<div className={localStyles.detailRow}>
						<span className={localStyles.detailLabel}>性別:</span>
						<span className={localStyles.detailValue}>
							{pet.petData.sex ?? "不明"}
						</span>
					</div>

					{/* 狂犬病ワクチン情報 */}
					{pet.petData.rabiesVaccine && (
						<div className={localStyles.vaccineSection}>
							<h4 className={localStyles.vaccineTitle}>
								狂犬病ワクチン
							</h4>
							<div className={localStyles.detailRow}>
								<span className={localStyles.detailLabel}>
									接種日:
								</span>
								<span className={localStyles.detailValue}>
									{pet.petData.rabiesVaccine?.date
										? formatDate(
												pet.petData.rabiesVaccine.date
										  )
										: "不明"}
								</span>
							</div>
							{pet.petData.rabiesVaccine?.certPhoto && (
								<div className={localStyles.detailRow}>
									<span className={localStyles.detailLabel}>
										証明書:
									</span>
									<div className={localStyles.photoContainer}>
										<button
											onClick={() =>
												setSelectedPhoto(
													pet.petData.rabiesVaccine
														?.certPhoto ?? null
												)
											}
											className={localStyles.photoButton}
										>
											<Image
												src={
													pet.petData.rabiesVaccine
														.certPhoto
												}
												alt="狂犬病ワクチン証明書"
												width={150}
												height={100}
												className={
													localStyles.vaccineThumbnail
												}
											/>
										</button>
									</div>
								</div>
							)}
						</div>
					)}

					{/* 混合ワクチン情報 */}
					{pet.petData.mixedVaccine && (
						<div className={localStyles.vaccineSection}>
							<h4 className={localStyles.vaccineTitle}>
								混合ワクチン
							</h4>
							<div className={localStyles.detailRow}>
								<span className={localStyles.detailLabel}>
									接種日:
								</span>
								<span className={localStyles.detailValue}>
									{pet.petData.mixedVaccine?.date
										? formatDate(
												pet.petData.mixedVaccine.date
										  )
										: "不明"}
								</span>
							</div>
							{pet.petData.mixedVaccine?.certPhoto && (
								<div className={localStyles.detailRow}>
									<span className={localStyles.detailLabel}>
										証明書:
									</span>
									<div className={localStyles.photoContainer}>
										<button
											onClick={() =>
												setSelectedPhoto(
													pet.petData.mixedVaccine
														?.certPhoto ?? null
												)
											}
											className={localStyles.photoButton}
										>
											<Image
												src={
													pet.petData.mixedVaccine
														.certPhoto
												}
												alt="混合ワクチン証明書"
												width={150}
												height={100}
												className={
													localStyles.vaccineThumbnail
												}
											/>
										</button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				<div className={localStyles.modalFooter}>
					<button
						className={localStyles.revertButton}
						onClick={() => onRevertToPending(pet)}
					>
						承認待ちに戻す
					</button>
					<button
						className={localStyles.closeModalButton}
						onClick={onClose}
					>
						閉じる
					</button>
				</div>
			</div>

			{/* 写真拡大モーダル */}
			<PhotoModal
				photoUrl={selectedPhoto}
				onClose={() => setSelectedPhoto(null)}
			/>
		</div>
	);
};

// 承認済みページコンテンツコンポーネント
function ApprovedPageContent() {
	const pathname = usePathname();
	const [currentTime, setCurrentTime] = useState("");
	const [approvedPets, setApprovedPets] = useState<ApprovedPet[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPet, setSelectedPet] = useState<ApprovedPet | null>(null);

	const handleLogout = useCallback(async () => {
		try {
			await signOut(authB);
		} catch {
			// Handle logout error silently
		}
	}, []);

	// 承認済みペットデータを取得
	const fetchApprovedPets = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/admin/approved");
			const data = await res.json();

			if (!data.success) {
				// Handle API error silently
				return;
			}

			// 申請IDを生成してペットデータに追加
			const petsWithApplicationId = data.approvedPets.map(
				(pet: Omit<ApprovedPet, "applicationId">) => ({
					...pet,
					applicationId: generateApplicationId(pet.userId, pet.petId),
				})
			);

			setApprovedPets(petsWithApplicationId);
		} catch {
			// Handle fetch error silently
			setApprovedPets([]);
		} finally {
			setLoading(false);
		}
	}, []);

	// 現在時刻を更新
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

	// コンポーネントマウント時にデータを取得
	useEffect(() => {
		fetchApprovedPets();
	}, [fetchApprovedPets]);

	// ナビゲーションアイテム
	const navItems = [
		{ name: "ダッシュボード", path: "/", icon: "dashboard" as const },
		{ name: "承認待ち", path: "/pending", icon: "clock" as const },
		{ name: "承認済み", path: "/approved", icon: "check-circle" as const },
		{ name: "却下済み", path: "/rejected", icon: "x-circle" as const },
		{ name: "プッシュ通知", path: "/notifications", icon: "bell" as const },
	];

	const handleRevertToPending = useCallback(
		async (pet: ApprovedPet) => {
			try {
				const response = await fetch("/api/admin/revert-to-pending", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: pet.userId,
						petId: pet.petId,
					}),
				});

				const data = await response.json();

				if (data.success) {
					alert(
						`${pet.applicationId} (${pet.petName}) を承認待ちに戻しました`
					);
					setSelectedPet(null);
					fetchApprovedPets(); // データを再取得
				} else {
					alert(`承認待ちに戻す処理に失敗しました: ${data.message}`);
				}
			} catch {
				alert("承認待ちに戻す処理中にエラーが発生しました");
			}
		},
		[fetchApprovedPets]
	);

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
						className={localStyles.logoutButton}
					>
						<Icon name="logout" />
						ログアウト
					</button>
				</div>
			</aside>

			{/* メインコンテンツ */}
			<main className={styles.content}>
				<div className={styles.content__header}>
					<h2>承認済み</h2>
					<button
						onClick={fetchApprovedPets}
						className={localStyles.updateButton}
					>
						データを更新
					</button>
				</div>

				{/* 承認済みリスト */}
				<div className={styles.content__card}>
					<h3>承認済みのペット一覧 ({approvedPets.length}件)</h3>
					<p>ペット情報をクリックすると詳細が表示されます。</p>

					{(() => {
						if (loading) {
							return (
								<div className={localStyles.loadingContainer}>
									<p>データを読み込み中...</p>
								</div>
							);
						}

						if (approvedPets.length === 0) {
							return (
								<div className={localStyles.emptyContainer}>
									<p>承認済みのペットはありません。</p>
								</div>
							);
						}

						return (
							<div className={localStyles.petList}>
								<div className={localStyles.petList__header}>
									<div className={localStyles.petList__cell}>
										申請ID
									</div>
									<div className={localStyles.petList__cell}>
										ペット名
									</div>
									<div className={localStyles.petList__cell}>
										承認日
									</div>
								</div>

								{approvedPets.map((pet) => (
									<button
										key={`${pet.userId}-${pet.petId}`}
										className={`${localStyles.petList__row} ${localStyles.listButton}`}
										onClick={() => setSelectedPet(pet)}
									>
										<div
											className={
												localStyles.petList__cell
											}
										>
											{pet.applicationId}
										</div>
										<div
											className={
												localStyles.petList__cell
											}
										>
											{pet.petName}
										</div>
										<div
											className={
												localStyles.petList__cell
											}
										>
											{formatDate(pet.approvedAt)}
										</div>
									</button>
								))}
							</div>
						);
					})()}
				</div>
			</main>

			{/* モーダル */}
			<PetDetailModal
				pet={selectedPet}
				onClose={() => setSelectedPet(null)}
				onRevertToPending={handleRevertToPending}
			/>
		</div>
	);
}

export default function ApprovedPage() {
	const { user, loading: authLoading, isAdmin } = useAuth();

	// 認証チェック
	if (authLoading) {
		return <div className={styles.authLoading}>認証情報を確認中...</div>;
	}

	if (!user || !isAdmin) {
		return <div className={styles.authError}>管理者権限が必要です</div>;
	}

	return <ApprovedPageContent />;
}
