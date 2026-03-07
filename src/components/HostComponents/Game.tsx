import { useEffect, useMemo, useState } from "react";
import { ref, update } from "firebase/database";
import { db } from "@/firebase";
import { roomRefKey } from "@/models/keys";
import { type Room } from "@/models/room";
import { GAMESTAGES, type GameStage } from "@/models/game-stage";
import { TEAMS, type Team } from "@/models/team";
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

  const [lineups, setLineups] = useState<Record<Team, PlayerRecord[]>>({
    [TEAMS.BROTHERS]: [],
    [TEAMS.PHIKEIAS]: [],
  });

  const [turnTeam, setTurnTeam] = useState<Team>(TEAMS.PHIKEIAS);

  const [turnIndex, setTurnIndex] = useState<Record<Team, number>>({
    [TEAMS.BROTHERS]: 0,
    [TEAMS.PHIKEIAS]: 0,
  });

  const [strikes, setStrikes] = useState<number>(0);
  const [phase, setPhase] = useState<GamePhase>("normal");
  const [scoreboard, setScoreboard] = useState<Scoreboard>(createEmptyScoreboard());

  const levels = useMemo(
    () => Array.from({ length: room.factQuantity }, (_, i) => i + 1),
    [room.factQuantity]
  );

  const otherTeam = (team: Team): Team =>
    team === TEAMS.BROTHERS ? TEAMS.PHIKEIAS : TEAMS.BROTHERS;

  const factsLeftForTeam = (team: Team, sourceBuckets: Buckets = buckets): number => {
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

  const advancePlayerForTeam = (team: Team) => {
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
    gameStateCallback(GAMESTAGES.DONE);
    void endRoomAndForget(room.id);
  };

  const registerClick = () => {
    if (displayName) {
      setDisplayName(false);
      setCurrent(null);
    } else {
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

      const [allFacts, used, players] = await Promise.all([
        getAllFactsOnce(room.id),
        getUsedFacts(room.id),
        getPlayersOnce(room.id),
      ]);

      const remainingFacts = allFacts.filter((f) => !used.has(usedKey(f)));
      const byLevel = groupFactsByLevel(remainingFacts);

      if (!cancelled) {
        setBuckets(byLevel);
        setLineups(players);
        setTurnTeam(TEAMS.PHIKEIAS);
        setTurnIndex({
          [TEAMS.BROTHERS]: 0,
          [TEAMS.PHIKEIAS]: 0,
        });
        setStrikes(0);
        setPhase("normal");
        setScoreboard(createEmptyScoreboard());
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

  const endTurn = (didWin: boolean) => {
    if (!current) return;

    const activeTeam = turnTeam;
    const nextTeam = otherTeam(activeTeam);
    const nextStrikes = didWin ? strikes : strikes + 1;

    let nextBuckets = buckets;
    let activeTeamFactsLeft = factsLeftForTeam(activeTeam, nextBuckets);
    let nextTeamFactsLeft = factsLeftForTeam(nextTeam, nextBuckets);

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
      if (nextStrikes >= 3 || activeTeamOutOfFacts) {
        endGame();
        return;
      }

      setStrikes(nextStrikes);
      return;
    }

    if (nextStrikes >= 3 || activeTeamOutOfFacts) {
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

  return (
    <div>
      <div className="w-full flex justify-center mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm min-w-52 text-center">
            <h3 className="font-bold text-lg">{TEAMS.BROTHERS}</h3>
            <p className="text-xl mt-2">Runs: {scoreboard[TEAMS.BROTHERS].runs}</p>
            <p className="text-base text-slate-600">
              Bases: {scoreboard[TEAMS.BROTHERS].bases} / {room.factQuantity}
            </p>
          </div>

          <div className="bg-white rounded-xl px-6 py-4 shadow-sm min-w-52 text-center">
            <h3 className="font-bold text-lg">{TEAMS.PHIKEIAS}</h3>
            <p className="text-xl mt-2">Runs: {scoreboard[TEAMS.PHIKEIAS].runs}</p>
            <p className="text-base text-slate-600">
              Bases: {scoreboard[TEAMS.PHIKEIAS].bases} / {room.factQuantity}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center mb-6">
        <div className="bg-white rounded-xl px-6 py-4 shadow-sm text-center min-w-72">
          <p className="text-sm text-slate-500">Current team</p>
          <h3 className="text-2xl font-bold">{turnTeam}</h3>

          <p className="text-sm text-slate-500 mt-3">Current player</p>
          <p className="text-xl font-semibold">
            {currentPlayer ? currentPlayer.name : "No player"}
          </p>

          <p className="text-sm text-slate-500 mt-3">Strikes</p>
          <p className="text-lg font-semibold">{strikes} / 3</p>

          <p className="text-sm text-slate-500 mt-3">Facts left for this team</p>
          <p className="text-lg font-semibold">{factsLeftForTeam(turnTeam)}</p>

          {phase === "finalChance" && (
            <p className="mt-3 text-red-600 font-bold">Final chance</p>
          )}
        </div>
      </div>

      {current === null && phase !== "done" && (
        <div className="flex justify-center gap-8 flex-wrap">
          {levels.map((level) => {
            const leftOver = eligibleBuckets[level]?.length ?? 0;

            return (
              <div key={level} className="flex flex-col">
                <button
                  className="cursor-pointer disabled:cursor-not-allowed"
                  onClick={() => pickFromLevel(level)}
                  disabled={leftOver === 0}
                >
                  <div className="bg-white rounded-lg px-10 py-2 shadow-sm/20 hover:shadow-sm/50 transition-all duration-100 disabled:opacity-50">
                    Level {level} <br />({leftOver} left)
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {current && (
        <div className="w-full flex flex-col items-center">
          <button onClick={registerClick} className="cursor-pointer">
            <div className="bg-white rounded-2xl p-4 shadow-sm/20 min-h-80 w-100 mx-auto flex flex-col">
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

          <div className="flex gap-4 mt-6">
            <button
              onClick={awardWinToCurrentTeam}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Win
            </button>

            <button
              onClick={registerLossForCurrentTeam}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Lose
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
