FROM node:jod-trixie-slim

RUN apt-get update && apt-get install -y curl iproute2

WORKDIR /app
COPY app /app
RUN chown -R node:node /app

USER node

EXPOSE 5090/tcp

CMD ["sh", "-c", "npm install && npm run dev"]
