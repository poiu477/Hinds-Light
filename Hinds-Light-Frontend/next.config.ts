import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a minimal self-contained server output for Docker
  output: 'standalone',
};

export default nextConfig;
