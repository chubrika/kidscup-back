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

  const admin = await User.create({
    email: 'admin@kidscup.ge',
    password: 'AdminKidsCup',
    name: 'Admin',
  });
  console.log('Created user:', admin.email);

  const u12 = await Category.create({
    name: 'U12',
    minAge: 8,
    maxAge: 12,
    description: 'Under 12 (ages 11–12)',
  });
  const u14 = await Category.create({
    name: 'U14',
    minAge: 10,
    maxAge: 14,
    description: 'Under 14 (ages 13–14)',
  });
  console.log('Created categories: U12, U14');

  const teams = await Team.insertMany([
    { name: 'Eagles', city: 'Springfield', coachName: 'John Smith', ageCategory: u12._id },
    { name: 'Hawks', city: 'Riverside', coachName: 'Mike Johnson', ageCategory: u12._id },
    { name: 'Tigers', city: 'Oakville', coachName: 'Sarah Williams', ageCategory: u12._id },
    { name: 'Wolves', city: 'Springfield', coachName: 'David Brown', ageCategory: u14._id },
    { name: 'Bears', city: 'Riverside', coachName: 'Emma Davis', ageCategory: u14._id },
  ]);
  console.log('Created', teams.length, 'teams');

  const [eagles, hawks, tigers, wolves, bears] = teams;

  const players = await Player.insertMany([
    { firstName: 'Alex', lastName: 'Green', number: 5, position: 'PG', teamId: eagles._id, height: 155 },
    { firstName: 'Ben', lastName: 'Miller', number: 7, position: 'SG', teamId: eagles._id, height: 158 },
    { firstName: 'Chris', lastName: 'Lee', number: 10, position: 'SF', teamId: eagles._id, height: 162 },
    { firstName: 'Danny', lastName: 'Wilson', number: 4, position: 'PF', teamId: hawks._id, height: 165 },
    { firstName: 'Ethan', lastName: 'Taylor', number: 8, position: 'C', teamId: hawks._id, height: 168 },
    { firstName: 'Finn', lastName: 'Anderson', number: 6, position: 'PG', teamId: tigers._id, height: 154 },
    { firstName: 'George', lastName: 'Thomas', number: 9, position: 'SG', teamId: wolves._id, height: 172 },
    { firstName: 'Henry', lastName: 'Jackson', number: 11, position: 'SF', teamId: wolves._id, height: 175 },
    { firstName: 'Ian', lastName: 'White', number: 12, position: 'PF', teamId: bears._id, height: 178 },
    { firstName: 'Jake', lastName: 'Harris', number: 3, position: 'C', teamId: bears._id, height: 180 },
  ]);
  console.log('Created', players.length, 'players');

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  const matches = await Match.insertMany([
    {
      homeTeam: eagles._id,
      awayTeam: hawks._id,
      date: new Date(baseDate),
      time: '10:00',
      location: 'Main Arena',
      ageCategory: u12._id,
      status: 'finished',
      scoreHome: 42,
      scoreAway: 38,
    },
    {
      homeTeam: hawks._id,
      awayTeam: tigers._id,
      date: new Date(baseDate.getTime() + 86400000),
      time: '11:00',
      location: 'Court 1',
      ageCategory: u12._id,
      status: 'finished',
      scoreHome: 35,
      scoreAway: 40,
    },
    {
      homeTeam: wolves._id,
      awayTeam: bears._id,
      date: new Date(baseDate.getTime() + 86400000 * 2),
      time: '14:00',
      location: 'Main Arena',
      ageCategory: u14._id,
      status: 'scheduled',
      scoreHome: 0,
      scoreAway: 0,
    },
  ]);
  console.log('Created', matches.length, 'matches');

  console.log('Seed completed.');
  console.log('Login: admin@kidscup.ge / AdminKidsCup');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
