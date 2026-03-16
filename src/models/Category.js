import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    minAge: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    maxAge: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
