# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos solo archivos necesarios para instalar deps (cache)
COPY package.json package-lock.json ./

# Instalación exacta y reproducible
RUN npm ci

# Copiamos el resto del proyecto
COPY . .

# Compilamos NestJS → dist/
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Seguridad: usuario no root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiamos SOLO lo necesario
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER appuser

CMD ["node", "dist/main.js"]
