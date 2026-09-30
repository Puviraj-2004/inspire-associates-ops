// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "10.243.197.68:3000",        // Unga Local Network IP
        "*.devtunnels.ms",           // VS Code Port Forwarding (Dev Tunnels) use panna
        "*.app.github.dev",          // GitHub Port forward
        "*.ngrok-free.app",          // Ngrok use panna
      ],
    },
  },
};

export default nextConfig;