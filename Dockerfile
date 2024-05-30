FROM node:latest

WORKDIR /var/www/html/public

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]