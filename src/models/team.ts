export const TEAMS = {
  BROTHERS: "Brothers",
  PHIKEIAS: "Phikeias",
} as const;

export type Team = typeof TEAMS[keyof typeof TEAMS];
