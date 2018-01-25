// TypeDef for our Gift Schema. Corresponds to gift.js model for MongoDB
const GiftType = `
scalar Date

  type Gift {
    reward: String
    displayName: String
    points: Int
    sender: String!
    timeSent: Date!
    message: String
  }

  type Query {
    sender(sender: String!): Gift
  }
`;

export default GiftType;
