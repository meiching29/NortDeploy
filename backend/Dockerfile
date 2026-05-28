FROM node:20-alpine

# Git + Docker CLI + Docker Compose
RUN apk add --no-cache git docker-cli docker-cli-compose

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

RUN mkdir -p /app/repos

EXPOSE 4000

CMD ["node", "src/index.js"]