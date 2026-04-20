"use client";
import { motion, AnimatePresence } from "framer-motion";
import { spring } from "@/lib/tokens";

export type ToastData = {
  id: string;
  app: string;
  appColor: string;
  title: string;
  body: string;
  time: string;
};

export function NotificationToast({ toast }: { toast: ToastData | null }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 top-[66px] z-40">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.98 }}
            transition={spring.snappy}
            className="shadow-notif flex items-start gap-3 rounded-[18px] px-3 py-[10px] text-white"
            style={{
              background: "oklch(0.24 0.008 260 / 0.75)",
              backdropFilter: "blur(24px) saturate(1.6)",
              WebkitBackdropFilter: "blur(24px) saturate(1.6)",
            }}
          >
            <div
              className="mt-[2px] h-[38px] w-[38px] shrink-0 rounded-[10px]"
              style={{ background: toast.appColor }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold tracking-tight truncate">
                  {toast.app}
                </span>
                <span className="shrink-0 text-[11px] font-medium text-white/55 tabular-nums">
                  {toast.time}
                </span>
              </div>
              <p className="text-[14px] font-medium leading-tight tracking-tight truncate">
                {toast.title}
              </p>
              <p className="mt-[1px] text-[13px] leading-tight text-white/75 line-clamp-2">
                {toast.body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
