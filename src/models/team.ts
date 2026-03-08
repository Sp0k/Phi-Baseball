export const TEAM_MODES = {
  PHI: "phi",
  OE: "oddsEvens",
} as const;

export type TeamMode = typeof TEAM_MODES[keyof typeof TEAM_MODES];

export const TEAM_KEYS = {
  A: "A",
  B: "B",
} as const;

export type TeamKey = typeof TEAM_KEYS[keyof typeof TEAM_KEYS];

export const TEAM_LABELS: Record<TeamMode, Record<TeamKey, string>> = {
  [TEAM_MODES.PHI]: {
    [TEAM_KEYS.A]: "Brothers",
    [TEAM_KEYS.B]: "Phikeias",
  },
  [TEAM_MODES.OE]: {
    [TEAM_KEYS.A]: "Odds",
    [TEAM_KEYS.B]: "Evens",
  },
};

export const DEFAULT_TEAM_MODE: TeamMode = TEAM_MODES.PHI;

export const isValidTeamMode = (value: unknown): value is TeamMode => {
  return value === TEAM_MODES.PHI || value === TEAM_MODES.OE;
};

export const getTeamLabel = (mode: unknown, team: TeamKey): string => {
  const safeMode = isValidTeamMode(mode) ? mode : DEFAULT_TEAM_MODE;
  return TEAM_LABELS[safeMode][team];
};
