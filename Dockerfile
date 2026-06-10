# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile=false

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set NODE_ENV to production for optimized build
ENV NODE_ENV production
# Build Next.js application (requires output: "standalone" in next.config.ts)
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Buat non-root user dan group untuk security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set permissions untuk direktori aplikasi
COPY --from=builder /app/public ./public
# Set permission yang benar untuk standalone direktori
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Buat direktori uploads dan set ownership ke nextjs
RUN mkdir -p /app/uploads/rewards && chown -R nextjs:nodejs /app/uploads

# Switch ke non-root user
USER nextjs

# Expose port yang digunakan
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Jalankan standalone server dari build Next.js
CMD ["node", "server.js"]
