import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  // GraphQLString,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';

import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';

import EntryType from './types/entry';
// import Gift from '../models/gift';
// import Period from '../models/period';
// import Request from '../models/request';
// import Reward from '../models/reward';
// import User from '../models/user';

// Root Query for all models/object types
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  entry: {
    type: EntryType
  },
  args: {
    date: { GraphQLDate }
  }
});

export const entrySchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      todo: {
        type: new GraphQLList(todoType),
        args: {
          itemId: {
            name: 'itemId',
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        resolve: (root, { itemId }, source, fieldASTs) => {
          const projections = getProjection(fieldASTs);
          const foundItems = new Promise((resolve, reject) => {
            ToDoMongo.find({ itemId }, projections, (err, todos) => {
              err ? reject(err) : resolve(todos);
            });
          });
          return foundItems;
        }
      }
    }
  })
});

export const userSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      todo: {
        type: new GraphQLList(todoType),
        args: {
          itemId: {
            name: 'itemId',
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        resolve: (root, { itemId }, source, fieldASTs) => {
          const projections = getProjection(fieldASTs);
          const foundItems = new Promise((resolve, reject) => {
            ToDoMongo.find({ itemId }, projections, (err, todos) => {
              err ? reject(err) : resolve(todos);
            });
          });
          return foundItems;
        }
      }
    }
  })
});
