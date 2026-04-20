"use client";
import { BellRing, PhoneIncoming } from "lucide-react";

export function DebugPanel({
  onNotif,
  onCall,
}: {
  onNotif: () => void;
  onCall: () => void;
}) {
  return (
    <div
      className="fixed bottom-6 left-6 z-[100] flex items-center gap-1 rounded-full p-1 text-[13px] font-medium"
      style={{
        background: "oklch(0.18 0.005 260 / 0.7)",
        backdropFilter: "blur(16px)",
        boxShadow:
          "0 1px 0 oklch(1 0 0 / 0.06) inset, 0 0 0 1px oklch(1 0 0 / 0.06), 0 6px 20px oklch(0 0 0 / 0.5)",
      }}
    >
      <button
        onClick={onNotif}
        className="flex items-center gap-[6px] rounded-full px-3 py-2 text-white transition-colors hover:bg-white/5"
      >
        <BellRing className="h-[14px] w-[14px]" strokeWidth={2.2} />
        Notif
      </button>
      <button
        onClick={onCall}
        className="flex items-center gap-[6px] rounded-full px-3 py-2 text-white transition-colors hover:bg-white/5"
      >
        <PhoneIncoming className="h-[14px] w-[14px]" strokeWidth={2.2} />
        Appel
      </button>
    </div>
  );
}
