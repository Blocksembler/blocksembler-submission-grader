FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src ./src
COPY tsconfig.json .

FROM base AS build
RUN npm install --include=dev
RUN npm run build

FROM node:20-alpine AS prod

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]
