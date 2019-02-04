#!/bin/bash
set -e

mongo <<EOF
use $MONGO_INITDB_DATABASE
db.createUser({
  user: "$MONGO_DEV_PYTHON_USER",
  pwd: "$MONGO_DEV_PYTHON_PASS",
  roles: [{ role: "readWrite", db: "$MONGO_INITDB_DATABASE" }]
});
db.createUser({
  user: "$MONGO_DEV_NODE_USER",
  pwd: "$MONGO_DEV_NODE_PASS",
  roles: [{ role: "readWrite", db: "$MONGO_INITDB_DATABASE" }]
});
EOF

