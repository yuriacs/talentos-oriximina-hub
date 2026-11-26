# API do Observatório. Contexto de build: raiz do repositório.
FROM node:22-alpine AS build
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY server/ ./
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --from=build /app/server/dist ./dist
COPY server/scripts ./scripts
COPY server/src ./src
COPY db/migrations /app/db/migrations
ENV MIGRATIONS_DIR=/app/db/migrations UPLOADS_DIR=/data/uploads PORT=3000
RUN mkdir -p /data/uploads && chown -R node:node /data
USER node
EXPOSE 3000
CMD ["node", "dist/src/index.js"]
