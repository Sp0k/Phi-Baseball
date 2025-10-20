export const GAMESTAGES = {
  PREGAME: "pregame",
  LOBBY: "lobby",
  ACTIVE: "active",
  ENDED: "ended",
} as const;

export type GameStage = typeof GAMESTAGES[keyof typeof GAMESTAGES];
