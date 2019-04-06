/* eslint-env mongo */

const { exerciseGroups, exerciseMappings } = require('./exercises');

db.users.insertOne({
  firstname: 'John',
  lastname: 'Tester',
  username: 'john',
  email: 'johntestuser@protonmail.com',
  mfp: 'johntestuser',
  partner: 'jane',
  fitnessGoal: 'washboard abs',
  password: '$2a$16$7tf1GT1mbe9DiDn1i6Wc/.iFwKMQlfT7rDLhIWU6iV/suhtviDWS.',
  currentPoints: 1,
  startDate: '2019-04-01',
  exerciseGroups,
  exerciseMappings,
});

db.users.insertOne({
  firstname: 'Jane',
  lastname: 'Tester',
  username: 'jane',
  email: 'janetestuser@protonmail.com',
  mfp: 'janetestuser',
  partner: 'john',
  fitnessGoal: 'buns of steel',
  password: '$2a$16$nLmMyfVI9XFQc53Ijr91zuwI/SsTMbv1C4plX4LKrxdpHZ857xpIS',
  currentPoints: 5.1,
  startDate: '2019-04-01',
  exerciseGroups,
  exerciseMappings,
});
