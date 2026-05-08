import mongoose from 'mongoose';

const seasonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    albums: {
      type: [
        {
          title: { type: String, required: true, trim: true },
          photos: {
            type: [
              {
                url: { type: String, default: '' },
                key: { type: String, default: '' },
                createdAt: { type: Date, default: Date.now },
              },
            ],
            default: [],
          },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    photos: {
      type: [
        {
          url: { type: String, default: '' },
          key: { type: String, default: '' },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    ageCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Season = mongoose.model('Season', seasonSchema);
