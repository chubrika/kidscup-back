import { Round, Team } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const teamGroupId = (team) => {
  if (!team?.group) return null;
  const g = team.group;
  return typeof g === 'object' && g._id ? String(g._id) : String(g);
};

export const validateMatchTeams = async (data) => {
  const homeTeamId = data.homeTeam;
  const awayTeamId = data.awayTeam;
  const groupId = data.group;

  if (homeTeamId && awayTeamId && String(homeTeamId) === String(awayTeamId)) {
    throw new AppError('Home and away team must be different.', 400);
  }

  if (!groupId) return;

  const [homeTeam, awayTeam, roundDoc] = await Promise.all([
    homeTeamId ? Team.findById(homeTeamId).select('group season ageCategory').lean() : null,
    awayTeamId ? Team.findById(awayTeamId).select('group season ageCategory').lean() : null,
    data.round ? Round.findById(data.round).select('group').lean() : null,
  ]);

  const expectedGroup = String(groupId);

  if (homeTeam) {
    const homeGroup = teamGroupId(homeTeam);
    if (homeGroup && homeGroup !== expectedGroup) {
      throw new AppError('Home team must belong to the selected group.', 400);
    }
  }
  if (awayTeam) {
    const awayGroup = teamGroupId(awayTeam);
    if (awayGroup && awayGroup !== expectedGroup) {
      throw new AppError('Away team must belong to the selected group.', 400);
    }
  }

  if (data.round) {
    if (!roundDoc) throw new AppError('Round not found.', 404);
    if (String(roundDoc.group) !== expectedGroup) {
      throw new AppError('Round must belong to the selected group.', 400);
    }
  }
};
