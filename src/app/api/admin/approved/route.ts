import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

// Node.js ランタイムで実行する
export const runtime = "nodejs";

export async function GET() {
	try {
		// 全ユーザーを取得
		const usersSnapshot = await adminDb.collection("users").get();

		const approvedPets: Array<{
			userId: string;
			petId: string;
			petName: string;
			createdAt: FirebaseFirestore.Timestamp | string | null;
			approvedAt: FirebaseFirestore.Timestamp | string | null;
			petData: Record<string, unknown>;
			applicationId: string;
		}> = [];

		// 各ユーザーのpetsサブコレクションから status == "認証済み" のペットを取得
		for (const userDoc of usersSnapshot.docs) {
			try {
				const petsSnapshot = await adminDb
					.collection("users")
					.doc(userDoc.id)
					.collection("pets")
					.where("status", "==", "認証済み")
					.get();

				petsSnapshot.docs.forEach((petDoc) => {
					const petData = petDoc.data();

					approvedPets.push({
						userId: userDoc.id,
						petId: petDoc.id,
						petName: petData.petName ?? "名前なし",
						createdAt: petData.createdAt,
						approvedAt: petData.approvedAt,
						petData: petData,
						applicationId: petData.applicationId || "不明",
					});
				});
			} catch (error) {
				console.warn(
					`Failed to fetch pets for user ${userDoc.id}:`,
					error
				);
			}
		}

		// approvedAt で新しい順（降順）にソート
		approvedPets.sort((a, b) => {
			if (!a.approvedAt || !b.approvedAt) return 0;

			// Firestore Timestamp の場合
			if (
				typeof a.approvedAt === "object" &&
				"toDate" in a.approvedAt &&
				typeof b.approvedAt === "object" &&
				"toDate" in b.approvedAt
			) {
				return (
					b.approvedAt.toDate().getTime() -
					a.approvedAt.toDate().getTime()
				);
			}

			// 文字列の場合
			if (
				typeof a.approvedAt === "string" &&
				typeof b.approvedAt === "string"
			) {
				return (
					new Date(b.approvedAt).getTime() -
					new Date(a.approvedAt).getTime()
				);
			}

			return 0;
		});

		const responseData = {
			success: true,
			approvedPets: approvedPets,
		};

		return NextResponse.json(responseData);
	} catch (error: unknown) {
		console.error("Error in /api/admin/approved:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Unknown error occurred",
				approvedPets: [],
			},
			{ status: 500 }
		);
	}
}
