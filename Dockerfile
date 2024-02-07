FROM node:20.10.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build:client


EXPOSE 8000
CMD ["npm", "run", "start:server"]