import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		// Firebase Storage and other external image domains
		remotePatterns: [
			{
				protocol: "https",
				hostname: "firebasestorage.googleapis.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "storage.googleapis.com",
				port: "",
				pathname: "/**",
			},
		],
	},
	// External packages for server components
	serverExternalPackages: ["firebase-admin"],
	// Webpack configuration for better module resolution
	webpack: (config) => {
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			net: false,
			tls: false,
		};
		return config;
	},
};

export default nextConfig;
