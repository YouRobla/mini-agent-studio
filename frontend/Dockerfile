# Imagen del frontend. Dos fases: Node compila React a archivos estáticos y la
# imagen final es solo nginx sirviéndolos (sin Node ni código fuente).
# nginx-unprivileged es la variante oficial de NGINX que no corre como root
# (por eso escucha en el 8080 y no en el 80).

FROM node:26.13.1-alpine3.24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30.6-alpine3.24
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# La imagen ya usa este usuario sin privilegios; se declara para que se vea aquí.
USER nginx
EXPOSE 8080
