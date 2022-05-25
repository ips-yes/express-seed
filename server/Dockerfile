# syntax = docker/dockerfile:1
FROM node:12.18.1
ENV NODE_ENV=prouduction

WORKDIR /express_seed
COPY ["package.json", "package-lock.json", "yarn.lock", "./"]
COPY . .

RUN npm install --production
RUN npm install typescript
RUN npm install express
RUN npm install sequelize
RUN npm install bcrypt
RUN npm install winston
RUN npm install joi
RUN npm install passport
RUN npm install yarn

CMD ["yarn", "run", "start"]
