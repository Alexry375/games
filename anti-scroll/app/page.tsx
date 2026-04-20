"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import { Bezel } from "@/components/phone/Bezel";
import { StatusBar } from "@/components/phone/StatusBar";
import { DynamicIsland, IslandState } from "@/components/phone/DynamicIsland";
import { TopTabs } from "@/components/phone/TopTabs";
import { Feed } from "@/components/phone/Feed";
import { BottomNav } from "@/components/phone/BottomNav";
import { NotificationToast, ToastData } from "@/components/phone/NotificationToast";
import { IncomingCall, CallData } from "@/components/phone/IncomingCall";
import { NpcHand } from "@/components/phone/NpcHand";
import { VerticalGauge } from "@/components/game/VerticalGauge";
import { ToolPalette } from "@/components/game/ToolPalette";
import { GameOverOverlay } from "@/components/game/GameOverOverlay";
import {
  GAME,
  TOOLS,
  ToolId,
  currentSwipeInterval,
  gameReducer,
  initialGameState,
  isUnlocked,
} from "@/lib/game";

const NOTIFS: Omit<ToastData, "id" | "time">[] = [
  {
    app: "Messages",
    appColor: "linear-gradient(135deg, oklch(0.78 0.17 145), oklch(0.55 0.15 145))",
    title: "Tom",
    body: "tu viens bosser ? on t'attend depuis 2h mec",
  },
  {
    app: "Agenda",
    appColor: "linear-gradient(135deg, oklch(0.72 0.18 25), oklch(0.55 0.18 25))",
    title: "Réunion dans 5 min",
    body: "Stand-up quotidien · Google Meet",
  },
  {
    app: "Camille",
    appColor: "linear-gradient(135deg, oklch(0.72 0.16 10), oklch(0.5 0.18 10))",
    title: "Camille",
    body: "on avait dit qu'on sortait à 14h. il est 16h37.",
  },
];

type CallPreset = { name: string; subtitle: string; hue: number };
const CALLS: CallPreset[] = [
  { name: "Maman", subtitle: "mobile · France", hue: 10 },
  { name: "Tom Dupuis", subtitle: "WhatsApp · appel vidéo", hue: 145 },
  { name: "Numéro inconnu", subtitle: "France · suspecté spam", hue: 230 },
];

function nowTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function Home() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [call, setCall] = useState<CallData | null>(null);
  const [island, setIsland] = useState<IslandState>({ kind: "idle" });
  const [swiping, setSwiping] = useState(false);
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const feedRef = useRef<HTMLDivElement>(null);
  const swipingRef = useRef(false);
  const interruptRef = useRef(false);

  function pushNotif(data: Omit<ToastData, "id" | "time">) {
    const id = crypto.randomUUID();
    setToast({ ...data, id, time: nowTime() });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 4200);
  }

  function triggerCall() {
    const id = crypto.randomUUID();
    const c = CALLS[Math.floor(Math.random() * CALLS.length)];
    setCall({ id, name: c.name, subtitle: c.subtitle, hue: c.hue });
    setIsland({ kind: "ring", name: c.name });
    setTimeout(() => {
      setCall((prev) => (prev?.id === id ? null : prev));
      setIsland((prev) => (prev.kind === "ring" && prev.name === c.name ? { kind: "idle" } : prev));
    }, 5500);
  }

  function declineCall() {
    setCall(null);
    setIsland({ kind: "idle" });
  }

  function performSwipe() {
    if (swipingRef.current || state.gameOver || state.victory) return;
    swipingRef.current = true;
    interruptRef.current = false;
    setSwiping(true);

    // start scroll mid-animation so it reads as hand pushing the feed
    setTimeout(() => {
      if (!interruptRef.current && feedRef.current) {
        feedRef.current.scrollBy({
          top: feedRef.current.clientHeight,
          behavior: "smooth",
        });
        dispatch({ type: "npc_swipe" });
      }
    }, 280);

    setTimeout(() => {
      setSwiping(false);
      swipingRef.current = false;
    }, GAME.SWIPE_DURATION_MS);
  }

  // Autonomous NPC loop
  useEffect(() => {
    if (state.gameOver || state.victory) return;
    const delay = currentSwipeInterval(state.engagement);
    const id = setTimeout(() => performSwipe(), delay);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.engagement, state.swipeCount, state.gameOver, state.victory]);

  function useTool(id: ToolId) {
    const now = Date.now();
    if (state.gameOver || state.victory) return;
    if (!isUnlocked(id, state)) return;
    if (now < state.tools[id].cooldownUntil) return;
    const tool = TOOLS[id];
    const willInterrupt = swipingRef.current && Math.random() < tool.interruptChance;
    if (willInterrupt) interruptRef.current = true;
    dispatch({ type: "use_tool", tool: id, now, interrupted: willInterrupt });
    if (id === "notif") pushNotif(NOTIFS[0]);
    else if (id === "message") pushNotif(NOTIFS[2]);
    else if (id === "call") triggerCall();
  }

  function restart() {
    dispatch({ type: "reset" });
    setToast(null);
    setCall(null);
    setIsland({ kind: "idle" });
    if (feedRef.current) feedRef.current.scrollTo({ top: 0 });
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: "oklch(0.09 0.002 260)" }}
    >
      <div className="flex items-center gap-8">
        <VerticalGauge
          label="Engagement"
          value={state.engagement}
          max={GAME.MAX_ENGAGEMENT}
          hueFrom={145}
          hueTo={15}
        />

        <div className="relative">
          <Bezel>
            <Feed ref={feedRef} />
            <TopTabs />
            <BottomNav />
            <StatusBar />
            <DynamicIsland state={island} />
            <NotificationToast toast={toast} />
            <IncomingCall call={call} onDecline={declineCall} />
            <NpcHand swiping={swiping} />
            <GameOverOverlay
              outcome={state.gameOver ? "defeat" : state.victory ? "victory" : null}
              swipeCount={state.swipeCount}
              onRestart={restart}
            />
          </Bezel>
        </div>

        <VerticalGauge
          label="Ennui"
          value={state.boredom}
          max={GAME.MAX_BOREDOM}
          hueFrom={260}
          hueTo={145}
        />

        <ToolPalette state={state} onUse={useTool} />
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 font-mono text-[11px] tracking-wide text-white/30">
        ANTI-SCROLL · prototype
      </div>
    </div>
  );
}
