# ── Stage 1: Build ──────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Build args — bake NEXT_PUBLIC_* vao build
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_SITE_URL=
ARG INTERNAL_API_URL=http://backend:4000/api

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Production ────────────────────
FROM node:20-alpine AS prod

WORKDIR /app

# Cai dat curl de healthcheck
RUN apk add --no-cache curl

# Next.js standalone output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
