FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY app/package*.json ./
RUN npm ci

COPY app/src ./src

EXPOSE 3000
CMD ["node", "src/index.js"]
