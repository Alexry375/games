const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function frame(t: number) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = '#fff';
  ctx.font = '20px system-ui';
  ctx.fillText(`alien-abduct boot t=${Math.floor(t)}`, 20, 40);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
