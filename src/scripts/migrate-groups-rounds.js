/**
 * One-time migration: creates default groups (A, B) and rounds 1–7 per group
 * for each season that has teams/matches but no groups yet.
 * Existing teams and matches are preserved; group/round fields stay null until assigned in admin.
 *
 * Run: node src/scripts/migrate-groups-rounds.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Group, Round, Season, Team, Match } from '../models/index.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kidscup';

const DEFAULT_GROUPS = [
  { name: 'A ჯგუფი', sortOrder: 0 },
  { name: 'B ჯგუფი', sortOrder: 1 },
];

const ROUND_COUNT = 7;

async function migrateSeason(season) {
  const seasonId = season._id;
  const ageCategory = season.ageCategory;

  const existing = await Group.countDocuments({ season: seasonId });
  if (existing > 0) {
    console.log(`  Season "${season.name}": groups already exist, skip`);
    return;
  }

  console.log(`  Season "${season.name}": creating groups and rounds...`);
  const createdGroups = [];
  for (const g of DEFAULT_GROUPS) {
    const group = await Group.create({
      name: g.name,
      season: seasonId,
      ageCategory,
      sortOrder: g.sortOrder,
    });
    createdGroups.push(group);

    for (let n = 1; n <= ROUND_COUNT; n++) {
      await Round.create({
        group: group._id,
        name: `${n} ტური`,
        roundNumber: n,
        sortOrder: n - 1,
      });
    }
  }

  const teamCount = await Team.countDocuments({ season: seasonId });
  const matchCount = await Match.countDocuments({ season: seasonId });
  console.log(`    Created ${createdGroups.length} groups, ${ROUND_COUNT} rounds each`);
  console.log(`    Teams: ${teamCount} (assign groups in admin), Matches: ${matchCount} (unchanged)`);
}

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const seasons = await Season.find().lean();
  if (seasons.length === 0) {
    console.log('No seasons found.');
  } else {
    for (const season of seasons) {
      await migrateSeason(season);
    }
  }

  await mongoose.disconnect();
  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
