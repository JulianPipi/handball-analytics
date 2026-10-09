import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Player, Team, Match, MatchEvent, ActiveExclusion } from '../types/handball';
import { INITIAL_HOME_TEAM, INITIAL_PLAYERS, INITIAL_MATCH } from '../data/mockData';

interface HandballContextType {
  team: Team;
  players: Player[];
  match: Match;
  activeTab: 'roster' | 'live' | 'stats' | 'simulator';
  setActiveTab: (tab: 'roster' | 'live' | 'stats' | 'simulator') => void;
  // Team & Player actions
  addPlayer: (playerData: Omit<Player, 'id' | 'stats'>) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  updateTeam: (teamData: Partial<Team>) => void;
  // Match actions
  startMatchTimer: () => void;
  pauseMatchTimer: () => void;
  setMatchTime: (seconds: number) => void;
  setMatchPeriod: (period: 1 | 2) => void;
  updateScores: (homeScore: number, awayScore: number) => void;
  recordEvent: (event: Omit<MatchEvent, 'id' | 'timestamp' | 'scoreHomeAfter' | 'scoreAwayAfter'>) => void;
  undoLastEvent: () => void;
  addExclusion: (playerId: string, teamId: string, durationSeconds?: number) => void;
  removeExclusion: (exclusionId: string) => void;
  resetMatch: () => void;
  resetAllToDefault: () => void;
  exportBackup: () => void;
  importBackup: (jsonData: string) => boolean;
  importPlayersBulk: (newPlayers: Player[], replace: boolean) => void;
  substitutePlayer: (outPlayerId: string, inPlayerId: string) => void;
  setOnCourtPlayers: (playerIds: string[]) => void;
  updatePlayerNotes: (playerId: string, notes: string) => void;
}

const STORAGE_KEY_PLAYERS = 'hb_players_v1';
const STORAGE_KEY_TEAM = 'hb_team_v1';
const STORAGE_KEY_MATCH = 'hb_match_v1';

const HandballContext = createContext<HandballContextType | undefined>(undefined);

export const HandballProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'live' | 'stats' | 'simulator'>('roster');

  // Load from LocalStorage or default
  const [team, setTeam] = useState<Team>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TEAM);
    return saved ? JSON.parse(saved) : INITIAL_HOME_TEAM;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (!saved) return INITIAL_PLAYERS;
    try {
      const parsed: Player[] = JSON.parse(saved);
      return parsed.map((p) => ({
        ...p,
        stats: {
          ...p.stats,
          timeOnCourtSeconds: p.stats.timeOnCourtSeconds ?? 0,
        },
      }));
    } catch {
      return INITIAL_PLAYERS;
    }
  });

  const [match, setMatch] = useState<Match>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MATCH);
    if (!saved) return INITIAL_MATCH;
    try {
      const parsed: Match = JSON.parse(saved);
      if (!parsed.onCourtPlayerIds || parsed.onCourtPlayerIds.length === 0) {
        parsed.onCourtPlayerIds = INITIAL_MATCH.onCourtPlayerIds || ['p-1', 'p-7', 'p-24', 'p-33', 'p-10', 'p-9', 'p-18'];
      }
      return parsed;
    } catch {
      return INITIAL_MATCH;
    }
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MATCH, JSON.stringify(match));
  }, [match]);

  // Match live clock effect & on-court playing time accumulator
  useEffect(() => {
    let interval: any = null;
    if (match.isRunning && !match.isFinished) {
      interval = setInterval(() => {
        setMatch((prev) => {
          const maxSeconds = prev.periodDurationMinutes * 60;
          const nextSeconds = prev.matchTimeSeconds + 1;

          // Check expired exclusions
          const updatedExclusions = prev.activeExclusions.filter((exc) => {
            return nextSeconds < exc.startMatchTimeSeconds + exc.durationSeconds;
          });

          // Accumulate playing time for players currently on court
          const currentCourtIds = prev.onCourtPlayerIds || [];
          if (currentCourtIds.length > 0) {
            setPlayers((currentPlayers) => {
              const courtSet = new Set(currentCourtIds);
              return currentPlayers.map((p) => {
                if (courtSet.has(p.id)) {
                  return {
                    ...p,
                    stats: {
                      ...p.stats,
                      timeOnCourtSeconds: (p.stats.timeOnCourtSeconds || 0) + 1,
                    },
                  };
                }
                return p;
              });
            });
          }

          if (nextSeconds >= maxSeconds) {
            return {
              ...prev,
              matchTimeSeconds: maxSeconds,
              isRunning: false,
              activeExclusions: updatedExclusions,
            };
          }

          return {
            ...prev,
            matchTimeSeconds: nextSeconds,
            activeExclusions: updatedExclusions,
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [match.isRunning, match.isFinished]);

  // Player operations
  const addPlayer = (playerData: Omit<Player, 'id' | 'stats'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: `p-${Date.now()}`,
      stats: {
        goals: 0,
        shots: 0,
        assists: 0,
        turnovers: 0,
        steals: 0,
        saves: 0,
        shotsFaced: 0,
        twoMinutes: 0,
        yellowCards: 0,
        redCards: 0,
        plusMinus: 0,
        timeOnCourtSeconds: 0,
      },
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
  };

  const deletePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const importPlayersBulk = (newPlayers: Player[], replace: boolean) => {
    if (replace) {
      setPlayers(newPlayers);
    } else {
      setPlayers((prev) => {
        const updated = [...prev];
        newPlayers.forEach((np) => {
          const existingIdx = updated.findIndex((p) => p.number === np.number);
          if (existingIdx >= 0) {
            updated[existingIdx] = { ...np, id: updated[existingIdx].id };
          } else {
            updated.push(np);
          }
        });
        return updated;
      });
    }
  };

  const updateTeam = (teamData: Partial<Team>) => {
    setTeam((prev) => ({ ...prev, ...teamData }));
  };

  const updatePlayerNotes = (playerId: string, notes: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, notes } : p))
    );
  };

  const setOnCourtPlayers = (playerIds: string[]) => {
    setMatch((prev) => ({
      ...prev,
      onCourtPlayerIds: playerIds,
    }));
  };

  const substitutePlayer = (outPlayerId: string, inPlayerId: string) => {
    const outPlayer = players.find((p) => p.id === outPlayerId);
    const inPlayer = players.find((p) => p.id === inPlayerId);
    if (!outPlayer || !inPlayer) return;

    setMatch((prev) => {
      const currentOnCourt = [...(prev.onCourtPlayerIds || [])];
      const idx = currentOnCourt.indexOf(outPlayerId);
      if (idx !== -1) {
        currentOnCourt[idx] = inPlayerId;
      } else if (currentOnCourt.length < 7) {
        currentOnCourt.push(inPlayerId);
      }

      const subEvent: MatchEvent = {
        id: `sub-${Date.now()}`,
        matchId: prev.id,
        timestamp: Date.now(),
        period: prev.currentPeriod,
        matchTimeSeconds: prev.matchTimeSeconds,
        teamId: team.id,
        playerId: outPlayerId,
        substitutePlayerId: inPlayerId,
        type: 'substitution',
        scoreHomeAfter: prev.homeScore,
        scoreAwayAfter: prev.awayScore,
        description: `🔄 Cambio: Entra #${inPlayer.number} ${inPlayer.name} por #${outPlayer.number} ${outPlayer.name}`,
      };

      return {
        ...prev,
        onCourtPlayerIds: currentOnCourt,
        events: [subEvent, ...prev.events],
      };
    });
  };

  // Match Timer
  const startMatchTimer = () => {
    setMatch((prev) => ({ ...prev, isRunning: true }));
  };

  const pauseMatchTimer = () => {
    setMatch((prev) => ({ ...prev, isRunning: false }));
  };

  const setMatchTime = (seconds: number) => {
    setMatch((prev) => ({ ...prev, matchTimeSeconds: Math.max(0, seconds) }));
  };

  const setMatchPeriod = (period: 1 | 2) => {
    setMatch((prev) => ({ ...prev, currentPeriod: period }));
  };

  const updateScores = (homeScore: number, awayScore: number) => {
    setMatch((prev) => ({
      ...prev,
      homeScore: Math.max(0, homeScore),
      awayScore: Math.max(0, awayScore),
    }));
  };

  // Event recording
  const recordEvent = (
    eventData: Omit<MatchEvent, 'id' | 'timestamp' | 'scoreHomeAfter' | 'scoreAwayAfter'>
  ) => {
    setMatch((prevMatch) => {
      let nextHomeScore = prevMatch.homeScore;
      let nextAwayScore = prevMatch.awayScore;

      // Handle goal scoring
      if (eventData.type === 'shot' && eventData.shotOutcome === 'goal') {
        if (eventData.teamId === prevMatch.homeTeam.id) {
          nextHomeScore += 1;
        } else {
          nextAwayScore += 1;
        }
      }

      const fullEvent: MatchEvent = {
        ...eventData,
        id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: Date.now(),
        scoreHomeAfter: nextHomeScore,
        scoreAwayAfter: nextAwayScore,
      };

      // Also update player personal stats if player is identified
      if (eventData.playerId) {
        setPlayers((prevPlayers) =>
          prevPlayers.map((p) => {
            if (p.id !== eventData.playerId) return p;
            const s = { ...p.stats };
            if (eventData.type === 'shot') {
              s.shots += 1;
              if (eventData.shotOutcome === 'goal') s.goals += 1;
            } else if (eventData.type === 'turnover') {
              s.turnovers += 1;
            } else if (eventData.type === 'steal') {
              s.steals += 1;
            } else if (eventData.type === 'discipline') {
              if (eventData.disciplineType === 'two_minute') s.twoMinutes += 1;
              if (eventData.disciplineType === 'yellow_card') s.yellowCards += 1;
              if (eventData.disciplineType === 'red_card') s.redCards += 1;
            }
            return { ...p, stats: s };
          })
        );
      }

      // If goalkeeper was involved in save
      if (eventData.goalkeeperId && eventData.type === 'shot') {
        setPlayers((prevPlayers) =>
          prevPlayers.map((p) => {
            if (p.id !== eventData.goalkeeperId) return p;
            const s = { ...p.stats };
            s.shotsFaced += 1;
            if (eventData.shotOutcome === 'save') s.saves += 1;
            return { ...p, stats: s };
          })
        );
      }

      // If assisted
      if (eventData.assistedByPlayerId) {
        setPlayers((prevPlayers) =>
          prevPlayers.map((p) => {
            if (p.id !== eventData.assistedByPlayerId) return p;
            return { ...p, stats: { ...p.stats, assists: p.stats.assists + 1 } };
          })
        );
      }

      // If 2 minute suspension, also register active exclusion
      let nextExclusions = [...prevMatch.activeExclusions];
      if (eventData.type === 'discipline' && eventData.disciplineType === 'two_minute' && eventData.playerId) {
        const playerObj = players.find((p) => p.id === eventData.playerId);
        nextExclusions.push({
          id: `exc-${Date.now()}`,
          teamId: eventData.teamId,
          playerId: eventData.playerId,
          playerName: playerObj?.name || 'Jugador',
          playerNumber: playerObj?.number || 0,
          startMatchTimeSeconds: prevMatch.matchTimeSeconds,
          durationSeconds: 120, // 2 minutes
        });
      }

      return {
        ...prevMatch,
        homeScore: nextHomeScore,
        awayScore: nextAwayScore,
        events: [fullEvent, ...prevMatch.events],
        activeExclusions: nextExclusions,
      };
    });
  };

  const undoLastEvent = () => {
    setMatch((prevMatch) => {
      if (prevMatch.events.length === 0) return prevMatch;
      const [lastEvent, ...remainingEvents] = prevMatch.events;

      let nextHomeScore = prevMatch.homeScore;
      let nextAwayScore = prevMatch.awayScore;

      if (lastEvent.type === 'shot' && lastEvent.shotOutcome === 'goal') {
        if (lastEvent.teamId === prevMatch.homeTeam.id) {
          nextHomeScore = Math.max(0, nextHomeScore - 1);
        } else {
          nextAwayScore = Math.max(0, nextAwayScore - 1);
        }
      }

      // Revert player stat
      if (lastEvent.playerId) {
        setPlayers((prevPlayers) =>
          prevPlayers.map((p) => {
            if (p.id !== lastEvent.playerId) return p;
            const s = { ...p.stats };
            if (lastEvent.type === 'shot') {
              s.shots = Math.max(0, s.shots - 1);
              if (lastEvent.shotOutcome === 'goal') s.goals = Math.max(0, s.goals - 1);
            } else if (lastEvent.type === 'turnover') {
              s.turnovers = Math.max(0, s.turnovers - 1);
            } else if (lastEvent.type === 'steal') {
              s.steals = Math.max(0, s.steals - 1);
            }
            return { ...p, stats: s };
          })
        );
      }

      return {
        ...prevMatch,
        homeScore: nextHomeScore,
        awayScore: nextAwayScore,
        events: remainingEvents,
      };
    });
  };

  const addExclusion = (playerId: string, teamId: string, durationSeconds = 120) => {
    const playerObj = players.find((p) => p.id === playerId);
    const newExclusion: ActiveExclusion = {
      id: `exc-${Date.now()}`,
      teamId,
      playerId,
      playerName: playerObj?.name || 'Jugador',
      playerNumber: playerObj?.number || 0,
      startMatchTimeSeconds: match.matchTimeSeconds,
      durationSeconds,
    };
    setMatch((prev) => ({
      ...prev,
      activeExclusions: [...prev.activeExclusions, newExclusion],
    }));
  };

  const removeExclusion = (exclusionId: string) => {
    setMatch((prev) => ({
      ...prev,
      activeExclusions: prev.activeExclusions.filter((e) => e.id !== exclusionId),
    }));
  };

  const resetMatch = () => {
    setMatch({
      ...INITIAL_MATCH,
      id: `match-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      homeTeam: team,
    });
  };

  const resetAllToDefault = () => {
    setTeam(INITIAL_HOME_TEAM);
    setPlayers(INITIAL_PLAYERS);
    setMatch(INITIAL_MATCH);
    localStorage.removeItem(STORAGE_KEY_TEAM);
    localStorage.removeItem(STORAGE_KEY_PLAYERS);
    localStorage.removeItem(STORAGE_KEY_MATCH);
  };

  const exportBackup = () => {
    const data = {
      team,
      players,
      match,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handball-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.team && parsed.players) {
        setTeam(parsed.team);
        setPlayers(parsed.players);
        if (parsed.match) setMatch(parsed.match);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing JSON data:', e);
      return false;
    }
  };

  return (
    <HandballContext.Provider
      value={{
        team,
        players,
        match,
        activeTab,
        setActiveTab,
        addPlayer,
        updatePlayer,
        deletePlayer,
        updateTeam,
        startMatchTimer,
        pauseMatchTimer,
        setMatchTime,
        setMatchPeriod,
        updateScores,
        recordEvent,
        undoLastEvent,
        addExclusion,
        removeExclusion,
        resetMatch,
        resetAllToDefault,
        exportBackup,
        importBackup,
        importPlayersBulk,
        substitutePlayer,
        setOnCourtPlayers,
        updatePlayerNotes,
      }}
    >
      {children}
    </HandballContext.Provider>
  );
};

export const useHandball = () => {
  const context = useContext(HandballContext);
  if (!context) {
    throw new Error('useHandball must be used within a HandballProvider');
  }
  return context;
};
