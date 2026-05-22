/**
 * Standings logic tests (no DB).
 * Run: node --test src/scripts/standingsService.test.js
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function initTeamRow(teamId, teamName) {
  return {
    teamId,
    teamName,
    played: 0,
    won: 0,
    lost: 0,
    pointsFor: 0,
    pointsAgainst: 0,
  };
}

function applyMatchToRow(row, scoreFor, scoreAgainst) {
  row.pointsFor += scoreFor;
  row.pointsAgainst += scoreAgainst;
  if (scoreFor > scoreAgainst) row.won += 1;
  else row.lost += 1;
}

function finalizeRow(row) {
  return {
    ...row,
    played: row.won + row.lost,
    pointsDiff: row.pointsFor - row.pointsAgainst,
    points: row.won * 2 + row.lost * 1,
  };
}

function buildStandings(teams, finishedMatches, groupId, rosterMatches = finishedMatches) {
  const teamMap = new Map();
  for (const t of teams) teamMap.set(t.id, initTeamRow(t.id, t.name));

  for (const m of rosterMatches) {
    if (groupId && m.groupId !== groupId) continue;
    for (const id of [m.homeId, m.awayId]) {
      if (!teamMap.has(id)) {
        const t = teams.find((x) => x.id === id);
        teamMap.set(id, initTeamRow(id, t?.name ?? id));
      }
    }
  }

  for (const m of finishedMatches) {
    if (m.status !== 'finished') continue;
    if (groupId && m.groupId !== groupId) continue;

    const home = teamMap.get(m.homeId) || initTeamRow(m.homeId, m.homeName);
    const away = teamMap.get(m.awayId) || initTeamRow(m.awayId, m.awayName);
    teamMap.set(m.homeId, home);
    teamMap.set(m.awayId, away);
    applyMatchToRow(home, m.scoreHome, m.scoreAway);
    applyMatchToRow(away, m.scoreAway, m.scoreHome);
  }

  return Array.from(teamMap.values()).map(finalizeRow);
}

describe('standings (unit)', () => {
  const teams = [
    { id: 't1', name: 'Alpha' },
    { id: 't2', name: 'Beta' },
    { id: 't3', name: 'Gamma' },
  ];

  it('counts only finished matches for a group', () => {
    const matches = [
      { homeId: 't1', awayId: 't2', groupId: 'g1', status: 'finished', scoreHome: 10, scoreAway: 8 },
      { homeId: 't1', awayId: 't3', groupId: 'g1', status: 'scheduled', scoreHome: 0, scoreAway: 0 },
      { homeId: 't2', awayId: 't3', groupId: 'g2', status: 'finished', scoreHome: 5, scoreAway: 7 },
    ];
    const g1 = buildStandings(teams, matches, 'g1');
    const row1 = g1.find((r) => r.teamId === 't1');
    assert.equal(row1.played, 1);
    assert.equal(row1.won, 1);
    assert.equal(row1.points, 2);
  });

  it('overall includes all groups', () => {
    const matches = [
      { homeId: 't1', awayId: 't2', groupId: 'g1', status: 'finished', scoreHome: 10, scoreAway: 5 },
      { homeId: 't2', awayId: 't3', groupId: 'g2', status: 'finished', scoreHome: 8, scoreAway: 12 },
    ];
    const overall = buildStandings(teams, matches, null);
    assert.equal(overall.find((r) => r.teamId === 't1').played, 1);
    assert.equal(overall.find((r) => r.teamId === 't3').played, 1);
  });

  it('excludes other group matches from group standings', () => {
    const matches = [
      { homeId: 't1', awayId: 't2', groupId: 'g1', status: 'finished', scoreHome: 10, scoreAway: 8 },
      { homeId: 't1', awayId: 't3', groupId: 'g2', status: 'finished', scoreHome: 20, scoreAway: 0 },
    ];
    const g1 = buildStandings(teams, matches, 'g1');
    assert.equal(g1.find((r) => r.teamId === 't1').pointsFor, 10);
    assert.equal(g1.find((r) => r.teamId === 't3')?.played ?? 0, 0);
  });

  it('includes teams from scheduled matches in roster with zero stats', () => {
    const roster = [
      { homeId: 't1', awayId: 't2', groupId: 'g1', status: 'scheduled', scoreHome: 0, scoreAway: 0 },
    ];
    const g1 = buildStandings([], [], 'g1', roster);
    assert.equal(g1.length, 2);
    assert.equal(g1.find((r) => r.teamId === 't1').played, 0);
    assert.equal(g1.find((r) => r.teamId === 't2').points, 0);
  });

  it('played equals wins plus losses', () => {
    const matches = [
      { homeId: 't1', awayId: 't2', groupId: 'g1', status: 'finished', scoreHome: 10, scoreAway: 8 },
      { homeId: 't1', awayId: 't3', groupId: 'g1', status: 'finished', scoreHome: 6, scoreAway: 9 },
    ];
    const g1 = buildStandings(teams, matches, 'g1');
    const row = g1.find((r) => r.teamId === 't1');
    assert.equal(row.played, row.won + row.lost);
  });
});
