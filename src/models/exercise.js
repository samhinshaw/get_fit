import mongoose from 'mongoose';

const { Schema } = mongoose;

const exerciseSchema = new Schema(
  {
    exercise: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { collection: 'exercises' }
);

const Exercise = mongoose.model('gift', exerciseSchema);
export default Exercise;
