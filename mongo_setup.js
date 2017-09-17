const conn = new Mongo();
const db = conn.getDB('myDatabase');

// create admin user (me) on admin database
// use admin

// This grants admin to everything!
db.createUser({
  user: 'samhinshaw',
  pwd: '*******',
  roles: [{ role: 'root', db: 'admin' }]
});

// create user for this app on the app database
// use get_fit

// turns out this method only grants admin privelege to the current database
db.createUser({
  user: 'getFitAdmin',
  pwd: 'unsecure',
  roles: ['readWrite', 'dbAdmin']
});

db.createUser({
  user: 'frontEnd',
  pwd: 'unsecure',
  roles: ['read']
});

db.createUser({
  user: 'backEnd',
  pwd: 'unsecure',
  roles: ['readWrite']
});

// db.users.insert({
//   name: 'Amelia',
//   calGoal: 1600
// });

// db.users.insert({
//   name: 'Sam',
//   calGoal: 1800
// });

// // update fields

// db.users.update(
//   {
//     name: 'Amelia'
//   },
//   {
//     name: 'Amelia',
//     calGoal: 1800
//   }
// );

// // or if we don't want to have to respecify every parameter...

// db.users.update(
//   {
//     name: 'Amelia'
//   },
//   {
//     $set: {
//       calGoal: 1600
//     }
//   }
// );

// after consulting some web resources, I think it will be better to have a
// separate collection for each of us, plus a collection for global information.

db.createCollection('amelia');
db.createCollection('sam');
db.createCollection('userInfo');

db.userInfo.insert({
  name: 'amelia',
  calGoal: 1600
});

db.userInfo.insert({
  name: 'sam',
  calGoal: 1800
});

// initialize number of points
db.userInfo.update(
  {
    name: 'amelia'
  },
  {
    $set: {
      points: 0
    }
  }
);

db.userInfo.update(
  {
    name: 'sam'
  },
  {
    $set: {
      points: 0
    }
  }
);

db.articles.insert({
  title: 'Article One',
  author: 'Sam',
  body: 'Seven were killed today in a mass shooting in Bolivia'
});

db.articles.insert({
  title: 'Article Two',
  author: 'Sam',
  body: 'A truck bomb went off in Portugal'
});
