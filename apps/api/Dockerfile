FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

WORKDIR /app/apps/api

CMD ["npx", "tsx", "src/index.ts"]