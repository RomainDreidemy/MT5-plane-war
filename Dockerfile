FROM node:18

RUN \
    apt update && \
    apt install --assume-yes mycli && \
    npm install typescript -g && \
    npm install nodemon -g

WORKDIR /server
