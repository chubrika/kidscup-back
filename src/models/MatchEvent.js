import mongoose from 'mongoose';

const { Schema } = mongoose;

export const MATCH_EVENT_TYPES = Object.freeze({
  POINT_1: 'POINT_1',
  POINT_2: 'POINT_2',
  POINT_3: 'POINT_3',
  ASSIST: 'ASSIST',
  REBOUND: 'REBOUND',
  STEAL: 'STEAL',
  BLOCK: 'BLOCK',
  FOUL: 'FOUL',
});

const matchEventSchema = new Schema(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(MATCH_EVENT_TYPES),
      index: true,
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'match_events',
    versionKey: false,
  }
);

matchEventSchema.index({ matchId: 1, createdAt: -1 });
matchEventSchema.index({ matchId: 1, teamId: 1, playerId: 1, createdAt: -1 });

export const MatchEvent = mongoose.model('MatchEvent', matchEventSchema);

