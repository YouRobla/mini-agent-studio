# Imagen del backend (solo la API). Dos fases: se compila con todas las
# dependencias y la imagen final lleva solo las de producción y el código compilado.

FROM node:26.13.1-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build && npm prune --omit=dev --ignore-scripts

FROM node:26.13.1-alpine3.24
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
# La base de datos vive en un volumen montado aquí.
RUN mkdir data && chown node:node data
# Sin privilegios de administrador.
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
