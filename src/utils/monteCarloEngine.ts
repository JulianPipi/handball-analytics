export interface TeamTacticalParams {
  name: string;
  shortName: string;
  color: string;
  pacePossessions: number; // e.g. 52-58
  turnoverRatePct: number; // e.g. 14%
  shotEfficiencyPct: number; // e.g. 62%
  fastbreakSharePct: number; // e.g. 18% of shots
  fastbreakEfficiencyPct: number; // e.g. 80%
  sixMeterSharePct: number; // e.g. 45% of shots
  sixMeterEfficiencyPct: number; // e.g. 70%
  nineMeterSharePct: number; // e.g. 37% of shots
  nineMeterEfficiencyPct: number; // e.g. 48%
  goalkeeperSaveRatePct: number; // e.g. 32%
  twoMinuteRatePerGame: number; // e.g. 3.5
  is7v6Active: boolean;
}

export interface SimulationResult {
  iterations: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  homeWinPct: number;
  awayWinPct: number;
  drawPct: number;
  avgHomeScore: number;
  avgAwayScore: number;
  minHomeScore: number;
  maxHomeScore: number;
  minAwayScore: number;
  maxAwayScore: number;
  mostFrequentScore: { home: number; away: number; count: number };
  scoreDistribution: { scoreDiff: number; count: number }[]; // home - away
}

export function runMonteCarloSimulation(
  homeParams: TeamTacticalParams,
  awayParams: TeamTacticalParams,
  iterations: number = 2000
): SimulationResult {
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  let totalHomeGoals = 0;
  let totalAwayGoals = 0;

  let minHome = 999;
  let maxHome = 0;
  let minAway = 999;
  let maxAway = 0;

  const scoreMap: Record<string, number> = {};
  const diffMap: Record<number, number> = {};

  // Average game pace
  const avgPossessions = Math.round((homeParams.pacePossessions + awayParams.pacePossessions) / 2);

  for (let i = 0; i < iterations; i++) {
    let homeGoals = 0;
    let awayGoals = 0;

    // Simulate Home possessions
    for (let p = 0; p < avgPossessions; p++) {
      let turnoverChance = homeParams.turnoverRatePct;
      let shotEffBonus = 0;

      // 7v6 modifier: Increases shot quality by creating numerical advantage (+6%),
      // but if a turnover occurs, away team has a 65% chance of an open-net empty goal!
      if (homeParams.is7v6Active) {
        shotEffBonus += 6;
      }

      const rollTurnover = Math.random() * 100;
      if (rollTurnover < turnoverChance) {
        // Turnover occurred
        if (homeParams.is7v6Active && Math.random() * 100 < 55) {
          // Open net goal for away team!
          awayGoals += 1;
        }
        continue;
      }

      // Shot taken: Determine zone
      const zoneRoll = Math.random() * 100;
      let shotProb = homeParams.shotEfficiencyPct + shotEffBonus;

      if (zoneRoll < homeParams.fastbreakSharePct) {
        shotProb = homeParams.fastbreakEfficiencyPct;
      } else if (zoneRoll < homeParams.fastbreakSharePct + homeParams.sixMeterSharePct) {
        shotProb = homeParams.sixMeterEfficiencyPct + shotEffBonus;
      } else {
        shotProb = homeParams.nineMeterEfficiencyPct + shotEffBonus;
      }

      // Opponent goalkeeper defense check
      const gkDefenseFactor = (awayParams.goalkeeperSaveRatePct - 30) * 0.4;
      const finalGoalProb = Math.max(15, Math.min(95, shotProb - gkDefenseFactor));

      if (Math.random() * 100 < finalGoalProb) {
        homeGoals++;
      }
    }

    // Simulate Away possessions
    for (let p = 0; p < avgPossessions; p++) {
      let turnoverChance = awayParams.turnoverRatePct;
      let shotEffBonus = 0;

      if (awayParams.is7v6Active) {
        shotEffBonus += 6;
      }

      const rollTurnover = Math.random() * 100;
      if (rollTurnover < turnoverChance) {
        if (awayParams.is7v6Active && Math.random() * 100 < 55) {
          homeGoals += 1;
        }
        continue;
      }

      const zoneRoll = Math.random() * 100;
      let shotProb = awayParams.shotEfficiencyPct + shotEffBonus;

      if (zoneRoll < awayParams.fastbreakSharePct) {
        shotProb = awayParams.fastbreakEfficiencyPct;
      } else if (zoneRoll < awayParams.fastbreakSharePct + awayParams.sixMeterSharePct) {
        shotProb = awayParams.sixMeterEfficiencyPct + shotEffBonus;
      } else {
        shotProb = awayParams.nineMeterEfficiencyPct + shotEffBonus;
      }

      const gkDefenseFactor = (homeParams.goalkeeperSaveRatePct - 30) * 0.4;
      const finalGoalProb = Math.max(15, Math.min(95, shotProb - gkDefenseFactor));

      if (Math.random() * 100 < finalGoalProb) {
        awayGoals++;
      }
    }

    // Accumulate match results
    totalHomeGoals += homeGoals;
    totalAwayGoals += awayGoals;

    if (homeGoals < minHome) minHome = homeGoals;
    if (homeGoals > maxHome) maxHome = homeGoals;
    if (awayGoals < minAway) minAway = awayGoals;
    if (awayGoals > maxAway) maxAway = awayGoals;

    if (homeGoals > awayGoals) homeWins++;
    else if (awayGoals > homeGoals) awayWins++;
    else draws++;

    const key = `${homeGoals}-${awayGoals}`;
    scoreMap[key] = (scoreMap[key] || 0) + 1;

    const diff = homeGoals - awayGoals;
    diffMap[diff] = (diffMap[diff] || 0) + 1;
  }

  // Find most frequent score
  let mostFrequent = { home: 0, away: 0, count: 0 };
  for (const [key, count] of Object.entries(scoreMap)) {
    if (count > mostFrequent.count) {
      const [h, a] = key.split('-').map(Number);
      mostFrequent = { home: h, away: a, count };
    }
  }

  const scoreDistribution = Object.entries(diffMap)
    .map(([diff, count]) => ({ scoreDiff: Number(diff), count }))
    .sort((a, b) => a.scoreDiff - b.scoreDiff);

  return {
    iterations,
    homeWins,
    awayWins,
    draws,
    homeWinPct: Math.round((homeWins / iterations) * 1000) / 10,
    awayWinPct: Math.round((awayWins / iterations) * 1000) / 10,
    drawPct: Math.round((draws / iterations) * 1000) / 10,
    avgHomeScore: Math.round((totalHomeGoals / iterations) * 10) / 10,
    avgAwayScore: Math.round((totalAwayGoals / iterations) * 10) / 10,
    minHomeScore: minHome,
    maxHomeScore: maxHome,
    minAwayScore: minAway,
    maxAwayScore: maxAway,
    mostFrequentScore: mostFrequent,
    scoreDistribution,
  };
}
