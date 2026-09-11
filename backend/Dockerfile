# Build stage
FROM node:18-bookworm-slim AS builder

WORKDIR /app

# Install openssl (required by Prisma on slim images)
RUN apt-get update -o Acquire::Check-Valid-Until=false && apt-get install -y openssl

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Production stage
FROM node:18-bookworm-slim

WORKDIR /app

# Install openssl for runtime
RUN apt-get update -o Acquire::Check-Valid-Until=false && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy built assets and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
