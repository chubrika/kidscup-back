import { Team, Player, Match, Season } from '../models/index.js';

export async function getAdminDashboardStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const now = new Date();

  const [totalTeams, totalPlayers, pendingTeams, matchesToday, activeTournaments] = await Promise.all([
    Team.countDocuments(),
    Player.countDocuments(),
    Team.countDocuments({ status: 'pending' }),
    Match.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday } }),
    Season.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }),
  ]);

  return {
    totalTeams,
    totalPlayers,
    pendingTeams,
    matchesToday,
    activeTournaments,
  };
}

export async function getAdminChartsData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const registrationAgg = await Team.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ]);

  const [pending, approved, rejected] = await Promise.all([
    Team.countDocuments({ status: 'pending' }),
    Team.countDocuments({ status: 'approved' }),
    Team.countDocuments({ status: 'rejected' }),
  ]);

  return {
    registrations: registrationAgg,
    teamStatus: { pending, approved, rejected },
  };
}

const ACTIVITY_LIMIT = 25;

export async function getAdminActivityFeed() {
  const [teamsRaw, matchesRaw, playersRaw, approvedRaw] = await Promise.all([
    Team.find().sort({ createdAt: -1 }).limit(12).select('name createdAt').lean(),
    Match.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .select('homeTeam awayTeam date createdAt')
      .lean(),
    Player.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('teamId', 'name')
      .select('firstName lastName createdAt teamId')
      .lean(),
    Team.find({ status: 'approved' })
      .sort({ updatedAt: -1 })
      .limit(12)
      .select('name createdAt updatedAt')
      .lean(),
  ]);

  const items = [];

  for (const t of teamsRaw) {
    items.push({
      type: 'team_registered',
      message: `Team "${t.name}" registered`,
      at: new Date(t.createdAt).toISOString(),
    });
  }

  for (const t of approvedRaw) {
    const created = new Date(t.createdAt).getTime();
    const updated = new Date(t.updatedAt).getTime();
    if (updated - created > 2000) {
      items.push({
        type: 'team_approved',
        message: `Team "${t.name}" approved`,
        at: new Date(t.updatedAt).toISOString(),
      });
    }
  }

  for (const m of matchesRaw) {
    const home = m.homeTeam?.name ?? 'Home';
    const away = m.awayTeam?.name ?? 'Away';
    const at = m.createdAt ? new Date(m.createdAt) : new Date(m.date);
    items.push({
      type: 'match_created',
      message: `Match scheduled: ${home} vs ${away}`,
      at: at.toISOString(),
    });
  }

  for (const p of playersRaw) {
    const teamName = p.teamId?.name ?? 'a team';
    items.push({
      type: 'player_added',
      message: `${p.firstName} ${p.lastName} added to ${teamName}`,
      at: new Date(p.createdAt).toISOString(),
    });
  }

  items.sort((a, b) => new Date(b.at) - new Date(a.at));
  return items.slice(0, ACTIVITY_LIMIT);
}
