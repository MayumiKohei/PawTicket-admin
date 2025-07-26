import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "modern-css-reset";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "PawTicket Admin",
	description: "PawTicket管理サイト",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
