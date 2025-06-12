"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { authB } from "../firebase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

// 管理者UIDのリスト（Firestore Security Rulesと同じ）
const ADMIN_UIDS = [
	"3S6PdCwFK2TjGgQMUBnGkp9gTn53", // 既存の管理者UID
];

export default function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(authB, (user) => {
			setUser(user);
			setLoading(false);

			// 認証が必要なページで未認証の場合、ログインページにリダイレクト
			if (!user && pathname !== "/auth/login") {
				router.push("/auth/login");
			}
			// 認証済みでログインページにいる場合、ダッシュボードにリダイレクト
			else if (user && pathname === "/auth/login") {
				const isAdmin = ADMIN_UIDS.includes(user.uid);
				if (isAdmin) {
					router.push("/");
				} else {
					// 管理者権限がない場合はログアウト
					authB.signOut();
				}
			}
		});

		return () => unsubscribe();
	}, [router, pathname]);

	const isAdmin = user ? ADMIN_UIDS.includes(user.uid) : false;

	const value = {
		user,
		loading,
		isAdmin,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}
