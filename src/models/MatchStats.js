import mongoose from 'mongoose';

const matchStatsSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
    },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    rebounds: {
      type: Number,
      default: 0,
      min: 0,
    },
    assists: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

matchStatsSchema.index({ matchId: 1, playerId: 1 }, { unique: true });

export const MatchStats = mongoose.model('MatchStats', matchStatsSchema);
