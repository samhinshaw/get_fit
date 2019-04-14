FROM mongo:4.0.5-xenial

# Bring in the Mongo configuration file
COPY mongo.conf /etc/

# /docker-entrypoint-initdb.d already exists, so copy our init file to it.
# This sets up admin accounts
COPY admin.sh /docker-entrypoint-initdb.d/

# Additionally, copy in any other config files we have
# This creates our first users
COPY seed*.js /docker-entrypoint-initdb.d/
