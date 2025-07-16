"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../components/AuthProvider";
import { formatDate } from "../components/formatDate";
import { Icon } from "../components/Icon";
import { ApprovedPet } from "../../types/pet";
import styles from "../index.module.scss";
import localStyles from "./index.module.scss";
import { Sidebar } from "../components/Sidebar";

// 写真拡大表示モーダル
const PhotoModal = ({
	photoUrl,
	onClose,
}: {
	photoUrl: string | null;
	onClose: () => void;
}) => {
	// フォーカス時・キー操作用ハンドラ
	const handleOverlayKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onClose();
			}
		},
		[onClose]
	);

	if (!photoUrl) return null;

	return (
		<div
			className={localStyles.modalOverlay}
			onClick={onClose}
			onKeyDown={handleOverlayKeyDown}
			role="button"
			tabIndex={0}
			aria-label="モーダルを閉じる"
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

	const handleOverlayKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onClose();
			}
		},
		[onClose]
	);

	if (!pet) return null;

	return (
		<div
			className={localStyles.modalOverlay}
			onClick={onClose}
			onKeyDown={handleOverlayKeyDown}
			role="button"
			tabIndex={0}
			aria-label="モーダルを閉じる"
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
						aria-label="閉じる"
					>
						<Icon name="close" />
					</button>
				</div>

				<div className={localStyles.modalBody}>
					{/* 各種詳細行 */}
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
									{pet.petData.rabiesVaccine.date
										? formatDate(
												pet.petData.rabiesVaccine.date
										  )
										: "不明"}
								</span>
							</div>
							{pet.petData.rabiesVaccine.certPhoto && (
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
											aria-label="証明書を拡大"
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
									{pet.petData.mixedVaccine.date
										? formatDate(
												pet.petData.mixedVaccine.date
										  )
										: "不明"}
								</span>
							</div>
							{pet.petData.mixedVaccine.certPhoto && (
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
											aria-label="証明書を拡大"
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
	const [approvedPets, setApprovedPets] = useState<ApprovedPet[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPet, setSelectedPet] = useState<ApprovedPet | null>(null);

	const fetchApprovedPets = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/admin/approved");
			const data = await res.json();

			if (!data.success) {
				return;
			}

			// データベースから取得した申請IDを使用
			setApprovedPets(data.approvedPets);
		} catch {
			setApprovedPets([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchApprovedPets();
	}, [fetchApprovedPets]);

	const handleRevertToPending = useCallback(
		async (pet: ApprovedPet) => {
			try {
				const response = await fetch("/api/admin/revert-to-pending", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
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
					fetchApprovedPets();
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
			<Sidebar />
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

				<div className={styles.content__card}>
					<h3>承認済みのペット一覧 ({approvedPets.length}件)</h3>
					<p>ペット情報をクリックすると詳細が表示されます。</p>

					{loading ? (
						<div className={localStyles.loadingContainer}>
							<p>データを読み込み中...</p>
						</div>
					) : approvedPets.length === 0 ? (
						<div className={localStyles.emptyContainer}>
							<p>承認済みのペットはありません。</p>
						</div>
					) : (
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
									aria-label={`詳細を表示: ${pet.petName}`}
								>
									<div className={localStyles.petList__cell}>
										{pet.applicationId}
									</div>
									<div className={localStyles.petList__cell}>
										{pet.petName}
									</div>
									<div className={localStyles.petList__cell}>
										{formatDate(pet.approvedAt)}
									</div>
								</button>
							))}
						</div>
					)}
				</div>
			</main>

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

	if (authLoading) {
		return <div className={styles.authLoading}>認証情報を確認中...</div>;
	}

	if (!user || !isAdmin) {
		return <div className={styles.authError}>管理者権限が必要です</div>;
	}

	return <ApprovedPageContent />;
}
