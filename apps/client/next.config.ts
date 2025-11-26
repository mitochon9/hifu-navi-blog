import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@repo/ui", "@repo/db", "@repo/api-client"],
};

export default nextConfig;
