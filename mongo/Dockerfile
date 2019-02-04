FROM mongo:4.0.5-xenial

# Bring in the Mongo configuration file
COPY mongo.conf /etc/

# /docker-entrypoint-initdb.d already exists, so copy our init file to it.
# This contains the logic to create our first users and setup admin accounts
# COPY init.js /docker-entrypoint-initdb.d/init.js
# Use a bash script instead of a JS script so we have access to environment variables
COPY init.sh /docker-entrypoint-initdb.d/init.sh
