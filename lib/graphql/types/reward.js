// TypeDef for our Reward Schema. Corresponds to reward.js model for MongoDB
const RewardType = `
  type Reward {
    key: String!
    displayName: String!
    cost: Int!
    for: String!
  }

  type Query {
    for(for: String!): Reward
  }
`;

export default RewardType;
