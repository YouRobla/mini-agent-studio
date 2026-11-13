# Imagen del frontend: se compila con Node y lo sirve nginx, que además reenvía
# /api al backend (el mismo papel que el proxy de Vite en desarrollo).

FROM node:26.13.1-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM nginx:1.30.6-alpine3.24
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
