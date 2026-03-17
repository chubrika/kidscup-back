import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Category, Team, Player, Match } from '../models/index.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://chubro15_db_user:Lv2k9pjYkRm8752z@kidscup.ykzzzon.mongodb.net/kidscup';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Category.deleteMany({});
  await Team.deleteMany({});
  await Player.deleteMany({});
  await Match.deleteMany({});


  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
