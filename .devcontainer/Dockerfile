FROM node:20.15-alpine AS builder
RUN npm install -g pnpm
USER node
WORKDIR /app
COPY --chown=node:node src/* src/
COPY --chown=node:node package.json .
COPY --chown=node:node tsconfig.json .
COPY --chown=node:node pnpm-lock.yaml .
RUN pnpm install
RUN pnpm run build

FROM node:20.15-alpine
RUN apk add dumb-init
USER node
WORKDIR /app
ENV NODE_ENV production
COPY --chown=node:node --from=builder /app/dist/index.js .
CMD ["dumb-init", "node", "/app/index.js"]