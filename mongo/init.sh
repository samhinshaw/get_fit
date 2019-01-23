#!/bin/bash
set -e

mongo <<EOF
use $MONGO_INITDB_DATABASE
db.createUser({
  user: '$MONGO_DEV_PYTHON_USER',
  pwd: '$MONGO_DEV_PYTHON_PASS',
  roles: [{ role: 'readWrite', db: '$MONGO_INITDB_DATABASE' }]
});
db.createUser({
  user: '$MONGO_DEV_NODE_USER',
  pwd: '$MONGO_DEV_NODE_PASS',
  roles: [{ role: 'readWrite', db: '$MONGO_INITDB_DATABASE' }]
});
EOF


# mongo <<EOF
# use $MONGO_INITDB_DATABASE
# db.users.insert({
#   firstname: 'amelia',
#   lastname: 'hinshaw',
#   username: 'amelia',
#   email: '$GETFIT_EMAIL_AMELIA',
#   mfp: '$GETFIT_MFP_NAME_AMELIA',
#   partner: 'sam',
#   fitnessGoal: '$GETFIT_FITNESS_GOAL_AMELIA',
#   password: '$GETFIT_HASHED_PASS_AMELIA',
#   currentPoints: 5,
#   __v: 0,
#   exerciseGroups: [
#     {
#       group: 'veryLightExercise',
#       pointsPerHour: 0.5,
#       exercises: ['walking', 'stretching']
#     },
#     {
#       group: 'lightExercise',
#       pointsPerHour: 1,
#       exercises: ['yoga', 'hiking']
#     },
#     {
#       group: 'cardio',
#       pointsPerHour: 2,
#       exercises: ['jogging', 'running', 'dancing', 'paddleboarding', 'parkour']
#     },
#     {
#       group: 'crossTrain',
#       pointsPerHour: 4,
#       exercises: [
#         'low intensity strength training',
#         'high intensity strength training',
#         'bodyweight training',
#         'kelly tape'
#       ]
#     }
#   ],
#   exerciseMappings: [
#     {
#       mfpName: 'jog',
#       mappedName: 'jogging'
#     },
#     {
#       mfpName: 'yoga',
#       mappedName: 'yoga'
#     },
#     {
#       mfpName: 'run',
#       mappedName: 'running'
#     },
#     {
#       mfpName: 'low intensity strength training',
#       mappedName: 'low intensity strength training'
#     },
#     {
#       mfpName: 'high intensity strength training',
#       mappedName: 'high intensity strength training'
#     },
#     {
#       mfpName: 'bodyweight training',
#       mappedName: 'bodyweight training'
#     },
#     {
#       mfpName: 'dancing',
#       mappedName: 'dancing'
#     },
#     {
#       mfpName: 'stretch',
#       mappedName: 'stretching'
#     },
#     {
#       mfpName: 'paddleboarding',
#       mappedName: 'paddleboarding'
#     },
#     {
#       mfpName: 'kelly',
#       mappedName: 'kelly tape'
#     },
#     {
#       mfpName: 'fitstar',
#       mappedName: 'bodyweight training'
#     },
#     {
#       mfpName: 'walk',
#       mappedName: 'walking'
#     },
#     {
#       mfpName: 'hiking',
#       mappedName: 'hiking'
#     },
#     {
#       mfpName: 'mfp ios calorie adjustment',
#       mappedName: 'steps'
#     }
#   ]
# });
# EOF

# mongo <<EOF
# use $MONGO_INITDB_DATABASE
# db.users.insert({
#   firstname: 'Sam',
#   lastname: 'Hinshaw',
#   username: 'sam',
#   email: '$GETFIT_EMAIL_SAM',
#   mfp: '$GETFIT_MFP_NAME_SAM',
#   partner: 'amelia',
#   fitnessGoal: '$GETFIT_FITNESS_GOAL_SAM',
#   password: '$GETFIT_HASHED_PASS_SAM',
#   currentPoints: 10,
#   __v: 0,
#   exerciseGroups: [
#     {
#       group: 'veryLightExercise',
#       pointsPerHour: 0.5,
#       exercises: ['walking', 'stretching']
#     },
#     {
#       group: 'lightExercise',
#       pointsPerHour: 1,
#       exercises: ['yoga', 'hiking']
#     },
#     {
#       group: 'cardio',
#       pointsPerHour: 2,
#       exercises: ['jogging', 'running', 'dancing', 'paddleboarding', 'parkour', 'swimming']
#     },
#     {
#       group: 'crossTrain',
#       pointsPerHour: 4,
#       exercises: [
#         'low intensity strength training',
#         'high intensity strength training',
#         'bodyweight training',
#         'kelly tape'
#       ]
#     }
#   ],
#   exerciseMappings: [
#     {
#       mfpName: 'jog',
#       mappedName: 'jogging'
#     },
#     {
#       mfpName: 'yoga',
#       mappedName: 'yoga'
#     },
#     {
#       mfpName: 'run',
#       mappedName: 'running'
#     },
#     {
#       mfpName: 'low intensity strength training',
#       mappedName: 'low intensity strength training'
#     },
#     {
#       mfpName: 'high intensity strength training',
#       mappedName: 'high intensity strength training'
#     },
#     {
#       mfpName: 'bodyweight training',
#       mappedName: 'bodyweight training'
#     },
#     {
#       mfpName: 'dancing',
#       mappedName: 'dancing'
#     },
#     {
#       mfpName: 'stretch',
#       mappedName: 'stretching'
#     },
#     {
#       mfpName: 'paddleboarding',
#       mappedName: 'paddleboarding'
#     },
#     {
#       mfpName: 'kelly',
#       mappedName: 'kelly tape'
#     },
#     {
#       mfpName: 'fitstar',
#       mappedName: 'bodyweight training'
#     },
#     {
#       mfpName: 'walk',
#       mappedName: 'walking'
#     },
#     {
#       mfpName: 'hiking',
#       mappedName: 'hiking'
#     },
#     {
#       mfpName: 'mfp ios calorie adjustment',
#       mappedName: 'steps'
#     }
#   ]
# });
# EOF
