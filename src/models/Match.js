import mongoose from 'mongoose';

const matchStatuses = ['scheduled', 'live', 'finished', 'postponed', 'cancelled'];

const matchSchema = new mongoose.Schema(
  {
    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    awayTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    ageCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    status: {
      type: String,
      enum: matchStatuses,
      default: 'scheduled',
    },
    scoreHome: {
      type: Number,
      default: 0,
      min: 0,
    },
    scoreAway: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

matchSchema.index({ date: 1, ageCategory: 1 });

export const Match = mongoose.model('Match', matchSchema);
