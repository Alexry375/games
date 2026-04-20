"use client";
import { useEffect, useState } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";

export function StatusBar() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
      );
    };
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[54px] items-center justify-between px-8 text-white font-[var(--font-ios)]">
      <span className="text-[17px] font-semibold tracking-tight leading-none tabular-nums">
        {time}
      </span>
      <div className="flex items-center gap-[6px]">
        <Signal className="h-[14px] w-[14px]" strokeWidth={2.5} />
        <Wifi className="h-[14px] w-[14px]" strokeWidth={2.5} />
        <BatteryFull className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>
    </div>
  );
}
