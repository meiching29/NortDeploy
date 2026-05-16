FROM node:20-alpine

# Docker CLI para crear contenedores dinámicamente
RUN apk add --no-cache docker-cli git

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Carpeta donde se clonan los repos
RUN mkdir -p /app/repos

EXPOSE 4000

CMD ["node", "src/index.js"]