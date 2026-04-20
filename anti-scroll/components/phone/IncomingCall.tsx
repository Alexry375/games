"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, MessageSquare, Bell, Video } from "lucide-react";
import { spring } from "@/lib/tokens";

export type CallData = {
  id: string;
  name: string;
  subtitle: string;
  hue: number;
} | null;

export function IncomingCall({ call, onDecline }: { call: CallData; onDecline: () => void }) {
  return (
    <AnimatePresence>
      {call && (
        <motion.div
          key={call.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={spring.soft}
          className="absolute inset-0 z-50 flex flex-col items-center justify-between pt-[110px] pb-14 text-white"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.24 0.02 280), oklch(0.08 0.01 280))",
            backdropFilter: "blur(40px)",
          }}
        >
          {/* Top: caller info */}
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <span
                className="absolute inset-0 animate-[pulse-ring_1.8s_ease-out_infinite] rounded-full"
                style={{ background: `oklch(0.6 0.18 ${call.hue} / 0.4)` }}
              />
              <span
                className="absolute inset-0 animate-[pulse-ring_1.8s_ease-out_infinite] rounded-full"
                style={{ background: `oklch(0.6 0.18 ${call.hue} / 0.3)`, animationDelay: "0.6s" }}
              />
              <div
                className="relative h-[120px] w-[120px] rounded-full ring-4 ring-white/10"
                style={{ background: `oklch(0.6 0.2 ${call.hue})` }}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[32px] font-light tracking-tight">{call.name}</span>
              <span className="text-[16px] text-white/60">{call.subtitle}</span>
            </div>
          </div>

          {/* Middle: secondary actions */}
          <div className="grid w-full grid-cols-3 gap-2 px-8 text-center">
            {[
              { icon: <Bell className="h-6 w-6" />, label: "Rappel" },
              { icon: <MessageSquare className="h-6 w-6" />, label: "Message" },
              { icon: <Video className="h-6 w-6" />, label: "FaceTime" },
            ].map((a) => (
              <div key={a.label} className="flex flex-col items-center gap-[6px]">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  {a.icon}
                </span>
                <span className="text-[11px] text-white/75">{a.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom: accept / decline */}
          <div className="flex w-full items-center justify-between px-10">
            <button
              onClick={onDecline}
              className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[oklch(0.62_0.2_25)] transition-transform active:scale-95"
              style={{
                boxShadow:
                  "0 8px 24px oklch(0.5 0.18 25 / 0.5), inset 0 1px 0 oklch(1 0 0 / 0.15)",
              }}
            >
              <PhoneOff className="h-7 w-7 text-white" strokeWidth={2.2} />
            </button>
            <button
              className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[oklch(0.68_0.17_145)] transition-transform active:scale-95"
              style={{
                boxShadow:
                  "0 8px 24px oklch(0.5 0.15 145 / 0.5), inset 0 1px 0 oklch(1 0 0 / 0.15)",
              }}
            >
              <Phone className="h-7 w-7 text-white" strokeWidth={2.2} fill="currentColor" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
