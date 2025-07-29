// ユーザーIDとペットIDから一意の申請IDを生成（ハッシュベース - 後方互換性のため）
export function generateApplicationId(userId: string, petId: string): string {
	// ユーザーIDとペットIDを組み合わせて一意の文字列を作成
	const combined = `${userId}-${petId}`;

	// 文字列をハッシュ化して数値に変換
	let hash = 0;
	for (let i = 0; i < combined.length; i++) {
		const char = combined.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // 32bitに変換
	}

	// 絶対値にして1-999999の範囲に変換（0を避けるため+1）
	const num = (Math.abs(hash) % 999999) + 1;

	// 5桁の番号にゼロパディングしてP00001形式で返す
	return `P${num.toString().padStart(5, "0")}`;
}

// 連番ベースの申請ID生成（P00001, P00002...の真の連番）
export function generateSequentialApplicationId(
	existingApplications: unknown[]
): string {
	// 既存の申請数を基に次の番号を生成
	const nextNumber = existingApplications.length + 1;

	// 5桁の番号にゼロパディングしてP00001形式で返す
	return `P${nextNumber.toString().padStart(5, "0")}`;
}

// 全申請データから次の連番を生成（推奨方法）
export async function generateNextApplicationId(): Promise<string> {
	try {
		// 全ページのペットデータを取得して総数をカウント
		const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
			fetch("/api/admin/pending"),
			fetch("/api/admin/approved"),
			fetch("/api/admin/rejected"),
		]);

		const [pendingData, approvedData, rejectedData] = await Promise.all([
			pendingRes.json(),
			approvedRes.json(),
			rejectedRes.json(),
		]);

		// 全申請の総数を計算
		const totalApplications =
			(pendingData.pendingPets?.length || 0) +
			(approvedData.approvedPets?.length || 0) +
			(rejectedData.rejectedPets?.length || 0);

		// 次の番号を生成
		const nextNumber = totalApplications + 1;

		// 5桁の番号にゼロパディングしてP00001形式で返す
		return `P${nextNumber.toString().padStart(5, "0")}`;
	} catch {
		// エラーの場合は現在時刻ベースのIDを生成
		const timestamp = Date.now();
		const num = (timestamp % 99999) + 1;
		return `P${num.toString().padStart(5, "0")}`;
	}
}
