FROM node:alpine

RUN npm install broken-link-checker

ENTRYPOINT ["/node_modules/.bin/blc", "-ro"]
