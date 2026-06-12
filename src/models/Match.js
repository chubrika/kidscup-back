import mongoose from 'mongoose';
import { MATCH_STAGES, DEFAULT_MATCH_STAGE } from '../constants/matchStage.js';

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
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Round',
    },
    stage: {
      type: String,
      enum: MATCH_STAGES,
      default: DEFAULT_MATCH_STAGE,
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
    refereesInfo: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

matchSchema.index({ date: 1, ageCategory: 1 });
matchSchema.index({ group: 1, round: 1 });
matchSchema.index({ stage: 1, season: 1 });

export const Match = mongoose.model('Match', matchSchema);
