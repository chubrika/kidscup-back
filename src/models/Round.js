import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roundNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

roundSchema.index({ group: 1, roundNumber: 1 });

export const Round = mongoose.model('Round', roundSchema);
