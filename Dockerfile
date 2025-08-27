# Production optimized build
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm cache clean --force

# Copy application code
COPY . .

# Generate Prisma client (needs to be done before removing dev dependencies)
RUN npx prisma generate

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Create necessary directories
RUN mkdir -p content/images uploads logs
RUN chown -R nodejs:nodejs . content uploads logs

USER nodejs

EXPOSE 3835

ENV NODE_ENV=production
ENV PORT=3835

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3835/api/health || exit 1

CMD ["npm", "start"]
