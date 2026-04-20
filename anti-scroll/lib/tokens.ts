export const spring = {
  snappy: { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.9 },
  soft:   { type: "spring" as const, stiffness: 260, damping: 28, mass: 1 },
  bounce: { type: "spring" as const, stiffness: 380, damping: 20, mass: 1 },
};
