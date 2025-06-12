// ペット情報の型定義
type TimestampType =
	| FirebaseFirestore.Timestamp
	| { _seconds: number; _nanoseconds: number }
	| { year: string; month: string; day: string }
	| string
	| null;

export const formatDate = (timestamp: TimestampType): string => {
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
				parseInt(year, 10),
				parseInt(month, 10) - 1, // JavaScriptの月は0ベース
				parseInt(day, 10)
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
