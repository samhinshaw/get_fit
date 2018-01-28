// Bring in tools from Apollo to make writing our schema much easier
import { makeExecutableSchema } from 'graphql-tools';
import merge from 'lodash/merge';

import EntrySchema from './entries/Entry.graphql';
// Bring in TypeDefs from ./types
// import EntryType from './types/entry';
// import RequestType from './types/request';
// import RewardType from './types/reward';
// import GiftType from './types/gift';

// Bring in resolver for Entry
import EntryResolvers from './resolvers';

const testSchema = `
type Query {
  hi: String
  entries: [Entry]
}
`;

const typeDefs = [testSchema, EntrySchema];

// Resolver for 'hi'
const resolver = {
  Query: {
    hi() {
      return 'Hello Sam';
    }
  }
};

// Merge 'hi' and 'Entry' resolvers
const resolvers = merge(resolver, EntryResolvers);

// export const schema = makeExecutableSchema({
export default makeExecutableSchema({
  typeDefs,
  resolvers
});
