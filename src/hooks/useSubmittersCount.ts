import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/firebase";
import { roomRefKey, factsKey } from "@/models/keys";

export function useSubmittersCount(roomCode: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!roomCode) return;

    const byUidRef = ref(db, `${roomRefKey}/${roomCode}/${factsKey}`);
    return onValue(byUidRef, (snap) => {
      const byUid = snap.val() as Record<
        string,
        Record<string, Record<string, { text: string}>>
      > | null;
      if (!byUid) {
        setCount(0);
        return;
      }

      let n = 0;
      for (const uid in byUid) {
        const levels = byUid[uid];
        const hasAny = 
          levels &&
          Object.values(levels).some((factsAtLevel: any) =>
            factsAtLevel && Object.keys(factsAtLevel).length > 0
            );
        if (hasAny) n++;
      }
      setCount(n);
    });
  }, [roomCode]);

  return count;
}
