export const GAME = {
  MAX_ENGAGEMENT: 100,
  ENGAGEMENT_PER_SWIPE: 4,
  BASE_SWIPE_INTERVAL_MS: 4500,
  MIN_SWIPE_INTERVAL_MS: 1800,
  SWIPE_DURATION_MS: 900,
  MAX_BOREDOM: 100,
  BOREDOM_PER_TOOL: 9,
  BOREDOM_PER_INTERRUPT: 14,
} as const;

export type ToolId = "notif" | "call" | "message";

export type Tool = {
  id: ToolId;
  label: string;
  cooldownMs: number;
  engagementDelta: number;
  interruptChance: number;
  unlockAfter: { tool: ToolId; uses: number } | null;
};

export const TOOLS: Record<ToolId, Tool> = {
  notif: {
    id: "notif",
    label: "Notif Tom",
    cooldownMs: 8000,
    engagementDelta: -8,
    interruptChance: 0.4,
    unlockAfter: null,
  },
  call: {
    id: "call",
    label: "Appel Maman",
    cooldownMs: 18000,
    engagementDelta: -22,
    interruptChance: 0.85,
    unlockAfter: { tool: "notif", uses: 5 },
  },
  message: {
    id: "message",
    label: "Camille ❤️",
    cooldownMs: 12000,
    engagementDelta: -14,
    interruptChance: 0.6,
    unlockAfter: { tool: "notif", uses: 10 },
  },
};

export type ToolState = { cooldownUntil: number; uses: number };

export type GameState = {
  engagement: number;
  boredom: number;
  tools: Record<ToolId, ToolState>;
  totalToolUses: number;
  gameOver: boolean;
  victory: boolean;
  swipeCount: number;
};

export const initialGameState: GameState = {
  engagement: 0,
  boredom: 0,
  tools: {
    notif: { cooldownUntil: 0, uses: 0 },
    call: { cooldownUntil: 0, uses: 0 },
    message: { cooldownUntil: 0, uses: 0 },
  },
  totalToolUses: 0,
  gameOver: false,
  victory: false,
  swipeCount: 0,
};

export type GameAction =
  | { type: "npc_swipe" }
  | { type: "use_tool"; tool: ToolId; now: number; interrupted: boolean }
  | { type: "reset" };

export function gameReducer(state: GameState, action: GameAction): GameState {
  if ((state.gameOver || state.victory) && action.type !== "reset") return state;

  switch (action.type) {
    case "npc_swipe": {
      const engagement = Math.min(
        GAME.MAX_ENGAGEMENT,
        state.engagement + GAME.ENGAGEMENT_PER_SWIPE,
      );
      return {
        ...state,
        engagement,
        swipeCount: state.swipeCount + 1,
        gameOver: engagement >= GAME.MAX_ENGAGEMENT,
      };
    }
    case "use_tool": {
      const tool = TOOLS[action.tool];
      const st = state.tools[action.tool];
      if (action.now < st.cooldownUntil) return state;
      if (!isUnlocked(action.tool, state)) return state;
      const boredomGain =
        GAME.BOREDOM_PER_TOOL + (action.interrupted ? GAME.BOREDOM_PER_INTERRUPT : 0);
      const boredom = Math.min(GAME.MAX_BOREDOM, state.boredom + boredomGain);
      return {
        ...state,
        engagement: Math.max(0, state.engagement + tool.engagementDelta),
        boredom,
        victory: boredom >= GAME.MAX_BOREDOM,
        tools: {
          ...state.tools,
          [action.tool]: {
            cooldownUntil: action.now + tool.cooldownMs,
            uses: st.uses + 1,
          },
        },
        totalToolUses: state.totalToolUses + 1,
      };
    }
    case "reset":
      return initialGameState;
  }
}

export function isUnlocked(id: ToolId, state: GameState): boolean {
  const tool = TOOLS[id];
  if (!tool.unlockAfter) return true;
  if (id === "message") return state.totalToolUses >= tool.unlockAfter.uses;
  return state.tools[tool.unlockAfter.tool].uses >= tool.unlockAfter.uses;
}

export function currentSwipeInterval(engagement: number): number {
  const t = engagement / GAME.MAX_ENGAGEMENT;
  return Math.round(
    GAME.BASE_SWIPE_INTERVAL_MS +
      (GAME.MIN_SWIPE_INTERVAL_MS - GAME.BASE_SWIPE_INTERVAL_MS) * t,
  );
}
