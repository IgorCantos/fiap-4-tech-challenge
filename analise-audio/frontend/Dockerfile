FROM node:20.18-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "/app/entrypoint.sh"]
