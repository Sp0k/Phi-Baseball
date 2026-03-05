import { useEffect, useState } from "react";
import { useMemo } from "react";
import { ref, update } from "firebase/database";
import { db } from "@/firebase";
import { roomRefKey } from "@/models/keys";
import { type Room } from "@/models/room";
import { GAMESTAGES, type GameStage } from "@/models/game-stage";
import { 
  getAllFactsOnce, 
  groupFactsByLevel, 
  getUsedFacts,
  usedKey,
  markFactUsed,
  type HostFact
} from "@/services/game-service";
import { endRoomAndForget } from "@/services/host-room-pointer-service";

interface GameProps {
  room: Room;
  gameStateCallback: (stage: GameStage) => void;
}

type Buckets = Record<number, HostFact[]>;

function Game({ room, gameStateCallback }: GameProps) {
  const [buckets, setBuckets] = useState<Buckets>({});
  const [current, setCurrent] = useState<HostFact | null>(null);
  const [displayName, setDisplayName] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const levels = useMemo(
    () => Array.from({ length: room.factQuantity }, (_, i) => i + 1),
    [room.factQuantity]
  );

  const totalLeft = useMemo(
    () => levels.reduce((sum, lvl) => sum + (buckets[lvl]?.length ?? 0), 0),
    [levels, buckets]
  );

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

      await update(ref(db, `${roomRefKey}/${room.id}`), { state: GAMESTAGES.ACTIVE });

      const [allFacts, used] = await Promise.all([
        getAllFactsOnce(room.id),
        getUsedFacts(room.id),
      ]);

      const remainingFacts = allFacts.filter((f) => !used.has(usedKey(f)));
      const byLevel = groupFactsByLevel(remainingFacts);

      if (!cancelled) {
        setBuckets(byLevel);
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

    // End only when there are no facts left AND the last card is closed
    if (totalLeft === 0 && current === null) {
      gameStateCallback(GAMESTAGES.DONE);
      void endRoomAndForget(room.id);
    }
  }, [loaded, totalLeft, current, room.id, gameStateCallback]);

  const pickFromLevel = (level: number) => {
    setBuckets((prev) => {
      const list = prev[level] ?? [];
      if (list.length === 0) return prev;

      const idx = Math.floor(Math.random() * list.length);
      const fact = list[idx];

      const nextList = list.slice();
      nextList.splice(idx, 1);

      setCurrent(fact);
      setDisplayName(false);
      void markFactUsed(room.id, fact).catch(console.error);

      return { ...prev, [level]: nextList };
    });
  };

  return (
    <div>
      {current === null && (
        <div className="flex justify-center gap-8">
          {levels.map((level) => {
            const leftOver = buckets[level]?.length ?? 0;
            return (
              <div key={level} className="flex flex-col">
                <button
                  className="cursor-pointer"
                  onClick={() => pickFromLevel(level)}
                  disabled={leftOver === 0}
                >
                  <div className="bg-white rounded-lg px-10 py-2 shadow-sm/20 hover:shadow-sm/50 transition-all duration-100">
                    Level {level} <br />({leftOver} left)
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {current && (
        <div className="w-full flex justify-center">
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
        </div>
      )}
    </div>
  );
}

export default Game;
