FROM node

LABEL maintainer="arnyminer.z@gmail.com"
LABEL version="1.0.0"

RUN mkdir -p /opt/api

WORKDIR /opt/api

COPY package.json .
RUN npm install --quiet

COPY . .

EXPOSE ${HTTP_PORT:-3000}

CMD npm start
