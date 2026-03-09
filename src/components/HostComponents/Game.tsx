import { useEffect, useMemo, useState } from "react";
import { ref, update } from "firebase/database";
import { Link } from "react-router-dom";
import { db } from "@/firebase";
import { roomRefKey } from "@/models/keys";
import { type Room } from "@/models/room";
import { GAMESTAGES, type GameStage } from "@/models/game-stage";
import { TEAM_KEYS, type TeamKey, getTeamLabel } from "@/models/team";
import { type Scoreboard } from "@/models/score";
import { createEmptyScoreboard, applyBasesToTeam } from "@/services/score-service";
import {
  getAllFactsOnce,
  getPlayersOnce,
  groupFactsByLevel,
  getUsedFacts,
  usedKey,
  markFactUsed,
  type HostFact,
  type PlayerRecord,
} from "@/services/game-service";
import { endRoomAndForget } from "@/services/host-room-pointer-service";
import {
  createDefaultGameData,
  getGameData,
  setGameData,
  patchGameData,
} from "@/services/game-state-service";

interface GameProps {
  room: Room;
  gameStateCallback: (stage: GameStage) => void;
}

type Buckets = Record<number, HostFact[]>;
type GamePhase = "normal" | "finalChance" | "done";

function Game({ room, gameStateCallback }: GameProps) {
  const [buckets, setBuckets] = useState<Buckets>({});
  const [current, setCurrent] = useState<HostFact | null>(null);
  const [displayName, setDisplayName] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [lineups, setLineups] = useState<Record<TeamKey, PlayerRecord[]>>({
    [TEAM_KEYS.A]: [],
    [TEAM_KEYS.B]: [],
  });

  const [turnTeam, setTurnTeam] = useState<TeamKey>(room.startingTeam ?? TEAM_KEYS.B);

  const [turnIndex, setTurnIndex] = useState<Record<TeamKey, number>>({
    [TEAM_KEYS.A]: 0,
    [TEAM_KEYS.B]: 0,
  });

  const [strikes, setStrikes] = useState<number>(0);
  const [phase, setPhase] = useState<GamePhase>("normal");
  const [scoreboard, setScoreboard] = useState<Scoreboard>(createEmptyScoreboard());

  const levels = useMemo(
    () => Array.from({ length: room.factQuantity }, (_, i) => i + 1),
    [room.factQuantity]
  );

  const winnerSummary = useMemo(() => {
    const teamA = scoreboard[TEAM_KEYS.A];
    const teamB = scoreboard[TEAM_KEYS.B];

    if (teamA.runs > teamB.runs) {
      return { winner: TEAM_KEYS.A, isTie: false };
    }

    if (teamB.runs > teamA.runs) {
      return { winner: TEAM_KEYS.B, isTie: false };
    }

    if (teamA.bases > teamB.bases) {
      return { winner: TEAM_KEYS.A, isTie: false };
    }

    if (teamB.bases > teamA.bases) {
      return { winner: TEAM_KEYS.B, isTie: false };
    }

    return { winner: null, isTie: true };
  }, [scoreboard]);

  const otherTeam = (team: TeamKey): TeamKey =>
    team === TEAM_KEYS.A ? TEAM_KEYS.B : TEAM_KEYS.A;

  const factsLeftForTeam = (team: TeamKey, sourceBuckets: Buckets = buckets): number => {
    return levels.reduce((sum, level) => {
      const eligible = (sourceBuckets[level] ?? []).filter(
        (fact) => fact.ownerTeam !== team
      );
      return sum + eligible.length;
    }, 0);
  };

  const currentPlayer = useMemo(() => {
    const teamPlayers = lineups[turnTeam] ?? [];
    if (teamPlayers.length === 0) return null;

    const idx = turnIndex[turnTeam] % teamPlayers.length;
    return teamPlayers[idx];
  }, [lineups, turnIndex, turnTeam]);

  const eligibleBuckets = useMemo(() => {
    const filtered: Buckets = {};

    for (const level of levels) {
      filtered[level] = (buckets[level] ?? []).filter(
        (fact) => fact.ownerTeam !== turnTeam
      );
    }

    return filtered;
  }, [buckets, levels, turnTeam]);

  const totalLeft = useMemo(
    () => levels.reduce((sum, lvl) => sum + (buckets[lvl]?.length ?? 0), 0),
    [levels, buckets]
  );

  const advancePlayerForTeam = (team: TeamKey) => {
    setTurnIndex((prev) => {
      const teamPlayers = lineups[team] ?? [];
      if (teamPlayers.length === 0) return prev;

      return {
        ...prev,
        [team]: (prev[team] + 1) % teamPlayers.length,
      };
    });
  };

  const endGame = () => {
    setPhase("done");
    void patchGameData(room.id, { phase: "done" }).catch(console.error);
  };

  const registerClick = () => {
    if (!displayName) {
      setDisplayName(true);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoaded(false);

      await update(ref(db, `${roomRefKey}/${room.id}`), {
        state: GAMESTAGES.ACTIVE,
      });

      const [allFacts, used, players, savedGameData] = await Promise.all([
        getAllFactsOnce(room.id),
        getUsedFacts(room.id),
        getPlayersOnce(room.id),
        getGameData(room.id),
      ]);

      const remainingFacts = allFacts.filter((f) => !used.has(usedKey(f)));
      const byLevel = groupFactsByLevel(remainingFacts);

      const initialGameData = savedGameData ?? createDefaultGameData(room.startingTeam ?? TEAM_KEYS.B);

      if (!savedGameData) {
        await setGameData(room.id, initialGameData);
      }

      if (!cancelled) {
        setBuckets(byLevel);
        setLineups(players);
        setTurnTeam(initialGameData.turnTeam);
        setTurnIndex(initialGameData.turnIndex);
        setStrikes(initialGameData.strikes);
        setPhase(initialGameData.phase);
        setScoreboard(initialGameData.scoreboard);
        setCurrent(null);
        setDisplayName(false);
        setLoaded(true);
        gameStateCallback(GAMESTAGES.ACTIVE);
      }
    })().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [room.id, gameStateCallback]);

  useEffect(() => {
    if (!loaded) return;
    void patchGameData(room.id, { scoreboard }).catch(console.error);
  }, [scoreboard, loaded, room.id]);

  useEffect(() => {
    if (!loaded) return;
    void patchGameData(room.id, { strikes }).catch(console.error);
  }, [strikes, loaded, room.id]);

  useEffect(() => {
    if (!loaded) return;
    void patchGameData(room.id, { turnTeam }).catch(console.error);
  }, [turnTeam, loaded, room.id]);

  useEffect(() => {
    if (!loaded) return;
    void patchGameData(room.id, { turnIndex }).catch(console.error);
  }, [turnIndex, loaded, room.id]);

  useEffect(() => {
    if (!loaded) return;
    void patchGameData(room.id, { phase }).catch(console.error);
  }, [phase, loaded, room.id]);

  useEffect(() => {
    if (!loaded) return;
    if (phase === "done") return;

    if (totalLeft === 0 && current === null) {
      endGame();
    }
  }, [loaded, totalLeft, current, phase]);

  const pickFromLevel = (level: number) => {
    setBuckets((prev) => {
      const allAtLevel = prev[level] ?? [];
      const eligibleAtLevel = allAtLevel.filter(
        (fact) => fact.ownerTeam !== turnTeam
      );

      if (eligibleAtLevel.length === 0) return prev;

      const chosen =
        eligibleAtLevel[Math.floor(Math.random() * eligibleAtLevel.length)];

      const nextList = allAtLevel.filter((fact) => fact.id !== chosen.id);

      setCurrent(chosen);
      setDisplayName(false);
      void markFactUsed(room.id, chosen).catch(console.error);

      return {
        ...prev,
        [level]: nextList,
      };
    });
  };

  const clearBasesForTeam = (team: TeamKey) => {
    setScoreboard((prev) => ({
      ...prev,
      [team]: {
        ...prev[team],
        bases: 0,
      },
    }));
  };

  const endTurn = (didWin: boolean) => {
    if (!current) return;

    const activeTeam = turnTeam;
    const nextTeam = otherTeam(activeTeam);
    const nextStrikes = didWin ? strikes : strikes + 1;

    const activeTeamFactsLeft = factsLeftForTeam(activeTeam, buckets);
    const nextTeamFactsLeft = factsLeftForTeam(nextTeam, buckets);

    if (didWin) {
      setScoreboard((prev) =>
        applyBasesToTeam(prev, activeTeam, current.level, room.factQuantity)
      );
    }

    advancePlayerForTeam(activeTeam);
    setCurrent(null);
    setDisplayName(false);

    const activeTeamOutOfFacts = activeTeamFactsLeft === 0;
    const nextTeamHasFacts = nextTeamFactsLeft > 0;

    if (phase === "finalChance") {
      if (nextStrikes >= 3) {
        clearBasesForTeam(activeTeam);
        endGame();
        return;
      }

      if (activeTeamOutOfFacts) {
        endGame();
        return;
      }

      setStrikes(nextStrikes);
      return;
    }

    if (nextStrikes >= 3 || activeTeamOutOfFacts) {
      if (nextStrikes >= 3) {
        clearBasesForTeam(activeTeam);
      }

      if (nextTeamHasFacts) {
        setTurnTeam(nextTeam);
        setStrikes(0);

        if (activeTeamOutOfFacts) {
          setPhase("finalChance");
        }

        return;
      }

      endGame();
      return;
    }

    setStrikes(nextStrikes);
  };

  const awardWinToCurrentTeam = () => {
    endTurn(true);
  };

  const registerLossForCurrentTeam = () => {
    endTurn(false);
  };

  const teamLabel = (team: TeamKey) => getTeamLabel(room.teamMode, team);

  return (
    <div className="w-full h-[calc(100dvh-10rem)] px-4 py-4">
      <div className="mx-auto h-full w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left side */}
        <aside className="lg:col-span-4 h-full min-h-0 flex flex-col gap-4">
          <div className="bg-white rounded-xl px-6 py-5 shadow-sm">
            <h2 className="text-xl font-bold text-center mb-4">Scoreboard</h2>

            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-lg border border-slate-200 px-4 py-4 text-center">
                <h3 className="font-bold text-lg">{teamLabel(TEAM_KEYS.A)}</h3>
                <p className="text-xl mt-2">Runs: {scoreboard[TEAM_KEYS.A].runs}</p>
                <p className="text-base text-slate-600">
                  Bases: {scoreboard[TEAM_KEYS.A].bases} / {room.factQuantity}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 px-4 py-4 text-center">
                <h3 className="font-bold text-lg">{teamLabel(TEAM_KEYS.B)}</h3>
                <p className="text-xl mt-2">Runs: {scoreboard[TEAM_KEYS.B].runs}</p>
                <p className="text-base text-slate-600">
                  Bases: {scoreboard[TEAM_KEYS.B].bases} / {room.factQuantity}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl px-6 py-5 shadow-sm flex-1 min-h-0 overflow-y-auto">
            <h2 className="text-xl font-bold text-center mb-4">Game Info</h2>

            <div className="space-y-4 text-center">
              <div>
                <p className="text-sm text-slate-500">Current team</p>
                <h3 className="text-2xl font-bold">{teamLabel(turnTeam)}</h3>
              </div>

              <div>
                <p className="text-sm text-slate-500">Current player</p>
                <p className="text-xl font-semibold">
                  {currentPlayer ? currentPlayer.name : "No player"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Strikes</p>
                <p className="text-lg font-semibold">{strikes} / 3</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Facts left for this team</p>
                <p className="text-lg font-semibold">{factsLeftForTeam(turnTeam)}</p>
              </div>

              {phase === "finalChance" && (
                <p className="text-red-600 font-bold">Final chance</p>
              )}
            </div>
          </div>
        </aside>

        {/* Right side */}
        <section className="lg:col-span-8 h-full min-h-0 bg-white rounded-xl shadow-sm p-6 overflow-y-auto">
          {current === null && phase !== "done" && (
            <>
              <h2 className="text-2xl mx-auto font-bold text-center mb-8">Select a Fact</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {levels.map((level) => {
                  const leftOver = eligibleBuckets[level]?.length ?? 0;

                  return (
                    <button
                      key={level}
                      className="cursor-pointer disabled:cursor-not-allowed"
                      onClick={() => pickFromLevel(level)}
                      disabled={leftOver === 0}
                    >
                      <div className="bg-slate-100 rounded-lg px-6 py-6 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-100 disabled:opacity-50 text-center w-full">
                        <span className="text-lg font-semibold">Level {level}</span>
                        <br />
                        <span className="text-sm text-slate-600">({leftOver} left)</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {current && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <button
                onClick={registerClick}
                className="cursor-pointer w-full flex justify-center"
              >
                <div className="bg-slate-50 rounded-2xl p-6 shadow-sm min-h-80 w-full max-w-3xl mx-auto flex flex-col">
                  <p className="text-black text-3xl flex-1 flex items-center justify-center text-center px-2">
                    {current.text}
                  </p>

                  {displayName && (
                    <p className="font-semibold text-2xl text-phidelt-red text-center mt-auto">
                      {current.ownerName ?? current.ownerUid}
                    </p>
                  )}
                </div>
              </button>

              {displayName && 
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={awardWinToCurrentTeam}
                    className="bg-green-600 cursor-pointer text-white px-5 py-2.5 rounded-lg"
                  >
                    Win
                  </button>

                  <button
                    onClick={registerLossForCurrentTeam}
                    className="bg-red-600 cursor-pointer text-white px-5 py-2.5 rounded-lg"
                  >
                    Lose
                  </button>
                </div>
              }
            </div>
          )}

          {phase === "done" && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <h2 className="text-4xl font-bold mb-4">Game Over</h2>

              {winnerSummary.isTie ? (
                <p className="text-2xl font-semibold mb-6">It's a tie!</p>
              ) : (
                  <p className="text-2xl font-semibold mb-6">
                    Winning team: {winnerSummary.winner ? teamLabel(winnerSummary.winner) : ""}
                  </p>
                )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                <div className="bg-slate-100 rounded-xl px-6 py-5 shadow-sm">
                  <h3 className="text-xl font-bold mb-2">{teamLabel(TEAM_KEYS.A)}</h3>
                  <p className="text-lg">Runs: {scoreboard[TEAM_KEYS.A].runs}</p>
                  <p className="text-base text-slate-600">
                    Bases: {scoreboard[TEAM_KEYS.A].bases} / {room.factQuantity}
                  </p>
                </div>

                <div className="bg-slate-100 rounded-xl px-6 py-5 shadow-sm">
                  <h3 className="text-xl font-bold mb-2">{teamLabel(TEAM_KEYS.B)}</h3>
                  <p className="text-lg">Runs: {scoreboard[TEAM_KEYS.B].runs}</p>
                  <p className="text-base text-slate-600">
                    Bases: {scoreboard[TEAM_KEYS.B].bases} / {room.factQuantity}
                  </p>
                </div>
              </div>

              <Link to="/play">
                <button
                  onClick={async () => {
                    await endRoomAndForget(room.id);
                    gameStateCallback(GAMESTAGES.DONE);
                  }}
                  className="mt-6 cursor-pointer bg-phidelt-navy text-white px-5 py-2.5 rounded-lg"
                >
                  Close Game
                </button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Game;
