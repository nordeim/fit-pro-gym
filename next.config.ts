import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone server output (bun .next/standalone/server.js) — matches the
  // scaffold's start script and the Playwright e2e webServer. The build
  // script then copies static/, public/, and prisma/schema.prisma into it
  // (the traced schema copy anchors db-path resolution — see
  // tests/db-path.test.ts).
  output: "standalone",

  // Allow the sandbox preview origin to reach dev-server assets.
  allowedDevOrigins:
    process.env.ALLOWED_DEV_ORIGIN
      ? [process.env.ALLOWED_DEV_ORIGIN]
      : undefined,
};

export default nextConfig;
