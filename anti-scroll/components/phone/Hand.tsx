"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Silhouette thumb entering from the right, swiping up, leaving.
 * Triggered by the `swipeKey` prop — increment to play the animation once.
 */
export function Hand({ swipeKey }: { swipeKey: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (swipeKey <= 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1700);
    return () => clearTimeout(t);
  }, [swipeKey]);

  return (
    <AnimatePresence>
      {visible && (
    <motion.div
      key={swipeKey}
      className="pointer-events-none absolute right-0 top-0 z-30 h-full w-[240px]"
      initial={{ x: 300, y: 260 }}
      animate={{
        x: [300, 60, 60, 300],
        y: [260, 260, -80, -80],
      }}
      exit={{ opacity: 0 }}
      transition={{
        times: [0, 0.18, 0.72, 1],
        duration: 1.6,
        ease: "easeInOut",
      }}
    >
      {/* hand/thumb silhouette — stylized */}
      <svg
        viewBox="0 0 240 600"
        className="absolute inset-0 h-full w-full"
        style={{ filter: "blur(2px) drop-shadow(0 8px 24px oklch(0 0 0 / 0.6))" }}
      >
        <defs>
          <linearGradient id="skin" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.42 0.05 30)" />
            <stop offset="1" stopColor="oklch(0.3 0.04 30)" />
          </linearGradient>
        </defs>
        {/* palm/forearm coming in from right */}
        <path
          d="M 240 600 L 240 180 Q 240 120 180 120 Q 130 120 110 160 L 80 300 Q 70 360 100 420 L 130 600 Z"
          fill="url(#skin)"
          opacity="0.95"
        />
        {/* thumb sticking out to left */}
        <path
          d="M 110 160 Q 70 140 40 170 Q 10 210 30 260 Q 60 280 100 260 Q 120 240 120 200 Z"
          fill="url(#skin)"
          opacity="0.95"
        />
      </svg>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
