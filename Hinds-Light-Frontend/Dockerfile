# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# --- Builder: install deps (focused) and build Next.js ---
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Enable Yarn via Corepack
RUN corepack enable

# Copy Yarn workspace root files
COPY package.json yarn.lock .yarnrc.yml .yarn/ ./

# Copy only this workspace manifest
COPY Hinds-Light-Frontend/package.json Hinds-Light-Frontend/package.json

# Install only this workspace (Yarn 4 includes workspace-tools by default)
RUN yarn workspaces focus hinds-light-frontend

# Copy source into its workspace path
COPY Hinds-Light-Frontend ./Hinds-Light-Frontend

# Build the app (standalone output)
RUN yarn workspace hinds-light-frontend build

# --- Runner: minimal image with standalone server ---
FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy standalone server and static assets
COPY --from=builder /app/Hinds-Light-Frontend/.next/standalone ./
# Place assets under the workspace directory expected by server.js
COPY --from=builder /app/Hinds-Light-Frontend/.next/static ./Hinds-Light-Frontend/.next/static
COPY --from=builder /app/Hinds-Light-Frontend/public ./Hinds-Light-Frontend/public

# Expose Next default port
EXPOSE 3000

# Run from the workspace directory that contains server.js
WORKDIR /app/Hinds-Light-Frontend
CMD ["node", "server.js"]


