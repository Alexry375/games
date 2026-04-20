"use client";
import { motion } from "framer-motion";

export function VerticalGauge({
  label,
  value,
  max,
  hueFrom,
  hueTo,
  invert = false,
}: {
  label: string;
  value: number;
  max: number;
  hueFrom: number;
  hueTo: number;
  invert?: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const t = pct / 100;
  const hue = hueFrom + (hueTo - hueFrom) * (invert ? 1 - t : t);
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
        {label}
      </span>
      <div
        className="relative w-3 overflow-hidden rounded-full"
        style={{
          height: 320,
          background: "oklch(0.18 0.006 260)",
          boxShadow:
            "inset 0 1px 2px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(1 0 0 / 0.04)",
        }}
      >
        <motion.div
          className="absolute inset-x-0 bottom-0"
          animate={{ height: `${pct}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          style={{
            background: `linear-gradient(to top, oklch(0.62 0.19 ${hue}), oklch(0.82 0.17 ${hue}))`,
            boxShadow: `0 0 12px oklch(0.75 0.2 ${hue} / 0.55)`,
          }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-white/60">
        {Math.round(pct)}%
      </span>
    </div>
  );
}
