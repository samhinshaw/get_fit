#* This Dockerfile is for production
#* It bakes code into the image

# Create image based on the official Node 8 image from dockerhub. This image is
# the default node 8 image, which inherits from debian:jessie-slim, the same as
# the mongo images. Relevant issue in node docker repo:
# https://github.com/nodejs/docker-node/issues/618
FROM node:8

#################
##   BACKEND   ##
#################

# Create a directory where our app will be placed
# (-p creates the intermediate directories /usr/src if they don’t already exist)
RUN mkdir -p /app

# Change directory so that our commands run inside this new directory
WORKDIR /app

# Copy dependency definitions
COPY ./package.json /app
COPY ./yarn.lock /app

# Install dependecies
RUN yarn install

# Install nodemon
# For some reason it needs to be install globally
RUN yarn global add nodemon

#################
##     COPY    ##
#################

# Get all the backend code needed to run the app
COPY ./ /app

#################
##    START    ##
#################

# Default command is to spin up server in production mode
CMD ["yarn", "dev"]