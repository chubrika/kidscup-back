import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    photoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    photoKey: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

export const News = mongoose.model('News', newsSchema);
