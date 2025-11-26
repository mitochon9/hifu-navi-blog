# Next.js (SSR) on Cloud Run using Bun
FROM oven/bun:1.2.22
WORKDIR /app

# Leverage install cache: copy manifests first
COPY bun.lock package.json turbo.json ./
COPY packages ./packages
COPY apps/client/package.json ./apps/client/package.json
COPY apps/server-node/package.json ./apps/server-node/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/result/package.json ./packages/result/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* \
  && bun install

# Copy the rest of the monorepo (node_modules are excluded by .dockerignore)
COPY . .

# Generate Prisma Client for runtime
WORKDIR /app/packages/database
RUN bun run db:generate

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

WORKDIR /app/apps/client

# Build Next.js app with Bun
RUN bun run build

# Start Next.js server
CMD ["bun", "run", "start", "-p", "3000"]


