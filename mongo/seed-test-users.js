/* eslint-env mongo */

const exerciseMappings = [
  ['jog', 'jogging'],
  ['yoga', 'yoga'],
  ['run', 'running'],
  ['low intensity strength training', 'low intensity strength training'],
  ['high intensity strength training', 'high intensity strength training'],
  ['bodyweight training', 'bodyweight training'],
  ['dancing', 'dancing'],
  ['stretch', 'stretching'],
  ['paddleboarding', 'paddleboarding'],
  ['kelly', 'kelly tape'],
  ['fitstar', 'bodyweight training'],
  ['walk', 'walking'],
  ['hiking', 'hiking'],
  ['mfp ios calorie adjustment', 'steps'],
  ['resort skiing (low effort)', 'skiing'],
];

const exerciseGroups = [
  ['walking', 'veryLightExercise'],
  ['stretching', 'veryLightExercise'],
  ['yoga', 'lightExercise'],
  ['hiking', 'lightExercise'],
  ['skiing', 'lightExercise'],
  ['jogging', 'cardio'],
  ['running', 'cardio'],
  ['dancing', 'cardio'],
  ['paddleboarding', 'cardio'],
  ['parkour', 'cardio'],
  ['low intensity strength training', 'crossTrain'],
  ['high intensity strength training', 'crossTrain'],
  ['bodyweight training', 'crossTrain'],
  ['kelly tape', 'crossTrain'],
];

const exerciseGroupPoints = [
  ['veryLightExercise', 0.5],
  ['lightExercise', 1],
  ['cardio', 2],
  ['crossTrain', 4],
];

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
  exerciseMappings,
  exerciseGroups,
  exerciseGroupPoints,
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
  exerciseMappings,
  exerciseGroups,
  exerciseGroupPoints,
});
