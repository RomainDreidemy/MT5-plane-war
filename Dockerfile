FROM node:18

RUN \
  apt update && \
  apt install --assume-yes mycli

WORKDIR /server
