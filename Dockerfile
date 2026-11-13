# Un solo contenedor: NestJS sirve la API y también el frontend compilado.
# Se compila en dos fases y la imagen final lleva solo lo necesario para ejecutar.

# 1. Frontend: React compilado a archivos estáticos.
FROM node:26.13.1-alpine3.24 AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts
COPY frontend/ ./
RUN npm run build

# 2. Backend: NestJS compilado, después solo con las dependencias de producción.
FROM node:26.13.1-alpine3.24 AS backend
WORKDIR /backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --ignore-scripts
COPY backend/ ./
RUN npm run build && npm prune --omit=dev --ignore-scripts

# 3. Imagen final.
FROM node:26.13.1-alpine3.24
ENV NODE_ENV=production \
    FRONTEND_DIST=/app/public \
    DATABASE_PATH=/app/data/agents.db
WORKDIR /app
COPY --from=backend --chown=node:node /backend/package.json ./
COPY --from=backend --chown=node:node /backend/node_modules ./node_modules
COPY --from=backend --chown=node:node /backend/dist ./dist
COPY --from=frontend --chown=node:node /frontend/dist ./public
# La base de datos vive en un volumen montado aquí.
RUN mkdir data && chown node:node data
# Sin privilegios de administrador.
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/ai/status > /dev/null || exit 1
CMD ["node", "dist/main.js"]
