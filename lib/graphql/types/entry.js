import createType from 'mongoose-schema-to-graphql';
import Entry from '../../models/entry';

const config = {
  name: 'Entry', // graphQL type's name
  description: 'Diary Entry Schema', // graphQL type's description
  class: 'GraphQLObjectType', // "definitions" class name
  schema: Entry, // your Mongoose schema "let couponSchema = mongoose.Schema({...})"
  exclude: ['_id'] // fields which you want to exclude from mongoose schema
};

const EntryType = createType(config);

module.exports = EntryType;
