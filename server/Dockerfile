# syntax = docker/dockerfile:1
FROM node:12.18.1
ENV NODE_ENV=prouduction

WORKDIR /express_seed
COPY ["package.json", "package-lock.json", "yarn.lock", "./"]
COPY . .

RUN npm install --production
RUN npm install typescript
RUN npm install yarn

CMD ["yarn", "run", "start"]
