let audio: HTMLAudioElement | null = null;

export function startBgm(): void {
  if (audio) return;
  audio = new Audio('/bgm.mp3');
  audio.loop = true;
  audio.volume = 0.35;
  audio.play().catch(() => { /* attend interaction user */ });
}
