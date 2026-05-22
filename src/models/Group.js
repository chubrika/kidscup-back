import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
      required: true,
    },
    ageCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

groupSchema.index({ season: 1, sortOrder: 1 });

export const Group = mongoose.model('Group', groupSchema);
