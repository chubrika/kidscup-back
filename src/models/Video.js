import mongoose from 'mongoose';

const VIDEO_CATEGORIES = ['Full Match', 'Highlights', 'Interview'];
const VIDEO_STATUSES = ['draft', 'published'];

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    youtubeId: {
      type: String,
      required: true,
      trim: true,
      match: [/^[a-zA-Z0-9_-]{11}$/, 'Invalid YouTube video ID'],
    },
    category: {
      type: String,
      required: true,
      enum: VIDEO_CATEGORIES,
    },
    status: {
      type: String,
      required: true,
      enum: VIDEO_STATUSES,
      default: 'draft',
    },
  },
  { timestamps: true },
);

videoSchema.index({ status: 1, createdAt: -1 });
videoSchema.index({ youtubeId: 1 }, { unique: true });

export const Video = mongoose.model('Video', videoSchema);
