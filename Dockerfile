# Start from small Node 11 Image
FROM node:11-alpine

#################
##   SYSTEM   ##
#################

RUN apk update && apk upgrade && \
  apk add --no-cache bash git openssh

#################
##   BACKEND   ##
#################

EXPOSE 8005

# Create a directory where our app will be placed
# (-p creates the intermediate directories /usr/src if they don’t already exist)
RUN mkdir -p /app

# Change directory so that our commands run inside this new directory
WORKDIR /app

# Copy dependency definitions and Snyk policy file
COPY ./package.json /app
COPY ./yarn.lock /app
COPY ./.snyk /app

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

# Transpile backend code
RUN yarn transpile

# Bundle assets
RUN yarn bundle

#################
##    START    ##
#################

# Default command is to spin up server in production mode
CMD ["yarn", "run:prod"]
