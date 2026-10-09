FROM node:jod-trixie-slim

WORKDIR /app
COPY app /app
RUN chown -R node:node /app

USER node

EXPOSE 5090/tcp

CMD ["sh", "-c", "npm install && npm run dev"]
