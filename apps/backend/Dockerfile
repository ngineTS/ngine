# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm ci --workspace=apps/backend
COPY apps/backend apps/backend
RUN npm run build --workspace=apps/backend

# Runtime stage
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm ci --omit=dev --workspace=apps/backend
WORKDIR /app/apps/backend
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/uploads ./uploads
EXPOSE 3000
CMD ["node", "dist/main.js"]
