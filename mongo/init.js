require('dotenv').config();

// Make user for python script
db.createUser({
  user: process.env.MONGO_GETFIT_PYTHON_USER,
  pwd: process.env.MONGO_GETFIT_PYTHON_PASS,
  roles: [{ role: 'readWrite', db: 'get_fit' }]
});

// Make user for node connection
db.createUser({
  user: process.env.MONGO_GETFIT_NODE_USER,
  pwd: process.env.MONGO_GETFIT_NODE_PASS,
  roles: [{ role: 'readWrite', db: 'get_fit' }]
});

// Insert a dummy user
db.users.insert({
  username: 'jon',
  password: '$2y$10$WJf9in/vfPMJjX3djGfxqOlf1F3XNbKeRXfFMymYnKzoUA6PMof.y',
  company: 'Jones'
});
