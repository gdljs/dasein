FROM node:6.9.4

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn

WORKDIR /app

COPY package.json /app/
COPY yarn.lock /app/
RUN yarn install
COPY . /app

RUN npm run build

ENTRYPOINT [ "node", "bin/dasein" ])
