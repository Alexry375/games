"use client";
import Image from "next/image";
import { Heart, MessageCircle, Forward, Bookmark, Music2, Check } from "lucide-react";
import { FakeVideo } from "./FakeVideo";

export type FeedItemData = {
  id: string;
  username: string;
  verified?: boolean;
  caption: string;
  music: string;
  likes: string;
  comments: string;
  shares: string;
  bookmarks: string;
  colors: [string, string];
  seed: number;
  avatarSeed: string;
};

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex flex-col items-center gap-[3px]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
        {icon}
      </div>
      <span className="text-[12px] font-semibold text-white drop-shadow tabular-nums">
        {value}
      </span>
    </div>
  );
}

export function FeedItem({ item }: { item: FeedItemData }) {
  return (
    <article className="relative h-full w-full shrink-0 snap-start overflow-hidden bg-black">
      <FakeVideo seed={item.seed} colors={item.colors} />

      {/* bottom fade for legibility */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Right-side action rail */}
      <div className="absolute bottom-28 right-2 flex flex-col items-center gap-4">
        <div className="relative">
          <Image
            src={`https://i.pravatar.cc/88?u=${item.avatarSeed}`}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white"
            unoptimized
          />
          <div className="absolute -bottom-1 left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-[oklch(0.68_0.2_25)]">
            <span className="text-[10px] font-bold leading-none text-white">+</span>
          </div>
        </div>
        <Stat
          icon={<Heart className="h-6 w-6 text-white" fill="currentColor" strokeWidth={0} />}
          value={item.likes}
        />
        <Stat
          icon={<MessageCircle className="h-6 w-6 text-white" fill="currentColor" strokeWidth={0} />}
          value={item.comments}
        />
        <Stat
          icon={<Bookmark className="h-6 w-6 text-white" fill="currentColor" strokeWidth={0} />}
          value={item.bookmarks}
        />
        <Stat
          icon={<Forward className="h-6 w-6 text-white" fill="currentColor" strokeWidth={0} />}
          value={item.shares}
        />
        {/* spinning music disc */}
        <div
          className="mt-1 h-10 w-10 rounded-full ring-2 ring-white/20"
          style={{
            background:
              "conic-gradient(from 0deg, oklch(0.25 0 0), oklch(0.1 0 0), oklch(0.25 0 0))",
            animation: "spin 6s linear infinite",
          }}
        >
          <div className="m-[13px] h-[14px] w-[14px] rounded-full bg-white/90" />
        </div>
      </div>

      {/* Bottom-left caption */}
      <div className="absolute inset-x-0 bottom-[92px] px-4 pr-20">
        <div className="flex items-center gap-[6px] pb-2">
          <span className="text-[15px] font-semibold text-white tracking-tight">
            @{item.username}
          </span>
          {item.verified && (
            <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[oklch(0.65_0.15_230)]">
              <Check className="h-[10px] w-[10px] text-white" strokeWidth={4} />
            </span>
          )}
        </div>
        <p className="text-[14px] leading-snug text-white/95 tracking-tight">
          {item.caption}
        </p>
        <div className="mt-2 flex items-center gap-[6px] text-[12px] font-medium text-white/90">
          <Music2 className="h-[13px] w-[13px]" strokeWidth={2.5} />
          <span className="truncate">{item.music}</span>
        </div>
      </div>
    </article>
  );
}
