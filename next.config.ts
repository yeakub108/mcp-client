import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // We're not using any specific output setting that was causing symlink issues on Windows
  // Don't use 'export' as it will break API routes
  // output: 'standalone', // Original setting (commented out)
  experimental: {
    // Other experimental features can be added here if needed
  },
  // Ensure API routes work correctly in development and production
  distDir: process.env.NODE_ENV === 'production' ? '.next' : '.next',
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "https://nex-agent.vercel.app",
    // Adding this flag to help debug environment differences
    NEXT_PUBLIC_ENV: process.env.NODE_ENV || 'development',
  },
};

export default nextConfig;
