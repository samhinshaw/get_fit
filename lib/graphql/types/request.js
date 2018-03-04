// TypeDef for our Request Schema. Corresponds to request.js model for MongoDB
const RequestType = `
scalar Date

  type Request {
    reward: String!
    displayName: String!
    pointCost: Int!
    requester: String!
    timeRequested: Date!
    requestMessage: String
    responseMessage: String
    statue: String!
    timeResponded: Date
  }

  type Query {
    requester(requester: String!): Request
    dates(date: Date!): Request
  }
`;

export default RequestType;
