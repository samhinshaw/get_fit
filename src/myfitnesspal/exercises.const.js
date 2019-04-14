export const exerciseMappings = new Map([
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
]);

export const exerciseGroups = new Map([
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
]);

export const exerciseGroupPoints = new Map([
  ['veryLightExercise', 0.5],
  ['lightExercise', 1],
  ['cardio', 2],
  ['crossTrain', 4],
]);

export const commonPartialNames = ['jogging', 'running'];
