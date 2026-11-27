FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
USER node
EXPOSE 3000
CMD ["node", "build/backend/node-server.js"]
