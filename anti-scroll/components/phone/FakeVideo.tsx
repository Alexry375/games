"use client";

type Props = {
  seed: number;
  /** Two OKLCH colors — controls mood. */
  colors: [string, string];
};

/**
 * Layered CSS-only "video" surface: animated radial gradients, color drift,
 * grain, and Ken-Burns style slow zoom. Enough motion to feel alive without a real clip.
 */
export function FakeVideo({ seed, colors }: Props) {
  const [a, b] = colors;
  const kbDur = 14 + (seed % 5); // 14–18s Ken Burns
  const driftDur = 9 + ((seed * 2) % 5); // 9–13s color drift
  const ox = ((seed * 37) % 60) - 30;
  const oy = ((seed * 53) % 60) - 30;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* base Ken-Burns layer */}
      <div
        className="absolute inset-[-10%] animate-[kb_var(--kb)_ease-in-out_infinite_alternate]"
        style={
          {
            ["--kb" as string]: `${kbDur}s`,
            background: `
              radial-gradient(55% 40% at ${50 + ox}% ${30 + oy}%, ${a}, transparent 70%),
              radial-gradient(65% 55% at ${50 - ox}% ${80 - oy / 2}%, ${b}, transparent 70%),
              linear-gradient(180deg, ${a}, ${b})
            `,
          } as React.CSSProperties
        }
      />

      {/* color drift overlay */}
      <div
        className="absolute inset-0 animate-[drift_var(--dd)_ease-in-out_infinite_alternate] mix-blend-screen opacity-[0.35]"
        style={
          {
            ["--dd" as string]: `${driftDur}s`,
            background: `radial-gradient(45% 35% at 60% 50%, oklch(0.9 0.15 ${(seed * 37) % 360} / 0.5), transparent 70%)`,
          } as React.CSSProperties
        }
      />

      {/* chromatic haze */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(135deg, oklch(1 0 0 / 0.08), transparent 40%, oklch(0 0 0 / 0.3))",
        }}
      />

      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* scan-subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 50%, transparent 60%, oklch(0 0 0 / 0.55))",
        }}
      />
    </div>
  );
}
