export const MATCH_STAGES = ['GROUP', 'SEMIFINAL', 'FINAL'];

export const MATCH_STAGE = {
  GROUP: 'GROUP',
  SEMIFINAL: 'SEMIFINAL',
  FINAL: 'FINAL',
};

export const DEFAULT_MATCH_STAGE = MATCH_STAGE.GROUP;

/** Treat missing/null stage as GROUP for backward compatibility. */
export function isGroupStage(stage) {
  return !stage || stage === MATCH_STAGE.GROUP;
}

/** MongoDB filter: matches that count toward group standings. */
export function groupStageQueryFilter() {
  return {
    $or: [
      { stage: MATCH_STAGE.GROUP },
      { stage: { $exists: false } },
      { stage: null },
    ],
  };
}
