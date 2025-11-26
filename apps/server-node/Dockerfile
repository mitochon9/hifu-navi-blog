# Multi-stage Dockerfile for Cloud Run (server-node)
FROM oven/bun:1.2.22 AS base
WORKDIR /app

# Leverage install cache: copy manifests first
COPY bun.lock package.json turbo.json ./
COPY packages ./packages
COPY apps/server-node/package.json ./apps/server-node/package.json
COPY apps/worker-node/package.json ./apps/worker-node/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/result/package.json ./packages/result/package.json
COPY packages/server-kit/package.json ./packages/server-kit/package.json
COPY packages/tailwind-config/package.json ./packages/tailwind-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* \
  && bun install

# Copy the rest of the monorepo
COPY . .

# Generate Prisma Client for runtime
WORKDIR /app/packages/database
RUN bun run db:generate

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

WORKDIR /app/apps/server-node
CMD ["bun", "run", "src/index.ts"]


