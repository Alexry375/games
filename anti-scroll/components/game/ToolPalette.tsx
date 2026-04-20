"use client";
import { useEffect, useState } from "react";
import { BellRing, PhoneCall, Heart, Lock } from "lucide-react";
import { GameState, TOOLS, ToolId, isUnlocked } from "@/lib/game";

const ICONS: Record<ToolId, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  notif: BellRing,
  call: PhoneCall,
  message: Heart,
};

function useNow(intervalMs = 100) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function ToolPalette({
  state,
  onUse,
}: {
  state: GameState;
  onUse: (tool: ToolId) => void;
}) {
  const now = useNow(100);
  const ids: ToolId[] = ["notif", "call", "message"];
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
        Outils
      </span>
      {ids.map((id) => {
        const tool = TOOLS[id];
        const st = state.tools[id];
        const unlocked = isUnlocked(id, state);
        const remaining = Math.max(0, st.cooldownUntil - now);
        const onCooldown = remaining > 0;
        const pct = onCooldown ? (remaining / tool.cooldownMs) * 100 : 0;
        const Icon = ICONS[id];
        const disabled = !unlocked || onCooldown || state.gameOver;

        let unlockHint = "";
        if (!unlocked && tool.unlockAfter) {
          const have =
            id === "message" ? state.totalToolUses : state.tools[tool.unlockAfter.tool].uses;
          unlockHint = `${have}/${tool.unlockAfter.uses}`;
        }

        return (
          <button
            key={id}
            onClick={() => onUse(id)}
            disabled={disabled}
            className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl transition-transform disabled:cursor-not-allowed enabled:hover:scale-[1.04] enabled:active:scale-95"
            style={{
              background: unlocked
                ? "linear-gradient(145deg, oklch(0.26 0.01 260), oklch(0.14 0.006 260))"
                : "oklch(0.14 0.006 260)",
              boxShadow: unlocked
                ? "0 1px 0 oklch(1 0 0 / 0.08) inset, 0 0 0 1px oklch(1 0 0 / 0.06), 0 6px 14px oklch(0 0 0 / 0.5)"
                : "inset 0 0 0 1px oklch(1 0 0 / 0.03)",
              opacity: disabled && unlocked ? 0.55 : 1,
            }}
            title={unlocked ? tool.label : `Verrouillé — ${unlockHint}`}
          >
            {unlocked ? (
              <Icon
                className="h-6 w-6 text-white"
                strokeWidth={2.2}
              />
            ) : (
              <div className="flex flex-col items-center gap-[2px] text-white/40">
                <Lock className="h-4 w-4" strokeWidth={2.4} />
                <span className="font-mono text-[9px] tabular-nums">{unlockHint}</span>
              </div>
            )}
            {onCooldown && unlocked && (
              <>
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: `${pct}%`,
                    background: "oklch(0.08 0.006 260 / 0.7)",
                    transition: "height 0.1s linear",
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tabular-nums text-white">
                  {(remaining / 1000).toFixed(1)}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
