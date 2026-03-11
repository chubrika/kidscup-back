import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: Number,
      required: true,
      min: 0,
      max: 99,
    },
    position: {
      type: String,
      trim: true,
      enum: ['PG', 'SG', 'SF', 'PF', 'C', ''],
      default: '',
    },
    birthDate: {
      type: Date,
    },
    height: {
      type: Number,
      min: 0,
    },
    photo: {
      type: String,
      default: '',
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
  },
  { timestamps: true }
);

playerSchema.index({ teamId: 1, number: 1 }, { unique: true });

export const Player = mongoose.model('Player', playerSchema);
