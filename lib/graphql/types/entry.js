// TypeDef for our Entry Schema. Corresponds to entry.js model for MongoDB
const EntryType = `
scalar Date

  type Entry {
    date: Date!
    totalCals: Int!
    goalCals: Int!
    netCals: Int!
    exercise: [Exercise]
    isEmpty: Boolean!
    complete: Boolean!
    points: Int!
    user: String!
  }

  type Exercise {
    name: String!
    minutes: Int
    points: Float
    icon: String!
  }

  type Query {
    dates(date: Date!): Entry
  }
`;

export default EntryType;
