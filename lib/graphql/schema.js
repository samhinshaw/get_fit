// Bring in tools from Apollo to make writing our schema much easier
import { makeExecutableSchema } from 'graphql-tools';

// Bring in TypeDefs from ./types
// import EntryType from './types/entry';
// import RequestType from './types/request';
// import RewardType from './types/reward';
// import GiftType from './types/gift';

const typeDefs = `
type Query {
  hi: String
}
`;

const resolvers = {
  Query: {
    hi() {
      return 'Hello World!';
    }
  }
};

// export const schema = makeExecutableSchema({
export default makeExecutableSchema({
  typeDefs,
  resolvers
});
