"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export default function SessionTimer() {
	const { user } = useAuth();
	const [remainingTime, setRemainingTime] = useState<string>("");

	useEffect(() => {
		if (!user) return;

		const updateRemainingTime = () => {
			const lastActivity = localStorage.getItem("lastActivity");
			if (!lastActivity) return;

			const now = Date.now();
			const timeSinceLastActivity = now - parseInt(lastActivity);
			const timeoutDuration = 12 * 60 * 60 * 1000; // 12時間
			const remaining = timeoutDuration - timeSinceLastActivity;

			if (remaining <= 0) {
				setRemainingTime("セッション期限切れ");
				return;
			}

			const hours = Math.floor(remaining / (1000 * 60 * 60));
			const minutes = Math.floor(
				(remaining % (1000 * 60 * 60)) / (1000 * 60)
			);

			if (hours > 0) {
				setRemainingTime(`${hours}時間${minutes}分`);
			} else {
				setRemainingTime(`${minutes}分`);
			}
		};

		// 初回実行
		updateRemainingTime();

		// 1分ごとに更新
		const interval = setInterval(updateRemainingTime, 60000);

		return () => clearInterval(interval);
	}, [user]);

	if (!user || !remainingTime) return null;

	return (
		<div
			style={{
				position: "fixed",
				top: "10px",
				right: "10px",
				background: "rgba(0, 0, 0, 0.8)",
				color: "white",
				padding: "8px 12px",
				borderRadius: "4px",
				fontSize: "12px",
				zIndex: 1000,
			}}
		>
			セッション残り: {remainingTime}
		</div>
	);
}
