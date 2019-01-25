# Start from a Python & Node Image
# Reference from: https://hub.docker.com/r/nikolaik/python-nodejs/dockerfile
FROM samhinshaw/python-node:1.1.0

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

#################
##     COPY    ##
#################

# Get all the backend code needed to run the app
COPY ./ /app

#################
##    BUILD    ##
#################

# package front-end code
RUN yarn build:ui

# transpile back-end code
RUN yarn build:server

#################
##    START    ##
#################

# Default command is to spin up server in production mode
CMD ["yarn", "prod"]
