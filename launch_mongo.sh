#! /bin/bash

mongod --config /usr/local/etc/mongod.conf &&

mongo -u samhinshaw -p mjolnir -authenticationDatabase get_fit