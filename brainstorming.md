# Brainstorming

Document for thinking through various problems

## Exercise Matching

This problem is essentially a fuzzy-matching problem.

Given a string find the 'best' match in the database defined by the longest common substring.

### Simple Example

- Query string: 'jogging, 6mph'
- DB: ['jogging', 'swimming']

This case is relatively straightforward. We could chop up our string into increasingly smaller substrings and stop as soon as we hit a match. So, we would execute the following queries:

- 'jogging, 6mph'
- 'jogging, 6mp'
- 'ogging, 6mph'
- 'jogging, 6m'
- 'ogging, 6mp'
- 'gging, 6mph'
- ...
- 'ing'

We would immediately have an immense number of queries given even a simple string. Therefore, it would make sense to specify a smallest size match, as we would eventially query 'ing' and match against most verbs. This might look similar to:

### Substring Matching Equivalence

- Query string: 'jogging, 6mph'
- DB: ['jog', 'swimming']

In this case, 'jog' matching '[jog]ging', but 'ing' of 'swimming' matches 'jog[ing]'. This would only be a problem if we were attempting to match substrings to substrings, however. Therefore, if we decide to only match against full database entries, we can simplify our problem immensely.

Therefore, 'ing' would only match an 'ing' entry, not 'swimming'. However, 'jog' would match 'jog'. This also prevents any silly matches like 'i' -> 'swimming'.

### Substring Matching (Too Small)

- Query string: 'jogging, 6mph'
- DB: ['yoga', 'swimming']

In this example, if we executed my proposed search, we would actually find no hits, as no substring of the query string can **fully match** 'yoga' or 'swimming'.

Let's limit our smallest character query size to 3 then.

### Efficient Querying

The next question is how we could search the database with all of these chopped up substrings without making N queries.

### Text Searching

MongoDB actually has support for text searching! You first need to index a collection by the text, and then you can search by it.

```mongo
db.users.createIndex( { "exerciseGroups.exercises": "text" } )
```

```mongo
db.users.find( { $text: { $search: "low intensity strength training" } }, { score: { $meta: "textScore" } } ).sort( { score: { $meta: "textScore" } } )
```

This doesn't seem to be working properly, and it may have to do with the fact that these might not be unique across our users collection. Instead, let's try regex searching for now.

```mongo
db.users.find( { "username": "sam" }, { "exerciseGroups": { "$elemMatch": { "exercises": { "$regex": /jog/ } } } } )
db.users.find(
  {
     "username": "sam",
     $text: { $search: "low intensity strength training" }
  },
  {
    "exerciseGroups":  {
      "exercises": { "$elemMatch": { "$regex": /jog/ } }
    }
  }
)
```

We may need to do some aggregate pipeline filtering to get the projection we want...

[[ref](https://stackoverflow.com/questions/28982285/mongodb-projection-of-nested-arrays)]

```mongo
db.users.aggregate([
  // Query the documents
  {
    "$match": {
      "username": "sam",
      "exerciseGroups.exercises": {
        "$regex": /jog/
      }
    }
  },
  // De-normalize??
  { "$unwind": "$exerciseGroups" },
  { "$unwind": "$exerciseGroups.exercises" },
  // Filter the actual array elements as desired
  {
    "$match": {
      "exerciseGroups.exercises": {
        "$regex": /jog/
      }
    }
  },
  // Group the intermediate result
  {
    "$group": {
      "_id": { "username": "$username"},
      "exerciseGroup": { "$push": "$exerciseGroups" }
      // "exercises": { "$push": "$exerciseGroups.exercises" }
    }
  },
  { "$unwind": "$exerciseGroup" },
  // Group the final result
  {
    "$group": {
      "_id": "$_id.username",
      "exerciseGroup": {
        "$push": "$exerciseGroup"
      }
    }
  },
  { "$unwind": "$exerciseGroup" }
])
```

Huzzah! The result:

```mongo
{ "_id" : "sam", "exerciseGroup" : { "group" : "cardio", "pointsPerHour" : 2, "exercises" : "jogging" } }
```

Man, I wish I could just code this up with dplyr. Definitely time to practice SQL.

I am curious what happens if we query something that we expect to get multiple hits on. What happens if we search for "ing"?

```mongo
db.users.aggregate([
  // Query the documents
  {
    "$match": {
      "username": "sam",
      "exerciseGroups.exercises": {
        "$regex": /ing/
      }
    }
  },
  // De-normalize??
  { "$unwind": "$exerciseGroups" },
  { "$unwind": "$exerciseGroups.exercises" },
  // Filter the actual array elements as desired
  {
    "$match": {
      "exerciseGroups.exercises": {
        "$regex": /ing/
      }
    }
  },
  // Group the intermediate result
  {
    "$group": {
      "_id": { "username": "$username"},
      "exerciseGroup": { "$push": "$exerciseGroups" }
      // "exercises": { "$push": "$exerciseGroups.exercises" }
    }
  },
  { "$unwind": "$exerciseGroup" },
  // Group the final result
  {
    "$group": {
      "_id": "$_id.username",
      "exerciseGroup": {
        "$push": "$exerciseGroup"
      }
    }
  },
  { "$unwind": "$exerciseGroup" }
])
```

What if we search for multiple terms?

```mongo
db.users.aggregate([
  // Query the documents
  {
    "$match": {
      "username": "sam",
      "exerciseGroups.exercises": {
        "$regex": /^swimming$|^jogging$/
      }
    }
  },
  // De-normalize??
  { "$unwind": "$exerciseGroups" },
  { "$unwind": "$exerciseGroups.exercises" },
  // Filter the actual array elements as desired
  {
    "$match": {
      "exerciseGroups.exercises": {
        "$regex": /^swimming$|^jogging$/
      }
    }
  },
  // Group the intermediate result
  {
    "$group": {
      "_id": { "username": "$username"},
      "exerciseGroup": { "$push": "$exerciseGroups" }
      // "exercises": { "$push": "$exerciseGroups.exercises" }
    }
  },
  { "$unwind": "$exerciseGroup" },
  // Group the final result
  {
    "$group": {
      "_id": "$_id.username",
      "exerciseGroup": {
        "$push": "$exerciseGroup"
      }
    }
  },
  { "$unwind": "$exerciseGroup" }
])
```
