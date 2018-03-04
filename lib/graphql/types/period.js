// TypeDef for our Period Schema. Corresponds to entry.js model for MongoDB
const PeriodType = `
scalar Date

  type Period {
    key: String!
    startDate: Date!
    endDate: Date!
    points: Int
    user: String!
  }

  type Query {
    user(user: String!): Period
  }
`;

export default PeriodType;
