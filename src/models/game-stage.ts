export const GAMESTAGES = {
  PREGAME: "pregame",
  LOBBY: "lobby",
  ACTIVE: "active",
  DONE: "done",
} as const;

export type GameStage = typeof GAMESTAGES[keyof typeof GAMESTAGES];
