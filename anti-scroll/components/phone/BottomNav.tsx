"use client";
import { House, Users, Plus, Inbox, User } from "lucide-react";

function Tab({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-[2px]">
      <div className={active ? "text-white" : "text-white/55"}>{icon}</div>
      <span className={`text-[10px] font-medium ${active ? "text-white" : "text-white/55"}`}>
        {label}
      </span>
    </div>
  );
}

export function BottomNav() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[82px] bg-gradient-to-t from-black via-black/90 to-transparent pt-2">
      <div className="flex h-full items-start justify-between px-6 pt-2">
        <Tab icon={<House className="h-6 w-6" strokeWidth={2} fill="currentColor" />} label="Pour toi" active />
        <Tab icon={<Users className="h-6 w-6" strokeWidth={2} />} label="Amis" />
        <div className="relative -mt-1 flex h-8 w-12 items-center justify-center">
          <span className="absolute inset-y-0 left-1 w-10 rounded-lg bg-[oklch(0.68_0.17_200)]" />
          <span className="absolute inset-y-0 right-1 w-10 rounded-lg bg-[oklch(0.68_0.18_12)]" />
          <span className="relative flex h-8 w-12 items-center justify-center rounded-lg bg-white">
            <Plus className="h-5 w-5 text-black" strokeWidth={3} />
          </span>
        </div>
        <Tab icon={<Inbox className="h-6 w-6" strokeWidth={2} />} label="Boîte" />
        <Tab icon={<User className="h-6 w-6" strokeWidth={2} />} label="Profil" />
      </div>
    </div>
  );
}
