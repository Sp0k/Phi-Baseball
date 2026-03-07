import { db } from "@/firebase";
import { ref, child, get, set } from "firebase/database";
import { roomRefKey, factsKey, playersKey } from "@/models/keys";
import { type Team, TEAMS } from "@/models/team";

export type HostFact = {
  id: string;
  text: string;
  level: number;
  ownerUid: string;
  ownerName?: string;
  ownerTeam?: Team;
};

export type PlayerRecord = {
  uid: string;
  name: string;
  team: Team;
  joinedAt?: number;
};

function flattenFacts(
  byUid: Record<string, any> | null,
  players: Record<string, PlayerRecord> | null
): HostFact[] {
  if (!byUid) return [];

  const out: HostFact[] = [];

  for (const [uid, levels] of Object.entries(byUid)) {
    for (const [levelStr, facts] of Object.entries(levels ?? {})) {
      const level = Number(levelStr);

      for (const [factId, obj] of Object.entries(facts ?? {})) {
        const text = String((obj as { text?: unknown })?.text ?? "");

        out.push({
          id: factId,
          text,
          level,
          ownerUid: uid,
          ownerName: players?.[uid]?.name,
          ownerTeam: players?.[uid]?.team,
        });
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

  const players = playersSnap.exists()
    ? (playersSnap.val() as Record<string, PlayerRecord>)
    : null;

  const byUid = factsSnap.exists()
    ? (factsSnap.val() as Record<string, any>)
    : null;

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
  await set(ref(db, `${roomRefKey}/${roomCode}/usedFacts/${f.ownerUid}/${f.level}/${f.id}`), true);
}

export async function getPlayersOnce(roomCode: string): Promise<Record<Team, PlayerRecord[]>> {
  const snap = await get(child(ref(db, `${roomRefKey}/${roomCode}`), playersKey));

  const grouped: Record<Team, PlayerRecord[]> = {
    [TEAMS.BROTHERS]: [],
    [TEAMS.PHIKEIAS]: [],
  };

  if (!snap.exists()) return grouped;

  const raw = snap.val() as Record<string, { name?: string; team?: Team; joinedAt?: number }>;

  for (const [uid, p] of Object.entries(raw)) {
    if (!p.team || !p.name) continue;

    grouped[p.team].push({
      uid,
      name: p.name,
      team: p.team,
      joinedAt: p.joinedAt,
    });
  }

  for (const team of [TEAMS.BROTHERS, TEAMS.PHIKEIAS] as const) {
    grouped[team].sort((a, b) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0));
  }

  return grouped;
}
