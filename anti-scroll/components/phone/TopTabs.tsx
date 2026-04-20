"use client";
import { Search } from "lucide-react";

export function TopTabs() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[54px] z-20 flex items-center justify-between px-4 pt-2">
      <div className="w-6" />
      <div className="flex items-center gap-5 text-[15px] font-semibold tracking-tight">
        <span className="text-white/55">Abonnements</span>
        <span className="relative text-white">
          Pour toi
          <span className="absolute inset-x-0 -bottom-[6px] mx-auto h-[2px] w-4 rounded-full bg-white" />
        </span>
      </div>
      <Search className="h-6 w-6 text-white" strokeWidth={2.4} />
    </div>
  );
}
