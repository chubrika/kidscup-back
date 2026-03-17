import { Match, Team } from '../models/index.js';

/**
 * Compute standings per age category, optionally filtered by season.
 * Returns: { categoryId, categoryName, standings: [{ teamId, teamName, played, won, lost, pointsFor, pointsAgainst, pointsDiff, points }] }
 */
export const getStandings = async (ageCategoryId = null, seasonId = null) => {
  const matches = await Match.find({
    status: 'finished',
    ...(ageCategoryId && { ageCategory: ageCategoryId }),
    ...(seasonId && { season: seasonId }),
  })
    .populate('homeTeam awayTeam season ageCategory')
    .lean();

  const byCategory = new Map();

  for (const m of matches) {
    const catId = m.ageCategory?._id?.toString() || 'uncategorized';
    const catName = m.ageCategory?.name || 'Uncategorized';
    if (!byCategory.has(catId)) {
      byCategory.set(catId, { categoryId: catId, categoryName: catName, teams: new Map() });
    }
    const group = byCategory.get(catId);
    const homeId = m.homeTeam?._id?.toString();
    const awayId = m.awayTeam?._id?.toString();
    const homeName = m.homeTeam?.name;
    const awayName = m.awayTeam?.name;
    const sh = m.scoreHome ?? 0;
    const sa = m.scoreAway ?? 0;

    if (homeId) {
      if (!group.teams.has(homeId)) {
        group.teams.set(homeId, { teamId: homeId, teamName: homeName, played: 0, won: 0, lost: 0, pointsFor: 0, pointsAgainst: 0 });
      }
      const t = group.teams.get(homeId);
      t.played += 1;
      t.pointsFor += sh;
      t.pointsAgainst += sa;
      if (sh > sa) t.won += 1;
      else t.lost += 1;
    }
    if (awayId) {
      if (!group.teams.has(awayId)) {
        group.teams.set(awayId, { teamId: awayId, teamName: awayName, played: 0, won: 0, lost: 0, pointsFor: 0, pointsAgainst: 0 });
      }
      const t = group.teams.get(awayId);
      t.played += 1;
      t.pointsFor += sa;
      t.pointsAgainst += sh;
      if (sa > sh) t.won += 1;
      else t.lost += 1;
    }
  }

  const result = [];
  for (const [catId, group] of byCategory) {
    const standings = Array.from(group.teams.values()).map((t) => ({
      ...t,
      pointsDiff: t.pointsFor - t.pointsAgainst,
      points: t.won * 2 + t.lost * 1,
    }));
    standings.sort((a, b) => b.points - a.points || b.pointsDiff - a.pointsDiff);
    result.push({
      categoryId: catId,
      categoryName: group.categoryName,
      standings,
    });
  }

  return result;
};
