"use client";
import { ReactNode } from "react";

export function Bezel({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative shadow-phone grain"
      style={{
        width: 390,
        height: 844,
        borderRadius: 52,
        padding: 10,
        background:
          "linear-gradient(145deg, oklch(0.28 0.004 260), oklch(0.12 0.004 260) 40%, oklch(0.22 0.004 260))",
      }}
    >
      {/* inner bezel highlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: 52,
          boxShadow:
            "inset 0 0 0 1px oklch(1 0 0 / 0.08), inset 0 2px 2px oklch(1 0 0 / 0.04)",
        }}
      />
      {/* screen */}
      <div
        className="phone-screen relative h-full w-full overflow-hidden bg-black"
        style={{ borderRadius: 44 }}
      >
        {children}
      </div>
    </div>
  );
}
