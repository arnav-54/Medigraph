# Multi-stage production Dockerfile for MediGraph Node.js Backend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install --workspace=backend

COPY backend/prisma ./backend/prisma/
RUN cd backend && npx prisma generate

COPY backend/ ./backend/

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install dumb-init for graceful signal handling
RUN apk add --no-cache dumb-init

USER node

COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/backend ./backend

EXPOSE 4000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "backend/src/server.js"]

