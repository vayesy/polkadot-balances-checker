FROM node:23-alpine3.20

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
RUN npm install

COPY src /app/src
COPY tsconfig.json /app/tsconfig.json
RUN npm run build

COPY default-accounts.yml /data/accounts.yml

CMD ["npm", "start", "--", "/data/accounts.yml"]