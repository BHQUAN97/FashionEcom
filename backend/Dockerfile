# ── Stage 1: Build ──────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Production ────────────────────
FROM node:20-alpine AS prod

WORKDIR /app

# Cai dat curl de healthcheck
RUN apk add --no-cache curl

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 4000

CMD ["node", "dist/main"]
