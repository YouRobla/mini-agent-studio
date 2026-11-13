# Imagen del backend en dos fases: se compila con todas las dependencias y se
# ejecuta solo con las de producción, sin el código fuente ni las herramientas.

FROM node:26.13.1-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
# Sin scripts de instalación: ninguna dependencia los necesita para funcionar.
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build && npm prune --omit=dev --ignore-scripts

FROM node:26.13.1-alpine3.24
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
# La base de datos vive en un volumen montado aquí; el usuario node debe poder escribir.
RUN mkdir data && chown node:node data
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/ai/status > /dev/null || exit 1
CMD ["node", "dist/main.js"]
