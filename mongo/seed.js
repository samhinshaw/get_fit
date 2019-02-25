/* eslint-env mongo */

const exerciseGroups = [
  {
    group: 'veryLightExercise',
    pointsPerHour: 0.5,
    exercises: ['walking', 'stretching'],
  },
  {
    group: 'lightExercise',
    pointsPerHour: 1,
    exercises: ['yoga', 'hiking', 'skiing'],
  },
  {
    group: 'cardio',
    pointsPerHour: 2,
    exercises: ['jogging', 'running', 'dancing', 'paddleboarding', 'parkour'],
  },
  {
    group: 'crossTrain',
    pointsPerHour: 4,
    exercises: [
      'low intensity strength training',
      'high intensity strength training',
      'bodyweight training',
      'kelly tape',
    ],
  },
];

const exerciseMappings = [
  { mfpName: 'jog', mappedName: 'jogging' },
  { mfpName: 'yoga', mappedName: 'yoga' },
  { mfpName: 'run', mappedName: 'running' },
  { mfpName: 'low intensity strength training', mappedName: 'low intensity strength training' },
  { mfpName: 'high intensity strength training', mappedName: 'high intensity strength training' },
  { mfpName: 'bodyweight training', mappedName: 'bodyweight training' },
  { mfpName: 'dancing', mappedName: 'dancing' },
  { mfpName: 'stretch', mappedName: 'stretching' },
  { mfpName: 'paddleboarding', mappedName: 'paddleboarding' },
  { mfpName: 'kelly', mappedName: 'kelly tape' },
  { mfpName: 'fitstar', mappedName: 'bodyweight training' },
  { mfpName: 'walk', mappedName: 'walking' },
  { mfpName: 'hiking', mappedName: 'hiking' },
  { mfpName: 'mfp ios calorie adjustment', mappedName: 'steps' },
  { mfpName: 'resort skiing (low effort)', mappedName: 'skiing' },
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
  exerciseGroups,
  exerciseMappings,
});
