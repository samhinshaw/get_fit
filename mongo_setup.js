const conn = new Mongo();
const db = conn.getDB('myDatabase');

db.createUser({
  user: 'samhinshaw',
  pwd: '*******',
  roles: ['readWrite', 'dbAdmin']
});

db.createUser({
  user: 'frontEnd',
  pwd: 'test',
  roles: ['read']
});

db.users.insert({
  name: 'Amelia',
  calGoal: 1600
});

db.users.insert({
  name: 'Sam',
  calGoal: 1800
});

// update fields

db.users.update(
  {
    name: 'Amelia'
  },
  {
    name: 'Amelia',
    calGoal: 1800
  }
);

// or if we don't want to have to respecify every parameter...

db.users.update(
  {
    name: 'Amelia'
  },
  {
    $set: {
      calGoal: 1600
    }
  }
);


// after consulting some web resources, I think it will be better to have a
// separate collection for each of us, plus a collection for global information.
// 