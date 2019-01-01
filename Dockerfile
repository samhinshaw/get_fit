# Start from a Python image instead of a Node image
# Reference from: https://hub.docker.com/r/nikolaik/python-nodejs/dockerfile
FROM python:3.6-jessie

#############################
##   Python & Node Setup   ##
#############################

# Install node prereqs, nodejs and yarn
# Ref: https://deb.nodesource.com/setup_8.x
# Ref: https://yarnpkg.com/en/docs/install
RUN \
  apt-get update && \
  apt-get install -yqq apt-transport-https

RUN \
  echo "deb https://deb.nodesource.com/node_8.x jessie main" > /etc/apt/sources.list.d/nodesource.list && \
  wget -qO- https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
  wget -qO- https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  apt-get update && \
  apt-get install -yqq nodejs yarn && \
  pip install -U pip && pip install pipenv && \
  npm i -g npm@^6 && \
  rm -rf /var/lib/apt/lists/*

RUN pip install arrow==0.10.0 \
  bson==0.5.7                 \     
  myfitnesspal==1.11.0        \
  pymongo==3.7.2              \
  python-dateutil==2.6.1      \
  python-dotenv==0.1.0

#################
##   BACKEND   ##
#################

# Create a directory where our app will be placed
# (-p creates the intermediate directories /usr/src if they don’t already exist)
RUN mkdir -p /app

# Change directory so that our commands run inside this new directory
WORKDIR /app

# For some reason nodemon & snyk need to be install globally
RUN yarn global add nodemon
# RUN yarn global add snyk

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