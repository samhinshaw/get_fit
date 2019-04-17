# Start from small Node 11 Image
FROM node:11-alpine AS build

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
COPY ./package-lock.json /app
COPY ./.snyk /app

# Install dependecies
RUN npm ci

#################
##     COPY    ##
#################

# Get all the backend code needed to run the app
COPY ./ /app

#################
##    BUILD    ##
#################

# Transpile backend code
RUN npm run transpile

# Bundle assets
RUN npm run bundle

###################
##    CLEANUP    ##
###################

# Run stage build
# FROM node:11-alpine
# WORKDIR /app
# COPY --from=build /app/ ./

RUN npm prune --production

RUN apk del bash git openssh

#################
##    START    ##
#################

# Default command is to spin up server in production mode
CMD ["npm", "run", "run:prod"]
