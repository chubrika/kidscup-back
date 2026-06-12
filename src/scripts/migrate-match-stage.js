/**
 * One-time migration: set stage=GROUP on existing matches that lack the field.
 * Safe to run multiple times (idempotent).
 *
 * Run: node src/scripts/migrate-match-stage.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Match } from '../models/index.js';
import { MATCH_STAGE } from '../constants/matchStage.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kidscup';

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await Match.updateMany(
    { $or: [{ stage: { $exists: false } }, { stage: null }] },
    { $set: { stage: MATCH_STAGE.GROUP } },
  );

  console.log(`Updated ${result.modifiedCount} match(es) to stage=${MATCH_STAGE.GROUP}`);

  await mongoose.disconnect();
  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
