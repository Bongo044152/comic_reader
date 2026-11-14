FROM node:jod-trixie-slim AS build

WORKDIR /app

# Native dependencies may need these tools during installation. They stay in
# this build stage and are not copied into the runtime image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY app/package*.json ./
RUN npm ci

COPY app/ ./
RUN npm run build \
    && npm prune --omit=dev

# Start from a clean image so compilers and development dependencies are absent.
FROM node:jod-trixie-slim

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

RUN mkdir -p /data && chown node:node /data
USER node

EXPOSE 5090
CMD ["npm", "start"]
