import { Group, Match, Team } from '../models/index.js';
import { groupStageQueryFilter, isGroupStage } from '../constants/matchStage.js';

const sortStandings = (rows) =>
  rows.sort((a, b) => {
    const byPoints = b.points - a.points;
    if (byPoints !== 0) return byPoints;
    const byWins = b.won - a.won;
    if (byWins !== 0) return byWins;
    const byDiff = b.pointsDiff - a.pointsDiff;
    if (byDiff !== 0) return byDiff;
    const byFor = b.pointsFor - a.pointsFor;
    if (byFor !== 0) return byFor;
    return (a.teamName || '').localeCompare(b.teamName || '', 'ka');
  });

const initTeamRow = (teamId, teamName) => ({
  teamId,
  teamName: teamName || '',
  played: 0,
  won: 0,
  lost: 0,
  pointsFor: 0,
  pointsAgainst: 0,
});

const finalizeRow = (row) => ({
  ...row,
  played: row.won + row.lost,
  pointsDiff: row.pointsFor - row.pointsAgainst,
  points: row.won * 2 + row.lost * 1,
  tournamentPoints: row.won * 2 + row.lost * 1,
});

const applyMatchToRow = (row, scoreFor, scoreAgainst) => {
  row.pointsFor += scoreFor;
  row.pointsAgainst += scoreAgainst;
  if (scoreFor > scoreAgainst) row.won += 1;
  else row.lost += 1;
};

const teamDocId = (team) => {
  if (!team) return null;
  if (typeof team === 'object') return team._id?.toString() ?? null;
  return String(team);
};

const isApprovedTeam = (team) => {
  if (!team || typeof team !== 'object') return true;
  return !team.status || team.status === 'approved';
};

/** Add teams from matches (any status) so the table lists participants before results exist. */
function seedTeamsFromRosterMatches(teamMap, rosterMatches, { groupId = null } = {}) {
  for (const m of rosterMatches) {
    if (!isGroupStage(m.stage)) continue;
    if (groupId) {
      const matchGroup = m.group?._id?.toString() || m.group?.toString();
      if (!matchGroup || matchGroup !== groupId) continue;
    }
    for (const side of [m.homeTeam, m.awayTeam]) {
      if (!isApprovedTeam(side)) continue;
      const teamId = teamDocId(side);
      if (!teamId || teamMap.has(teamId)) continue;
      const name = typeof side === 'object' ? side.name : '';
      teamMap.set(teamId, initTeamRow(teamId, name));
    }
  }
}

function buildStandingsFromTeamsAndMatches(teams, matches, { groupId = null, rosterMatches = [] } = {}) {
  const teamMap = new Map();

  for (const team of teams) {
    const teamId = team._id?.toString();
    if (!teamId) continue;
    teamMap.set(teamId, initTeamRow(teamId, team.name));
  }

  seedTeamsFromRosterMatches(teamMap, rosterMatches, { groupId });

  for (const m of matches) {
    if (!isGroupStage(m.stage)) continue;
    if (m.status !== 'finished') continue;
    if (groupId) {
      const matchGroup = m.group?._id?.toString() || m.group?.toString();
      if (!matchGroup || matchGroup !== groupId) continue;
    }

    const homeId = m.homeTeam?._id?.toString() || m.homeTeam?.toString();
    const awayId = m.awayTeam?._id?.toString() || m.awayTeam?.toString();
    const homeName = m.homeTeam?.name;
    const awayName = m.awayTeam?.name;
    const sh = m.scoreHome ?? 0;
    const sa = m.scoreAway ?? 0;

    if (homeId) {
      if (!teamMap.has(homeId)) {
        teamMap.set(homeId, initTeamRow(homeId, homeName));
      }
      const t = teamMap.get(homeId);
      if (!t.teamName && homeName) t.teamName = homeName;
      applyMatchToRow(t, sh, sa);
    }
    if (awayId) {
      if (!teamMap.has(awayId)) {
        teamMap.set(awayId, initTeamRow(awayId, awayName));
      }
      const t = teamMap.get(awayId);
      if (!t.teamName && awayName) t.teamName = awayName;
      applyMatchToRow(t, sa, sh);
    }
  }

  return sortStandings(Array.from(teamMap.values()).map(finalizeRow));
}

/**
 * Legacy fallback: standings per age category when no groups exist.
 */
async function getLegacyCategoryStandings(ageCategoryId, seasonId) {
  const teams = await Team.find({
    status: 'approved',
    ...(ageCategoryId && { ageCategory: ageCategoryId }),
    ...(seasonId && { season: seasonId }),
  })
    .populate('ageCategory')
    .lean();

  const baseMatchFilter = {
    ...(ageCategoryId && { ageCategory: ageCategoryId }),
    ...(seasonId && { season: seasonId }),
    ...groupStageQueryFilter(),
  };

  const [finishedMatches, rosterMatches] = await Promise.all([
    Match.find({ ...baseMatchFilter, status: 'finished' })
      .populate('homeTeam awayTeam season ageCategory group')
      .lean(),
    Match.find({ ...baseMatchFilter, status: { $nin: ['cancelled'] } })
      .populate('homeTeam awayTeam ageCategory')
      .lean(),
  ]);

  const byCategory = new Map();

  for (const team of teams) {
    const catId = team.ageCategory?._id?.toString() || 'uncategorized';
    const catName = team.ageCategory?.name || 'Uncategorized';
    if (!byCategory.has(catId)) {
      byCategory.set(catId, { categoryId: catId, categoryName: catName, teams: new Map() });
    }
    const bucket = byCategory.get(catId);
    const teamId = team._id?.toString();
    if (teamId && !bucket.teams.has(teamId)) {
      bucket.teams.set(teamId, initTeamRow(teamId, team.name));
    }
  }

  for (const m of rosterMatches) {
    if (!isGroupStage(m.stage)) continue;
    const catId = m.ageCategory?._id?.toString() || 'uncategorized';
    const catName = m.ageCategory?.name || 'Uncategorized';
    if (!byCategory.has(catId)) {
      byCategory.set(catId, { categoryId: catId, categoryName: catName, teams: new Map() });
    }
    const bucket = byCategory.get(catId);
    for (const side of [m.homeTeam, m.awayTeam]) {
      if (!isApprovedTeam(side)) continue;
      const teamId = teamDocId(side);
      if (!teamId) continue;
      if (!bucket.teams.has(teamId)) {
        bucket.teams.set(teamId, initTeamRow(teamId, typeof side === 'object' ? side.name : ''));
      }
    }
  }

  for (const m of finishedMatches) {
    if (!isGroupStage(m.stage)) continue;
    const catId = m.ageCategory?._id?.toString() || 'uncategorized';
    const catName = m.ageCategory?.name || 'Uncategorized';
    if (!byCategory.has(catId)) {
      byCategory.set(catId, { categoryId: catId, categoryName: catName, teams: new Map() });
    }
    const bucket = byCategory.get(catId);
    const homeId = m.homeTeam?._id?.toString();
    const awayId = m.awayTeam?._id?.toString();
    const sh = m.scoreHome ?? 0;
    const sa = m.scoreAway ?? 0;

    if (homeId) {
      if (!bucket.teams.has(homeId)) {
        bucket.teams.set(homeId, initTeamRow(homeId, m.homeTeam?.name));
      }
      applyMatchToRow(bucket.teams.get(homeId), sh, sa);
    }
    if (awayId) {
      if (!bucket.teams.has(awayId)) {
        bucket.teams.set(awayId, initTeamRow(awayId, m.awayTeam?.name));
      }
      applyMatchToRow(bucket.teams.get(awayId), sa, sh);
    }
  }

  return Array.from(byCategory.values()).map((g) => ({
    categoryId: g.categoryId,
    categoryName: g.categoryName,
    groupId: null,
    groupName: g.categoryName,
    standings: sortStandings(Array.from(g.teams.values()).map(finalizeRow)),
  }));
}

async function loadTeamsAndMatches({ ageCategoryId, seasonId, groupId }) {
  const teamFilter = {
    status: 'approved',
    ...(ageCategoryId && { ageCategory: ageCategoryId }),
    ...(seasonId && { season: seasonId }),
    ...(groupId && { group: groupId }),
  };

  const baseMatchFilter = {
    ...(ageCategoryId && { ageCategory: ageCategoryId }),
    ...(seasonId && { season: seasonId }),
    ...(groupId && { group: groupId }),
    ...groupStageQueryFilter(),
  };

  const [teams, finishedMatches, rosterMatches] = await Promise.all([
    Team.find(teamFilter).lean(),
    Match.find({ ...baseMatchFilter, status: 'finished' })
      .populate('homeTeam awayTeam group round')
      .lean(),
    Match.find({ ...baseMatchFilter, status: { $nin: ['cancelled'] } })
      .populate('homeTeam awayTeam group')
      .lean(),
  ]);

  return { teams, matches: finishedMatches, rosterMatches };
}

/**
 * Overall statistics across all groups (finished matches with a group, or legacy without group).
 */
export const getOverallStandings = async (ageCategoryId = null, seasonId = null) => {
  const teamFilter = {
    status: 'approved',
    ...(ageCategoryId && { ageCategory: ageCategoryId }),
    ...(seasonId && { season: seasonId }),
  };

  const matchFilter = {
    status: 'finished',
    ...(ageCategoryId && { ageCategory: ageCategoryId }),
    ...(seasonId && { season: seasonId }),
    ...groupStageQueryFilter(),
  };

  const [teams, matches] = await Promise.all([
    Team.find(teamFilter).lean(),
    Match.find(matchFilter).populate('homeTeam awayTeam group').lean(),
  ]);

  const rosterMatches = await Match.find({
    ...(ageCategoryId && { ageCategory: ageCategoryId }),
    ...(seasonId && { season: seasonId }),
    status: { $nin: ['cancelled'] },
    ...groupStageQueryFilter(),
  })
    .populate('homeTeam awayTeam group')
    .lean();

  const standings = buildStandingsFromTeamsAndMatches(teams, matches, { rosterMatches });

  return {
    scope: 'overall',
    categoryId: ageCategoryId,
    standings,
  };
};

/**
 * Standings for one group.
 */
export const getGroupStandings = async (groupId, ageCategoryId = null, seasonId = null) => {
  const group = await Group.findById(groupId).lean();
  if (!group) return null;

  const { teams, matches, rosterMatches } = await loadTeamsAndMatches({
    ageCategoryId: ageCategoryId || group.ageCategory?.toString(),
    seasonId: seasonId || group.season?.toString(),
    groupId,
  });

  return {
    groupId: String(group._id),
    groupName: group.name,
    sortOrder: group.sortOrder ?? 0,
    seasonId: group.season?.toString(),
    standings: buildStandingsFromTeamsAndMatches(teams, matches, {
      groupId: String(group._id),
      rosterMatches,
    }),
  };
};

/**
 * Main entry: per-group standings, optional overall scope, legacy fallback.
 */
export const getStandings = async (ageCategoryId = null, seasonId = null, options = {}) => {
  const { groupId = null, scope = null } = options;

  if (scope === 'overall') {
    return [await getOverallStandings(ageCategoryId, seasonId)];
  }

  if (groupId) {
    const single = await getGroupStandings(groupId, ageCategoryId, seasonId);
    return single ? [single] : [];
  }

  const groupFilter = {
    ...(seasonId && { season: seasonId }),
    ...(ageCategoryId && { ageCategory: ageCategoryId }),
  };

  const groups = await Group.find(groupFilter).sort({ sortOrder: 1, name: 1 }).lean();

  if (groups.length === 0) {
    return getLegacyCategoryStandings(ageCategoryId, seasonId);
  }

  const result = [];
  for (const group of groups) {
    const { teams, matches, rosterMatches } = await loadTeamsAndMatches({
      ageCategoryId,
      seasonId: seasonId || group.season?.toString(),
      groupId: String(group._id),
    });
    result.push({
      groupId: String(group._id),
      groupName: group.name,
      sortOrder: group.sortOrder ?? 0,
      seasonId: group.season?.toString(),
      standings: buildStandingsFromTeamsAndMatches(teams, matches, {
        groupId: String(group._id),
        rosterMatches,
      }),
    });
  }

  return result;
};
