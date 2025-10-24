import { useEffect, useState } from "react";
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

interface GameProps {
  room: Room;
  gameStateCallback: (stage: GameStage) => void;
}

type Buckets = Record<number, HostFact[]>;

function Game({ room, gameStateCallback }: GameProps) {
  const [buckets, setBuckets] = useState<Buckets>({});
  const [current, setCurrent] = useState<HostFact | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Move to active
      await update(ref(db, `${roomRefKey}/${room.id}`), { state: GAMESTAGES.ACTIVE });

      const [allFacts, used] = await Promise.all([
        getAllFactsOnce(room.id),
        getUsedFacts(room.id),
      ]);

      const remaining = allFacts.filter(f => !used.has(usedKey(f)));
      const byLevel = groupFactsByLevel(remaining);     

      if (!cancelled) {
        setBuckets(byLevel);
        setCurrent(null);
        gameStateCallback(GAMESTAGES.ACTIVE);
      }
    })().catch(console.error);

    return () => { cancelled = true };
  }, [room.id, gameStateCallback]);

  const pickFromLevel = (level: number) => {
    setBuckets(prev => {
      const list = prev[level] ?? [];
      if (list.length === 0) return prev;

      const idx = Math.floor(Math.random() * list.length);
      const fact = list[idx];

      const nextList = list.slice();
      nextList.splice(idx, 1);
      setCurrent(fact);

      void markFactUsed(room.id, fact).catch(console.error);

      return {...prev, [level]: nextList}
    });
  };

  const levels = Array.from({ length: room.factQuantity }, (_, i) => i + 1);

  return (
    <div>
      <div>
        {levels.map(level => {
          const remaining = buckets[level]?.length ?? 0;
          return (
            <button key={level} onClick={() => pickFromLevel(level)} disabled={remaining === 0}>
              Level {level} <br/> ({remaining} left)
            </button>
          );
        })}
      </div>

      {current && (
        <div>
          <h3>Selected fact</h3>
          <p><strong>Level:</strong> {current.level}</p>
          <p><strong>Fact:</strong> {current.text}</p>
          <p><strong>By:</strong> {current.ownerName ?? current.ownerUid}</p>
        </div>
      )}
    </div>
  )
}

export default Game;
