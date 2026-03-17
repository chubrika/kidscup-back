import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    logoKey: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      trim: true,
    },
    coachName: {
      type: String,
      trim: true,
    },
    ageCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Team = mongoose.model('Team', teamSchema);
