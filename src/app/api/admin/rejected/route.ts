import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

// Node.js ランタイムで実行する
export const runtime = "nodejs";

export async function GET() {
	try {
		// 全ユーザーを取得
		const usersSnapshot = await adminDb.collection("users").get();

		const rejectedPets: Array<{
			userId: string;
			petId: string;
			petName: string;
			createdAt: FirebaseFirestore.Timestamp | string | null;
			rejectedAt: FirebaseFirestore.Timestamp | string | null;
			rejectionReason?: string;
			petData: Record<string, unknown>;
		}> = [];

		// 各ユーザーのpetsサブコレクションから status == "却下済み" のペットを取得
		for (const userDoc of usersSnapshot.docs) {
			try {
				const petsSnapshot = await adminDb
					.collection("users")
					.doc(userDoc.id)
					.collection("pets")
					.where("status", "==", "無効")
					.get();

				petsSnapshot.docs.forEach((petDoc) => {
					const petData = petDoc.data();

					rejectedPets.push({
						userId: userDoc.id,
						petId: petDoc.id,
						petName: petData.petName ?? "名前なし",
						createdAt: petData.createdAt,
						rejectedAt: petData.rejectedAt,
						rejectionReason: petData.rejectionReason,
						petData: petData,
					});
				});
			} catch (error) {
				console.warn(
					`Failed to fetch pets for user ${userDoc.id}:`,
					error
				);
			}
		}

		// rejectedAt で新しい順（降順）にソート
		rejectedPets.sort((a, b) => {
			if (!a.rejectedAt || !b.rejectedAt) return 0;

			// Firestore Timestamp の場合
			if (
				typeof a.rejectedAt === "object" &&
				"toDate" in a.rejectedAt &&
				typeof b.rejectedAt === "object" &&
				"toDate" in b.rejectedAt
			) {
				return (
					b.rejectedAt.toDate().getTime() -
					a.rejectedAt.toDate().getTime()
				);
			}

			// 文字列の場合
			if (
				typeof a.rejectedAt === "string" &&
				typeof b.rejectedAt === "string"
			) {
				return (
					new Date(b.rejectedAt).getTime() -
					new Date(a.rejectedAt).getTime()
				);
			}

			return 0;
		});

		const responseData = {
			success: true,
			rejectedPets: rejectedPets,
		};

		return NextResponse.json(responseData);
	} catch (error: unknown) {
		console.error("Error in /api/admin/rejected:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Unknown error occurred",
				rejectedPets: [],
			},
			{ status: 500 }
		);
	}
}
