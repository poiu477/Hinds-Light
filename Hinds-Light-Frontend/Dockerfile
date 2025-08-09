# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# --- Base: install deps ---
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# Enable Yarn via Corepack
RUN corepack enable

# Copy Yarn workspace root files
COPY package.json yarn.lock .yarnrc.yml .yarn/ ./

# Copy only frontend workspace manifest
COPY Hinds-Light-Frontend/package.json Hinds-Light-Frontend/package.json

# Install only frontend workspace dependencies (including dev dependencies)
RUN yarn workspaces focus hinds-light-frontend

# Copy frontend source
COPY Hinds-Light-Frontend ./Hinds-Light-Frontend

# --- Development stage ---
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app/Hinds-Light-Frontend

# Expose Next.js dev server port
EXPOSE 3000

# Run development server with Turbopack
CMD ["yarn", "dev"]

# --- Builder: build for production ---
FROM base AS builder
RUN yarn workspace hinds-light-frontend build

# --- Production runner ---
FROM node:${NODE_VERSION} AS production
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


