// Bring in tools from Apollo to make writing our schema much easier
import { makeExecutableSchema } from 'graphql-tools';
import merge from 'lodash/merge';

import QuerySchema from './schemas/Query.graphql';
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

// Merge all Schemas (which are NOT JS objects)
const typeDefs = merge([QuerySchema, EntrySchema, UserSchema]);

// Merge all resolvers (which are JS Objects)
const resolvers = merge(EntryResolvers, UserResolvers);

// export const schema = makeExecutableSchema({
export default makeExecutableSchema({
  typeDefs,
  resolvers
});
