FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --quiet

COPY . .

RUN npx drizzle-kit generate:pg && npm run build

FROM alpine AS production

RUN apk add --update nodejs

WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD [ "node", "./dist/main" ]