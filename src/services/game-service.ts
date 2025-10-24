import { db } from "@/firebase";
import { ref, child, get, set } from "firebase/database";
import { roomRefKey, factsKey, playersKey } from "@/models/keys";

export type HostFact = {
  id: string;
  text: string;
  level: number;
  ownerUid: string;
  ownerName?: string;
};

function flattenFacts(
  byUid: Record<string, any> | null,
  players: Record<string, { name?: any }> | null
): HostFact[] {
  if (!byUid) return [];
  
  const out: HostFact[] = [];
  for (const [uid, levels] of Object.entries(byUid)) {
    for (const [levelStr, facts] of Object.entries(levels ?? {})) {
      const level = Number(levelStr);
      for (const [factId, obj] of Object.entries(facts ?? {})) {
        const text = String(obj?.text ?? "");
        out.push({ id: factId, text, level, ownerUid: uid, ownerName: players?.[uid]?.name });
      }
    }
  }
  return out;
}

export async function getAllFactsOnce(roomCode: string): Promise<HostFact[]> {
  const base = ref(db, `${roomRefKey}/${roomCode}`);
  const [playersSnap, factsSnap] = await Promise.all([
    get(child(base, playersKey)),
    get(child(base, factsKey)),
  ]);

  const players = playersSnap.exists() ? (playersSnap.val() as Record<string, any>) : null;
  const byUid = factsSnap.exists() ? (factsSnap.val() as Record<string, any>) : null;

  return flattenFacts(byUid, players);
}

export function groupFactsByLevel(list: HostFact[]): Record<number, HostFact[]> {
  return list.reduce<Record<number, HostFact[]>>((acc, f) => {
    (acc[f.level] ||= []).push(f);
    return acc;
  }, {});
}

export const usedKey = (f: HostFact) => `${f.ownerUid}_${f.level}_${f.id}`;

export async function getUsedFacts(roomCode: string): Promise<Set<string>> {
  const snap = await get(child(ref(db, `${roomRefKey}/${roomCode}`), "usedFacts"));
  const used = new Set<string>();
  if (!snap.exists()) return used;

  const byUid = snap.val() as Record<string, Record<string, Record<string, true>>>;
  for (const [uid, byLevel] of Object.entries(byUid ?? {})) {
    for (const [levelStr, byFact] of Object.entries(byLevel ?? {})) {
      for (const factId of Object.keys(byFact ?? {})) {
        used.add(`${uid}_${levelStr}_${factId}`);
      }
    }
  }
  return used;
}

export async function markFactUsed(roomCode: string, f: HostFact): Promise<void> {
  await set(ref(db, `rooms/${roomCode}/usedFacts/${f.ownerUid}/${f.level}/${f.id}`), true);
}
