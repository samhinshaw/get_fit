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

module.exports = { exerciseGroups, exerciseMappings };
