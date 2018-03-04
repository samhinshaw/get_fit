// TypeDef for our User Schema. Corresponds to user.js model for MongoDB. I am
// not sure if I will need to call this, as I will likely pass the user object
// along from the server. This is why I have not written a query field yet.
const UserType = `
scalar Date

  type User {
    firstname: String!
    lastname: String
    username: String!
    email: String!
    partner: String
    password: String!
    mfp: String!
    currentPoints: Int!
    fitnessGoal: String
  }
`;

export default UserType;
