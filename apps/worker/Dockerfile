FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

WORKDIR /app/apps/worker

CMD ["npx", "tsx", "src/worker.ts"]