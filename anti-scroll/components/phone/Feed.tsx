"use client";
import { forwardRef } from "react";
import { FeedItem, FeedItemData } from "./FeedItem";

export const SAMPLE_FEED: FeedItemData[] = [
  {
    id: "1",
    username: "lunarpanda",
    verified: true,
    caption: "le pov où tu devais travailler il y a 2h 🙃 #procrastination #fyp",
    music: "original sound · lunarpanda",
    likes: "847.2K",
    comments: "4 128",
    shares: "12.4K",
    bookmarks: "38.9K",
    colors: ["oklch(0.55 0.16 330)", "oklch(0.18 0.08 280)"],
    seed: 7,
    avatarSeed: "lunarpanda",
  },
  {
    id: "2",
    username: "tom.eats",
    caption: "on a testé le pire kebab de Paris (spoiler : c'était excellent)",
    music: "Paris Latino (sped up) · 2.4M utilisent ce son",
    likes: "2.1M",
    comments: "28.3K",
    shares: "191.0K",
    bookmarks: "412.5K",
    colors: ["oklch(0.62 0.18 55)", "oklch(0.2 0.1 30)"],
    seed: 23,
    avatarSeed: "tomeats",
  },
  {
    id: "3",
    username: "kenji.codes",
    verified: true,
    caption: "quand ton senior relit ton PR à 23h47 💀 #devlife",
    music: "Sprinter · Dave & Central Cee",
    likes: "156.8K",
    comments: "891",
    shares: "3 214",
    bookmarks: "9 802",
    colors: ["oklch(0.42 0.12 210)", "oklch(0.12 0.06 230)"],
    seed: 41,
    avatarSeed: "kenji",
  },
  {
    id: "4",
    username: "sofia.oops",
    caption: "tutoriel : comment ruiner une raclette en 30 secondes chrono",
    music: "Nuages · Django Reinhardt (remix)",
    likes: "98.4K",
    comments: "1 502",
    shares: "2 870",
    bookmarks: "14.1K",
    colors: ["oklch(0.58 0.16 140)", "oklch(0.18 0.1 160)"],
    seed: 63,
    avatarSeed: "sofia",
  },
  {
    id: "5",
    username: "mrdoomscroll",
    caption: "5ème heure de scroll. je sens plus mes doigts. aidez-moi",
    music: "sad violin (but it slaps) · anonymous",
    likes: "1.9M",
    comments: "42.0K",
    shares: "88.7K",
    bookmarks: "210.4K",
    colors: ["oklch(0.38 0.12 350)", "oklch(0.08 0.02 290)"],
    seed: 89,
    avatarSeed: "mrdoom",
  },
];

export const Feed = forwardRef<HTMLDivElement>(function Feed(_props, ref) {
  return (
    <div
      ref={ref}
      className="feed-scroll absolute inset-0 snap-y snap-mandatory overflow-y-scroll overscroll-contain"
      style={{ scrollSnapStop: "always", touchAction: "none" }}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      {SAMPLE_FEED.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  );
});
