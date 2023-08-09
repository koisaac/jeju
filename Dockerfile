FROM node:12.22.9

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4080
CMD ["npm", "start"]


