# Use default Mongo image listed here:
# https://github.com/docker-library/mongo/blob/974dbf4a5f951f4bc627dc59761dab19585edcc4/3.2/Dockerfile
# This mongo image inherits from `debian:jessie-slim`, which is also the base of
# the node images! 
# https://github.com/nodejs/docker-node/issues/618
FROM mongo:3.2

# /docker-entrypoint-initdb.d already exists, so copy our init file to it.
# This contains the logic to create our first users and setup admin accounts
# COPY init.js /docker-entrypoint-initdb.d/init.js
# Use a bash script instead of a JS script so we have access to environment variables
COPY init.sh /docker-entrypoint-initdb.d/init.sh