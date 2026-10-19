# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --workspace=apps/frontend
COPY apps/frontend apps/frontend

ARG API_URL=http://localhost:3000/api/
RUN mkdir -p apps/frontend/src/environments && \
    printf 'export const environment = {\n  production: false,\n  APIURL: "%s",\n};\n' "$API_URL" > apps/frontend/src/environments/environment.ts && \
    printf 'export const environment = {\n  production: true,\n  APIURL: "%s",\n};\n' "$API_URL" > apps/frontend/src/environments/environment.prod.ts

RUN npm run build --workspace=apps/frontend

# Runtime stage
FROM nginx:1.27-alpine
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist/ngine-frontend/browser /usr/share/nginx/html
EXPOSE 80