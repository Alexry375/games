"use client";
import { motion, AnimatePresence } from "framer-motion";
import { spring } from "@/lib/tokens";

export type IslandState =
  | { kind: "idle" }
  | { kind: "ring"; name: string }
  | { kind: "notif"; from: string };

export function DynamicIsland({ state }: { state: IslandState }) {
  const expanded = state.kind !== "idle";

  return (
    <motion.div
      layout
      transition={spring.snappy}
      className="absolute left-1/2 top-[14px] z-40 -translate-x-1/2 overflow-hidden bg-black ring-1 ring-white/5"
      style={{
        borderRadius: 999,
        minWidth: expanded ? 320 : 116,
        height: expanded ? 40 : 36,
      }}
    >
      <AnimatePresence mode="wait">
        {state.kind === "idle" && <motion.div key="idle" className="h-full w-full" />}
        {state.kind === "ring" && (
          <motion.div
            key="ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex h-full items-center justify-between pl-3 pr-4 text-white"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(0.68_0.17_145)]">
                <span className="absolute inset-0 animate-[pulse-ring_1.2s_ease-out_infinite] rounded-full bg-[oklch(0.68_0.17_145)]" />
                <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="currentColor">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.05-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.24 1.05l-2.21 2.17z" />
                </svg>
              </span>
              <span className="text-[13px] font-medium tracking-tight">{state.name}</span>
            </div>
            <span className="text-[12px] text-white/60 tabular-nums">mobile</span>
          </motion.div>
        )}
        {state.kind === "notif" && (
          <motion.div
            key="notif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex h-full items-center gap-2 pl-3 pr-4 text-white"
          >
            <span className="h-5 w-5 rounded-md bg-[oklch(0.65_0.2_250)]" />
            <span className="text-[13px] font-medium">{state.from}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
