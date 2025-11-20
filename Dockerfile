FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args
ARG NEXT_PUBLIC_ROOT_DOMAIN
ARG NEXT_PUBLIC_PROTOCOL

# Set build-time env vars
ENV NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN
ENV NEXT_PUBLIC_PROTOCOL=$NEXT_PUBLIC_PROTOCOL
ENV POSTGRES_HOST=postgres
ENV POSTGRES_PORT=5432
ENV POSTGRES_USER=multitenant_user
ENV POSTGRES_PASSWORD=multitenant_password
ENV POSTGRES_DB=multitenant_db

RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
