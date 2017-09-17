#! /bin/bash

mongod --config /usr/local/etc/mongod.conf &&

mongo -u 'samhinshaw' -p '*******' -authenticationDatabase 'admin'