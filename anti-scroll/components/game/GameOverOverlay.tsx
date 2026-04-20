"use client";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy, Frown } from "lucide-react";

type Outcome = "defeat" | "victory";

export function GameOverOverlay({
  outcome,
  swipeCount,
  onRestart,
}: {
  outcome: Outcome | null;
  swipeCount: number;
  onRestart: () => void;
}) {
  const won = outcome === "victory";
  return (
    <AnimatePresence>
      {outcome && (
        <motion.div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 px-8 text-center"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0 }}
          style={{ background: "oklch(0.06 0.006 260 / 0.72)" }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: won
                ? "linear-gradient(135deg, oklch(0.82 0.17 140), oklch(0.62 0.19 145))"
                : "linear-gradient(135deg, oklch(0.72 0.18 25), oklch(0.5 0.18 15))",
              boxShadow: `0 0 30px oklch(0.7 0.2 ${won ? 145 : 20} / 0.55)`,
            }}
          >
            {won ? (
              <Trophy className="h-7 w-7 text-white" strokeWidth={2.2} />
            ) : (
              <Frown className="h-7 w-7 text-white" strokeWidth={2.2} />
            )}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            {won ? "Il a lâché" : "Tu l'as perdu"}
          </span>
          <h2 className="text-[26px] font-semibold text-white tracking-tight leading-tight">
            {won ? "Il pose son téléphone." : "Il est totalement absorbé."}
          </h2>
          <p className="max-w-[260px] text-[13px] leading-snug text-white/60">
            {won
              ? `Bien joué — il a craqué après ${swipeCount} vidéos. Tu l'as sauvé du feed.`
              : `${swipeCount} vidéos scrollées avant que tu abandonnes. Le feed a gagné cette manche.`}
          </p>
          <button
            onClick={onRestart}
            className="mt-2 flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-black transition-transform hover:scale-[1.03] active:scale-95"
            style={{
              background: "oklch(0.97 0.003 260)",
              boxShadow: "0 6px 20px oklch(0 0 0 / 0.4)",
            }}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
            Rejouer
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
