FROM node:jod-trixie-slim AS build

WORKDIR /app

# better-sqlite3 may need to compile its native addon during npm ci.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY app/package.json app/package-lock.json ./
RUN npm ci

COPY app/ ./
RUN npm run build \
    && npm prune --omit=dev

FROM node:jod-trixie-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

RUN mkdir -p /data && chown node:node /data
USER node

EXPOSE 5090

CMD ["npm", "start"]
