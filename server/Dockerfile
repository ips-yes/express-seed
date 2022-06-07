# syntax = docker/dockerfile:1
FROM node:12.18.1
ENV NODE_ENV=prouduction

WORKDIR /express_seed
COPY ["package.json", "yarn.lock", "./"]
COPY . .

RUN npm install yarn
RUN yarn install

CMD ["yarn", "run", "start"]
