// Bring in tools from Apollo to make writing our schema much easier
import { makeExecutableSchema } from 'graphql-tools';
import merge from 'lodash/merge';

import EntrySchema from './schemas/Entry.graphql';
import UserSchema from './schemas/User.graphql';
// Bring in TypeDefs from ./types
// import EntryType from './types/entry';
// import RequestType from './types/request';
// import RewardType from './types/reward';
// import GiftType from './types/gift';

// Bring in resolver for Entry
import EntryResolvers from './resolvers/entries';
import UserResolvers from './resolvers/users';

// const testSchema = `
// type Query {
//   hi: String
//   entries: [Entry]
//   users: [User]
// }
// `;

const querySchema = `
scalar Date
type Query {
  entries: [Entry]
  users: [User]
}
`;

const typeDefs = [querySchema, EntrySchema, UserSchema];

// Resolver for 'hi'
// const resolver = {
//   Query: {
//     hi() {
//       return 'Hello Sam';
//     }
//   }
// };

// Merge 'hi' and 'Entry' resolvers
// const resolvers = merge(resolver, EntryResolvers);
const resolvers = merge(EntryResolvers, UserResolvers);

// export const schema = makeExecutableSchema({
export default makeExecutableSchema({
  typeDefs,
  resolvers
});
