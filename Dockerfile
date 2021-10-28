## Choose the base image
FROM node:16

## The working directory where the application is copied to the image
WORKDIR /blc

COPY . .

RUN npm install

RUN npm install broken-link-checker -g

ENTRYPOINT ["blc"]
CMD ["--help"]
