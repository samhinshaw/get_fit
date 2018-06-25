# Moving Exercises to Database

In lieu of our "exerciseIconDictionary.json" file, we're going to be adding our exercises directly to the database for better storage. Because portions that require this dictionary exist in our python script, we may end up moving some of that work into our JavaScript, or rewriting some of our Python code.

## Adding to Database

#### Exercise Icons

Previously we had a simple JSON object with the keys as exercises and the values as the png images. Instead, we want to have new objects for our database which have an exercise field and an image field.

Previous Object:

```json
[
  { "abs": "abs.png" },
  { "acrobatics": "acrobatics.png" },
  { "ballet": "ballet.png" },
  { "barbell": "barbell.png" },
  { "baseball": "baseball.png" },
  { "beach volleyball": "beach-volleyball.png" },
  { "bench press": "bench-press.png" },
  { "boots": "boots.png" },
  { "boxing": "boxing.png" },
  { "bungee jumping": "bungee-jumping.png" },
  { "canoeing": "canoe.png" },
  { "climbing": "climbing.png" },
  { "low intensity strength training": "curls.png" },
  { "curls": "curls.png" },
  { "cycling": "cycling.png" },
  { "dancing": "dancing.png" },
  { "dumbell": "dumbbell.png" },
  { "horseback riding": "equestrian.png" },
  { "exercise": "exercise.png" },
  { "incline press": "free-weight-press.png" },
  { "football": "football.png" },
  { "frisbee": "frisbee.png" },
  { "golf": "golf.png" },
  { "stretching": "gymnastics.png" },
  { "gymnastics": "gymnastics.png" },
  { "hula hooping": "hula.png" },
  { "bodyweight training": "jumprope.png" },
  { "jumping rope": "jumprope.png" },
  { "leg": "leg.png" },
  { "bicep": "muscle.png" },
  { "no running": "no-running.png" },
  { "paragliding": "paragliding.png" },
  { "parkour": "parkour.png" },
  { "physical therapy": "physical-therapy.png" },
  { "pilates": "pilates.png" },
  { "kelly tape": "pilates.png" },
  { "ping pong": "pingpong.png" },
  { "pull-ups": "pullups.png" },
  { "pullups": "pullups.png" },
  { "pull ups": "pullups.png" },
  { "pushups": "pushups.png" },
  { "rafting": "rafting.png" },
  { "roller skating": "roller-skating.png" },
  { "rowing boat": "row-boat.png" },
  { "rowing machine": "rowing.png" },
  { "jogging": "running.png" },
  { "running": "running.png" },
  { "sailing": "sailing.png" },
  { "scale": "scale.png" },
  { "situps": "situps.png" },
  { "skateboard": "skateboard.png" },
  { "skateboarding": "skateboarding.png" },
  { "skiing": "skiing.png" },
  { "skimboarding": "skimboarding.png" },
  { "snorkeling": "snorkeling.png" },
  { "soccer": "soccer.png" },
  { "sprinting": "sprint.png" },
  { "leg training": "squats.png" },
  { "squats": "squats.png" },
  { "squatting": "squats.png" },
  { "stairs": "stairs.png" },
  { "running stairs": "stairs.png" },
  { "paddle boarding": "paddleboarding.png" },
  { "paddleboarding": "paddleboarding.png" },
  { "surfing": "surfing.png" },
  { "ocean swimming": "swimmer.png" },
  { "swimming": "swimming.png" },
  { "martial arts": "taekwondo.png" },
  { "tennis": "tennis.png" },
  { "upper body": "torso.png" },
  { "running shoes": "trainers.png" },
  { "running treadmill": "treadmill.png" },
  { "hiking": "trekking.png" },
  { "triathalon": "triathlon.png" },
  { "volleyball": "volleyball.png" },
  { "walking": "walking.png" },
  { "high intensity strength training": "weightlifting.png" },
  { "weightlifting": "weightlifting.png" },
  { "windsurfing": "windsurfing.png" },
  { "bent row": "workout.png" },
  { "yoga": "yoga.png" }
]
```

New object:

```json
[
  {
    "exercise": "abs",
    "image": "abs.png"
  },
  {
    "exercise": "acrobatics",
    "image": "acrobatics.png"
  },
  {
    "exercise": "ballet",
    "image": "ballet.png"
  },
  {
    "exercise": "barbell",
    "image": "barbell.png"
  },
  {
    "exercise": "baseball",
    "image": "baseball.png"
  },
  {
    "exercise": "beach volleyball",
    "image": "beach-volleyball.png"
  },
  {
    "exercise": "bench press",
    "image": "bench-press.png"
  },
  {
    "exercise": "boots",
    "image": "boots.png"
  },
  {
    "exercise": "boxing",
    "image": "boxing.png"
  },
  {
    "exercise": "bungee jumping",
    "image": "bungee-jumping.png"
  },
  {
    "exercise": "canoeing",
    "image": "canoe.png"
  },
  {
    "exercise": "climbing",
    "image": "climbing.png"
  },
  {
    "exercise": "low intensity strength training",
    "image": "curls.png"
  },
  {
    "exercise": "curls",
    "image": "curls.png"
  },
  {
    "exercise": "cycling",
    "image": "cycling.png"
  },
  {
    "exercise": "dancing",
    "image": "dancing.png"
  },
  {
    "exercise": "dumbell",
    "image": "dumbbell.png"
  },
  {
    "exercise": "horseback riding",
    "image": "equestrian.png"
  },
  {
    "exercise": "exercise",
    "image": "exercise.png"
  },
  {
    "exercise": "incline press",
    "image": "free-weight-press.png"
  },
  {
    "exercise": "football",
    "image": "football.png"
  },
  {
    "exercise": "frisbee",
    "image": "frisbee.png"
  },
  {
    "exercise": "golf",
    "image": "golf.png"
  },
  {
    "exercise": "stretching",
    "image": "gymnastics.png"
  },
  {
    "exercise": "gymnastics",
    "image": "gymnastics.png"
  },
  {
    "exercise": "hula hooping",
    "image": "hula.png"
  },
  {
    "exercise": "bodyweight training",
    "image": "jumprope.png"
  },
  {
    "exercise": "jumping rope",
    "image": "jumprope.png"
  },
  {
    "exercise": "leg",
    "image": "leg.png"
  },
  {
    "exercise": "bicep",
    "image": "muscle.png"
  },
  {
    "exercise": "no running",
    "image": "no-running.png"
  },
  {
    "exercise": "paragliding",
    "image": "paragliding.png"
  },
  {
    "exercise": "parkour",
    "image": "parkour.png"
  },
  {
    "exercise": "physical therapy",
    "image": "physical-therapy.png"
  },
  {
    "exercise": "pilates",
    "image": "pilates.png"
  },
  {
    "exercise": "kelly tape",
    "image": "pilates.png"
  },
  {
    "exercise": "ping pong",
    "image": "pingpong.png"
  },
  {
    "exercise": "pull-ups",
    "image": "pullups.png"
  },
  {
    "exercise": "pullups",
    "image": "pullups.png"
  },
  {
    "exercise": "pull ups",
    "image": "pullups.png"
  },
  {
    "exercise": "pushups",
    "image": "pushups.png"
  },
  {
    "exercise": "rafting",
    "image": "rafting.png"
  },
  {
    "exercise": "roller skating",
    "image": "roller-skating.png"
  },
  {
    "exercise": "rowing boat",
    "image": "row-boat.png"
  },
  {
    "exercise": "rowing machine",
    "image": "rowing.png"
  },
  {
    "exercise": "jogging",
    "image": "running.png"
  },
  {
    "exercise": "running",
    "image": "running.png"
  },
  {
    "exercise": "sailing",
    "image": "sailing.png"
  },
  {
    "exercise": "scale",
    "image": "scale.png"
  },
  {
    "exercise": "situps",
    "image": "situps.png"
  },
  {
    "exercise": "skateboard",
    "image": "skateboard.png"
  },
  {
    "exercise": "skateboarding",
    "image": "skateboarding.png"
  },
  {
    "exercise": "skiing",
    "image": "skiing.png"
  },
  {
    "exercise": "skimboarding",
    "image": "skimboarding.png"
  },
  {
    "exercise": "snorkeling",
    "image": "snorkeling.png"
  },
  {
    "exercise": "soccer",
    "image": "soccer.png"
  },
  {
    "exercise": "sprinting",
    "image": "sprint.png"
  },
  {
    "exercise": "leg training",
    "image": "squats.png"
  },
  {
    "exercise": "squats",
    "image": "squats.png"
  },
  {
    "exercise": "squatting",
    "image": "squats.png"
  },
  {
    "exercise": "stairs",
    "image": "stairs.png"
  },
  {
    "exercise": "running stairs",
    "image": "stairs.png"
  },
  {
    "exercise": "paddle boarding",
    "image": "paddleboarding.png"
  },
  {
    "exercise": "paddleboarding",
    "image": "paddleboarding.png"
  },
  {
    "exercise": "surfing",
    "image": "surfing.png"
  },
  {
    "exercise": "ocean swimming",
    "image": "swimmer.png"
  },
  {
    "exercise": "swimming",
    "image": "swimming.png"
  },
  {
    "exercise": "martial arts",
    "image": "taekwondo.png"
  },
  {
    "exercise": "tennis",
    "image": "tennis.png"
  },
  {
    "exercise": "upper body",
    "image": "torso.png"
  },
  {
    "exercise": "running shoes",
    "image": "trainers.png"
  },
  {
    "exercise": "running treadmill",
    "image": "treadmill.png"
  },
  {
    "exercise": "hiking",
    "image": "trekking.png"
  },
  {
    "exercise": "triathalon",
    "image": "triathlon.png"
  },
  {
    "exercise": "volleyball",
    "image": "volleyball.png"
  },
  {
    "exercise": "walking",
    "image": "walking.png"
  },
  {
    "exercise": "high intensity strength training",
    "image": "weightlifting.png"
  },
  {
    "exercise": "weightlifting",
    "image": "weightlifting.png"
  },
  {
    "exercise": "windsurfing",
    "image": "windsurfing.png"
  },
  {
    "exercise": "bent row",
    "image": "workout.png"
  },
  {
    "exercise": "yoga",
    "image": "yoga.png"
  }
]
```

Now to insert these entries:

```mongo
use get_fit
db.createCollection('exercises')
db.exercises.insert([
  {
    "exercise": "abs",
    "image": "abs.png"
  },
  ...
  {
    "exercise": "yoga",
    "image": "yoga.png"
  }
])
```

Note: I was having some issues pasting this into the mongo shell, so I used Robo 3T's ability to insert documents instead. However, for that, [currently](https://github.com/Studio3T/robomongo/issues/173) you must remove the commas and array brackets (`[]`).

### Exercise Groups

Now for exercise groups. We want this to be attached to the user object, so we'll need to add an exerciseGroups field. Right now, we'll use the `$set` to update the users. In the future, we'll also use this when a user wants to update their exerciseGroups. Finally, when a user is first created, we'll prepopulate some suggested exerciseGroups for them.

Currently, our exercise groups are:

```json
  "exerciseGroups": {
    "veryLightExercise": ["walking", "stretching"],
    "lightExercise": ["yoga", "hiking"],
    "cardio": ["jogging", "running", "dancing", "paddleboarding", "parkour"],
    "crossTrain": [
      "low intensity strength training",
      "high intensity strength training",
      "bodyweight training",
      "kelly tape"
    ]
  }
```

However, we actually currently have the point values hard-coded in the python script. We'll want to make these user-adjustable, and thus store them in the database as well.

```json
  "exerciseGroups": [
    {"group": "veryLightExercise", "pointsPerHour": 0.5, "exercises": ["walking", "stretching"]},
    {"group": "lightExercise", "pointsPerHour": 1, "exercises": ["yoga", "hiking"]},
    {"group": "cardio", "pointsPerHour": 2, "exercises": ["jogging", "running", "dancing", "paddleboarding", "parkour"]},
    {"group": "crossTrain", "pointsPerHour": 4, "exercises": [
      "low intensity strength training",
      "high intensity strength training",
      "bodyweight training",
      "kelly tape"
    ]}
  ]
```

We might want to rethink the names for these before we release this.

```mongo
db.users.find({'_id': ObjectId("59db10d31e5977f5202a0c45")})
db.users.update(
  { "_id" :ObjectId("59db10d31e5977f5202a0c45") },
  { $set : {
    "exerciseGroups": [
    {"group": "veryLightExercise", "pointsPerHour": 0.5, "exercises": ["walking", "stretching"]},
    {"group": "lightExercise", "pointsPerHour": 1, "exercises": ["yoga", "hiking"]},
    {"group": "cardio", "pointsPerHour": 2, "exercises": ["jogging", "running", "dancing", "paddleboarding", "parkour"]},
    {"group": "crossTrain", "pointsPerHour": 4, "exercises": [
      "low intensity strength training",
      "high intensity strength training",
      "bodyweight training",
      "kelly tape"
    ]}
  ]}
)
db.users.find({'_id': ObjectId("59db10d31e5977f5202a0c45")})
```

```mongo
db.users.find({'_id': ObjectId("5a1b599bfbd424af2dba6fd4")})
db.users.update(
  { "_id" :ObjectId("5a1b599bfbd424af2dba6fd4") },
  { $set : {
    "exerciseGroups": [
    {"group": "veryLightExercise", "pointsPerHour": 0.5, "exercises": ["walking", "stretching"]},
    {"group": "lightExercise", "pointsPerHour": 1, "exercises": ["yoga", "hiking"]},
    {"group": "cardio", "pointsPerHour": 2, "exercises": ["jogging", "running", "dancing", "paddleboarding", "parkour"]},
    {"group": "crossTrain", "pointsPerHour": 4, "exercises": [
      "low intensity strength training",
      "high intensity strength training",
      "bodyweight training",
      "kelly tape"
    ]}
  ]}
)
db.users.find({'_id': ObjectId("5a1b599bfbd424af2dba6fd4")})
```

### Exercise Mapping

Finally, we want to store users' custom exercise mappings. This will allow them to more easily map one exercise from MFP to the same exercise with a matching name if they would like.

Currently, we have this stored in JSON as:

```json
{
  "jog": "jogging",
  "yoga": "yoga",
  "run": "running",
  "low intensity strength training": "low intensity strength training",
  "high intensity strength training": "high intensity strength training",
  "bodyweight training": "bodyweight training",
  "dancing": "dancing",
  "stretch": "stretching",
  "paddleboarding": "paddleboarding",
  "kelly": "kelly tape",
  "fitstar": "bodyweight training",
  "walk": "walking",
  "hiking": "hiking",
  "mfp ios calorie adjustment": "steps"
}
```

For addition to the database, we'll have to change this in a similar to the exercise icons.

```json
{
  "exerciseMappings": [
    { "mfpName": "jog", "mappedName": "jogging" },
    { "mfpName": "yoga", "mappedName": "yoga" },
    { "mfpName": "run", "mappedName": "running" },
    {
      "mfpName": "low intensity strength training",
      "mappedName": "low intensity strength training"
    },
    {
      "mfpName": "high intensity strength training",
      "mappedName": "high intensity strength training"
    },
    { "mfpName": "bodyweight training", "mappedName": "bodyweight training" },
    { "mfpName": "dancing", "mappedName": "dancing" },
    { "mfpName": "stretch", "mappedName": "stretching" },
    { "mfpName": "paddleboarding", "mappedName": "paddleboarding" },
    { "mfpName": "kelly", "mappedName": "kelly tape" },
    { "mfpName": "fitstar", "mappedName": "bodyweight training" },
    { "mfpName": "walk", "mappedName": "walking" },
    { "mfpName": "hiking", "mappedName": "hiking" },
    { "mfpName": "mfp ios calorie adjustment", "mappedName": "steps" }
  ]
}
```

And now we can add these to the database:

```mongo
db.users.find({'_id': ObjectId("5a1b599bfbd424af2dba6fd4")})
db.users.update(
  { "_id" :ObjectId("5a1b599bfbd424af2dba6fd4") },
  { $set : {
    "exerciseMappings": [
      { "mfpName": "jog", "mappedName": "jogging" },
      { "mfpName": "yoga", "mappedName": "yoga" },
      { "mfpName": "run", "mappedName": "running" },
      {
        "mfpName": "low intensity strength training",
        "mappedName": "low intensity strength training"
      },
      {
        "mfpName": "high intensity strength training",
        "mappedName": "high intensity strength training"
      },
      { "mfpName": "bodyweight training", "mappedName": "bodyweight training" },
      { "mfpName": "dancing", "mappedName": "dancing" },
      { "mfpName": "stretch", "mappedName": "stretching" },
      { "mfpName": "paddleboarding", "mappedName": "paddleboarding" },
      { "mfpName": "kelly", "mappedName": "kelly tape" },
      { "mfpName": "fitstar", "mappedName": "bodyweight training" },
      { "mfpName": "walk", "mappedName": "walking" },
      { "mfpName": "hiking", "mappedName": "hiking" },
      { "mfpName": "mfp ios calorie adjustment", "mappedName": "steps" }
    ]
  }}
)
db.users.find({'_id': ObjectId("5a1b599bfbd424af2dba6fd4")})
```

```mongo
db.users.find({ '_id': ObjectId("59db10d31e5977f5202a0c45") })
db.users.update(
  { "_id": ObjectId("59db10d31e5977f5202a0c45") },
  { $set: {
    "exerciseMappings": [
      { "mfpName": "jog", "mappedName": "jogging" },
      { "mfpName": "yoga", "mappedName": "yoga" },
      { "mfpName": "run", "mappedName": "running" },
      {
        "mfpName": "low intensity strength training",
        "mappedName": "low intensity strength training"
      },
      {
        "mfpName": "high intensity strength training",
        "mappedName": "high intensity strength training"
      },
      { "mfpName": "bodyweight training", "mappedName": "bodyweight training" },
      { "mfpName": "dancing", "mappedName": "dancing" },
      { "mfpName": "stretch", "mappedName": "stretching" },
      { "mfpName": "paddleboarding", "mappedName": "paddleboarding" },
      { "mfpName": "kelly", "mappedName": "kelly tape" },
      { "mfpName": "fitstar", "mappedName": "bodyweight training" },
      { "mfpName": "walk", "mappedName": "walking" },
      { "mfpName": "hiking", "mappedName": "hiking" },
      { "mfpName": "mfp ios calorie adjustment", "mappedName": "steps" }
    ]
  }}
)
db.users.find({ '_id': ObjectId("59db10d31e5977f5202a0c45") })
```

## Implementation

Next up, we need to start using the exercises in the database. As we implement this, I may find that I wish I'd change my implementation. Instead of hitting the database every time we have a question (i.e. what does this exercise map to), would it make more sense to grab the whole map and store it in memory for quick querying? This is what I'm doing now. It's a trade-off between more memory usage and more database queries. However, I think the way I've currently structured it now makes far more sense. We can query an exercise by its field and find out if it exists! Rather than needing to search through a dictionary's keys--this method allows the database to handle the searching, which it has optimized far better!

We'll need to look a few different places for each usage.

1.  Where are we asking for the icon filenames? How would it be best to query those?
2.  Where are we mapping the exercises--is that in the initial pulling down of the exercises from MFP in our Python script?
3.  Where are we grouping the exercises and assigning point values? Is that done on every route where the points are calculated, or are those calculated when we save the exercise (and the points added to the database)?

**NOTE**: We should make sure to use [`db.collection.createIndex()`](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/) when making these in order to speed up searching these arrays.

An example:

```
db.users.createIndex({'exerciseMappings':1})
```
