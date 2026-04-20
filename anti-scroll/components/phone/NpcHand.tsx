"use client";
import { motion, AnimatePresence } from "framer-motion";

/*
 * Hand artwork adapted from OpenMoji (CC BY-SA 4.0) — 1F446 "Backhand index pointing up".
 * Original: https://openmoji.org · recolored + restyled for this scene.
 */
export function NpcHand({ swiping }: { swiping: boolean }) {
  return (
    <AnimatePresence>
      {swiping && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <motion.div
            className="absolute"
            style={{
              width: 230,
              left: "50%",
              bottom: 0,
              marginLeft: -115,
              filter: "drop-shadow(-6px 6px 14px oklch(0 0 0 / 0.55))",
            }}
            initial={{ y: 230 }}
            animate={{ y: [230, 40, 40, -240] }}
            exit={{ y: 260, opacity: 0 }}
            transition={{ duration: 0.9, times: [0, 0.32, 0.48, 1], ease: [0.34, 0.8, 0.4, 1] }}
          >
            <svg viewBox="0 0 72 72" width="230" height="230">
              <defs>
                <linearGradient id="npc-skin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.86 0.05 55)" />
                  <stop offset="100%" stopColor="oklch(0.72 0.07 40)" />
                </linearGradient>
                <linearGradient id="npc-cuff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.42 0.03 250)" />
                  <stop offset="100%" stopColor="oklch(0.24 0.03 250)" />
                </linearGradient>
              </defs>
              {/* cuff/sleeve band at wrist */}
              <path
                d="M22.5,47.5 Q22.5,68 39,72 Q55.5,68 55.5,47.5 L55.5,58 Q55.5,74 39,76 Q22.5,74 22.5,58 Z"
                fill="url(#npc-cuff)"
                stroke="oklch(0.12 0.02 250)"
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
              {/* palm + index + folded fingers (OpenMoji 1F446 silhouette) */}
              <path
                d="M55.36,33.73c-0.38-1.44-1.66-2.53-3.23-2.6c-1.67-0.07-3.12,1.04-3.52,2.6h-0.19c0,0.02,0.01,0.05,0.01,0.08
                c-0.01-0.03-0.01-0.06-0.02-0.08v-0.01c-0.11-0.56-0.35-1.06-0.69-1.49c-0.06-0.08-0.13-0.16-0.21-0.24
                c-0.17-0.18-0.35-0.34-0.56-0.47c-0.07-0.05-0.14-0.1-0.21-0.14c-0.17-0.1-0.34-0.18-0.52-0.25c-0.1-0.04-0.2-0.07-0.3-0.09
                c-0.12-0.04-0.25-0.07-0.38-0.09c-0.08-0.01-0.16-0.02-0.24-0.03h-0.04c-0.01,0-0.01,0-0.02,0c-0.09-0.01-0.17-0.01-0.26-0.01
                c-0.12,0-0.23,0-0.34,0.02c-0.23,0.02-0.44,0.06-0.65,0.12c-0.43,0.13-0.83,0.34-1.18,0.62c-0.08,0.06-0.16,0.13-0.24,0.21
                c-0.09,0.07-0.16,0.15-0.23,0.24c-0.07,0.08-0.14,0.16-0.2,0.25c-0.06,0.09-0.12,0.18-0.18,0.28c-0.11,0.19-0.2,0.39-0.28,0.6
                c-0.05,0.16-0.1,0.32-0.12,0.49h-0.13c-0.12-1.72-1.49-3.12-3.26-3.23c-1.74-0.11-3.25,1.06-3.63,2.7v0.58l-0.09-0.01V11.4
                c0-0.11-0.01-0.23-0.02-0.34c-0.17-1.78-1.65-3.16-3.48-3.16c-1.93,0-3.5,1.56-3.5,3.5v24.27l0.02,0.03l-0.02,1.25v-1.28
                l-0.79-1.07l-1.35-1.83l-0.69,0.45c-0.22-0.23-0.51-0.48-0.87-0.71l-0.01-0.01c-1.8-1.28-5-2.58-6.16-1.46
                c-1.35,1.31-0.56,4.23,4.86,11.37c0.99,20.84,8.68,19.56,16.58,21.69c7.66,0.71,16.13-6.31,16.25-18.14h0.21V34.37
                C55.48,34.31,55.44,34.02,55.36,33.73z"
                fill="url(#npc-skin)"
                stroke="oklch(0.22 0.04 40)"
                strokeWidth={1.3}
                strokeLinejoin="round"
              />
              {/* fingernail on index */}
              <path
                d="M29 11 Q30.8 9.5 33 11 L33 15 Q30.8 13.8 29 15 Z"
                fill="oklch(0.93 0.02 55 / 0.55)"
              />
              {/* knuckle lines between folded fingers */}
              <g
                fill="none"
                stroke="oklch(0.35 0.04 40 / 0.55)"
                strokeWidth={0.8}
                strokeLinecap="round"
              >
                <path d="M41.6 34.4 Q41.8 36.5 41.6 39" />
                <path d="M48.6 34.6 Q48.8 36.5 48.6 39" />
              </g>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
