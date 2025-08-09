# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# --- Builder stage: install deps (focused) and build backend workspace ---
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Enable Yarn via Corepack
RUN corepack enable

# Copy Yarn workspace root files
COPY package.json yarn.lock .yarnrc.yml .yarn/ ./

# Copy only the backend workspace manifest so we can focus deps without
# requiring other workspaces to be present
COPY Hinds-Light-Backend/package.json Hinds-Light-Backend/package.json

# Install only the backend workspace (including devDeps for build)
RUN yarn workspaces focus hinds-light-backend

# Copy backend source
COPY Hinds-Light-Backend/tsconfig.json Hinds-Light-Backend/tsconfig.json
COPY Hinds-Light-Backend/prisma Hinds-Light-Backend/prisma
COPY Hinds-Light-Backend/src Hinds-Light-Backend/src

# Generate Prisma client and build
RUN yarn workspace hinds-light-backend prisma:generate
RUN yarn workspace hinds-light-backend build

# --- Production stage: prune to production deps and run ---
FROM node:${NODE_VERSION} AS prod
ENV NODE_ENV=production
WORKDIR /app

# Enable Yarn via Corepack
RUN corepack enable

# Copy Yarn workspace root files
COPY package.json yarn.lock .yarnrc.yml .yarn/ ./

# Copy backend manifest and node_modules from builder
COPY Hinds-Light-Backend/package.json Hinds-Light-Backend/package.json
COPY --from=builder /app/node_modules ./node_modules

# Prune to production-only deps for the backend workspace
RUN yarn workspaces focus --production hinds-light-backend

# Copy built artifacts and prisma schema
COPY --from=builder /app/Hinds-Light-Backend/dist ./Hinds-Light-Backend/dist
COPY --from=builder /app/Hinds-Light-Backend/prisma ./Hinds-Light-Backend/prisma

# Default working directory to backend workspace
WORKDIR /app/Hinds-Light-Backend

# default command can be overridden by compose (api/workers)
CMD ["node", "dist/index.js"]


