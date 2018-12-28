FROM node:8

ADD package.json .

RUN npm install

ADD . .

CMD ["node", "service"]
