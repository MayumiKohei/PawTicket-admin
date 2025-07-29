"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import styles from "../index.module.scss";
import localStyles from "./index.module.scss";
import { Sidebar } from "../components/Sidebar";

// ペット情報の型定義
type TimestampType =
	| FirebaseFirestore.Timestamp
	| { _seconds: number; _nanoseconds: number }
	| { year: string; month: string; day: string }
	| string
	| null;

type VaccineInfo = {
	certPhoto?: string;
	date?: TimestampType;
};

type PetData = {
	petName?: string;
	petBreed?: string;
	size?: string;
	sex?: string;
	rabiesVaccine?: VaccineInfo;
	mixedVaccine?: VaccineInfo;
	[key: string]: unknown;
};

type PendingPet = {
	userId: string;
	petId: string;
	petName: string;
	createdAt: TimestampType;
	petData: PetData;
	applicationId: string; // ページ側で生成するID
};

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
			role="presentation"
			style={{ zIndex: 1001 }}
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
						style={{
							maxWidth: "100%",
							maxHeight: "80vh",
							objectFit: "contain",
						}}
					/>
				</div>
			</div>
		</div>
	);
};

// アイコンコンポーネント（Font Awesome風）
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
	} else if (name === "check") {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				width="24"
				height="24"
			>
				<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
			</svg>
		);
	} else if (name === "close") {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				width="24"
				height="24"
			>
				<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
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

// モーダルコンポーネント
const PetDetailModal = ({
	pet,
	onClose,
	onApprove,
	onReject,
}: {
	pet: PendingPet | null;
	onClose: () => void;
	onApprove: (pet: PendingPet) => void;
	onReject: (pet: PendingPet) => void;
}) => {
	const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

	if (!pet) return null;

	const formatDate = (timestamp: TimestampType) => {
		if (!timestamp) {
			return "不明";
		}

		// カスタム日付オブジェクト形式 {year: '2023', month: '01', day: '03'}
		if (
			typeof timestamp === "object" &&
			timestamp &&
			"year" in timestamp &&
			"month" in timestamp &&
			"day" in timestamp
		) {
			try {
				const { year, month, day } = timestamp as {
					year: string;
					month: string;
					day: string;
				};
				const date = new Date(
					parseInt(year),
					parseInt(month) - 1, // JavaScriptの月は0ベース
					parseInt(day)
				);
				return date.toLocaleDateString("ja-JP");
			} catch {
				// Handle conversion error silently
			}
		}

		// Firestore Timestamp オブジェクト（toDateメソッドがある場合）
		if (
			typeof timestamp === "object" &&
			timestamp &&
			"toDate" in timestamp &&
			typeof timestamp.toDate === "function"
		) {
			try {
				return timestamp.toDate().toLocaleDateString("ja-JP");
			} catch {
				// Handle timestamp conversion error silently
			}
		}

		// Firestore Timestamp オブジェクト（_secondsプロパティがある場合）
		if (
			typeof timestamp === "object" &&
			timestamp &&
			"_seconds" in timestamp &&
			typeof timestamp._seconds === "number"
		) {
			try {
				const date = new Date(timestamp._seconds * 1000);
				return date.toLocaleDateString("ja-JP");
			} catch {
				// Handle timestamp conversion error silently
			}
		}

		// 文字列の場合
		if (typeof timestamp === "string") {
			try {
				return new Date(timestamp).toLocaleDateString("ja-JP");
			} catch {
				// Handle timestamp conversion error silently
			}
		}

		return "不明";
	};

	return (
		<div
			className={localStyles.modalOverlay}
			onClick={onClose}
			role="presentation"
		>
			<div
				className={localStyles.modalContent}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
			>
				<div className={localStyles.modalHeader}>
					<h3 id="modal-title">ペット申請詳細</h3>
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
						<span className={localStyles.detailLabel}>犬種:</span>
						<span className={localStyles.detailValue}>
							{pet.petData.petBreed || "不明"}
						</span>
					</div>
					<div className={localStyles.detailRow}>
						<span className={localStyles.detailLabel}>サイズ:</span>
						<span className={localStyles.detailValue}>
							{pet.petData.size || "不明"}
						</span>
					</div>
					<div className={localStyles.detailRow}>
						<span className={localStyles.detailLabel}>性別:</span>
						<span className={localStyles.detailValue}>
							{pet.petData.sex || "不明"}
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
											onClick={() =>
												setSelectedPhoto(
													pet.petData.rabiesVaccine
														?.certPhoto || null
												)
											}
											style={{ cursor: "pointer" }}
										/>
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
											onClick={() =>
												setSelectedPhoto(
													pet.petData.mixedVaccine
														?.certPhoto || null
												)
											}
											style={{ cursor: "pointer" }}
										/>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				<div className={localStyles.modalFooter}>
					<button
						className={localStyles.approveButton}
						onClick={() => onApprove(pet)}
					>
						<Icon name="check" />
						承認
					</button>
					<button
						className={localStyles.rejectButton}
						onClick={() => onReject(pet)}
					>
						<Icon name="close" />
						却下
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

// ペンディングページコンテンツコンポーネント
function PendingPageContent() {
	const [pendingPets, setPendingPets] = useState<PendingPet[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPet, setSelectedPet] = useState<PendingPet | null>(null);

	// 承認待ちペットデータを取得
	const fetchPendingPets = async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/admin/pending");
			const data = await res.json();

			if (!data.success) {
				console.error("API からの取得に失敗:", data.message);
				return;
			}

			// データベースから取得した申請IDを使用
			setPendingPets(data.pendingPets);
		} catch (error) {
			console.error("承認待ちデータの取得に失敗しました:", error);
			setPendingPets([]);
		} finally {
			setLoading(false);
		}
	};

	// コンポーネントマウント時にデータを取得
	useEffect(() => {
		fetchPendingPets();
	}, []);

	const handleApprove = async (pet: PendingPet) => {
		try {
			const response = await fetch("/api/admin/approve", {
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
				alert(`${pet.applicationId} (${pet.petName}) を承認しました`);
				setSelectedPet(null);
				fetchPendingPets(); // データを再取得
			} else {
				alert(`承認処理に失敗しました: ${data.message}`);
			}
		} catch {
			alert("承認処理中にエラーが発生しました");
		}
	};

	const handleReject = async (pet: PendingPet) => {
		const rejectionReason = prompt("却下理由を入力してください（任意）:");

		try {
			const response = await fetch("/api/admin/reject", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: pet.userId,
					petId: pet.petId,
					rejectionReason: rejectionReason || undefined,
				}),
			});

			const data = await response.json();

			if (data.success) {
				alert(`${pet.applicationId} (${pet.petName}) を却下しました`);
				setSelectedPet(null);
				fetchPendingPets(); // データを再取得
			} else {
				alert(`却下処理に失敗しました: ${data.message}`);
			}
		} catch {
			alert("却下処理中にエラーが発生しました");
		}
	};

	const formatDate = (timestamp: TimestampType) => {
		if (!timestamp) return "不明";

		// カスタム日付オブジェクト形式 {year: '2023', month: '01', day: '03'}
		if (
			typeof timestamp === "object" &&
			timestamp &&
			"year" in timestamp &&
			"month" in timestamp &&
			"day" in timestamp
		) {
			try {
				const { year, month, day } = timestamp as {
					year: string;
					month: string;
					day: string;
				};
				const date = new Date(
					parseInt(year),
					parseInt(month) - 1, // JavaScriptの月は0ベース
					parseInt(day)
				);
				return date.toLocaleDateString("ja-JP");
			} catch {
				// Handle conversion error silently
			}
		}

		// Firestore Timestamp オブジェクト（toDateメソッドがある場合）
		if (
			typeof timestamp === "object" &&
			timestamp &&
			"toDate" in timestamp &&
			typeof timestamp.toDate === "function"
		) {
			try {
				return timestamp.toDate().toLocaleDateString("ja-JP");
			} catch {
				// Handle timestamp conversion error silently
			}
		}

		// Firestore Timestamp オブジェクト（_secondsプロパティがある場合）
		if (
			typeof timestamp === "object" &&
			timestamp &&
			"_seconds" in timestamp &&
			typeof timestamp._seconds === "number"
		) {
			try {
				const date = new Date(timestamp._seconds * 1000);
				return date.toLocaleDateString("ja-JP");
			} catch {
				// Handle timestamp conversion error silently
			}
		}

		// 文字列の場合
		if (typeof timestamp === "string") {
			try {
				return new Date(timestamp).toLocaleDateString("ja-JP");
			} catch {
				// Handle timestamp conversion error silently
			}
		}

		return "不明";
	};

	return (
		<div className={styles.dashboard}>
			<Sidebar />

			{/* メインコンテンツ */}
			<main className={styles.content}>
				<div className={styles.content__header}>
					<h2>承認待ち</h2>
					<button
						onClick={fetchPendingPets}
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

				{/* 承認待ちリスト */}
				<div className={styles.content__card}>
					<h3>承認待ちのペット一覧 ({pendingPets.length}件)</h3>
					<p>ペット情報をクリックすると詳細が表示されます。</p>

					{(() => {
						if (loading) {
							return (
								<div
									style={{
										textAlign: "center",
										padding: "2rem",
									}}
								>
									<p>データを読み込み中...</p>
								</div>
							);
						}

						if (pendingPets.length === 0) {
							return (
								<div
									style={{
										textAlign: "center",
										padding: "2rem",
									}}
								>
									<p>承認待ちのペットはありません。</p>
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
										申請日
									</div>
								</div>

								{pendingPets.map((pet) => (
									<div
										key={`${pet.userId}-${pet.petId}`}
										className={localStyles.petList__row}
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
											{formatDate(pet.createdAt)}
										</div>
									</div>
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
				onApprove={handleApprove}
				onReject={handleReject}
			/>
		</div>
	);
}

export default function PendingPage() {
	const { user, loading: authLoading, isAdmin } = useAuth();

	// 認証チェック
	if (authLoading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					fontSize: "1.2rem",
				}}
			>
				認証情報を確認中...
			</div>
		);
	}

	if (!user || !isAdmin) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					fontSize: "1.2rem",
				}}
			>
				管理者権限が必要です
			</div>
		);
	}

	return <PendingPageContent />;
}
