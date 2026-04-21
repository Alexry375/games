import type { WeaponKind } from '../game/types';

export function drawWeapon(ctx: CanvasRenderingContext2D, t: number, kind: WeaponKind): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000';

  switch (kind) {
    case 'pistol': {
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.rect(0, -3, 14, 6);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(2, 2, 5, 7);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'cannon': {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.rect(-2, -6, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(22, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'pierce': {
      ctx.fillStyle = '#6b4226';
      ctx.beginPath();
      ctx.rect(0, -2, 32, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#444';
      ctx.fillRect(4, -1, 6, 6);
      ctx.strokeRect(4, -1, 6, 6);
      break;
    }
    case 'smg': {
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.rect(0, -4, 16, 8);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(16 + i * 2, -2 + i * 2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
      }
      break;
    }
    case 'heal': {
      ctx.fillStyle = 'rgba(120,220,255,0.6)';
      ctx.beginPath();
      ctx.rect(0, -10, 10, 20);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillRect(2, -2, 6, 4);
      ctx.fillRect(4, -4, 2, 8);
      break;
    }
    case 'bomb': {
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(8, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const spark = 0.5 + 0.5 * Math.sin(t * 0.02);
      ctx.fillStyle = `rgb(${255},${Math.floor(180 * spark)},0)`;
      ctx.beginPath();
      ctx.arc(8, -13, 3 + spark * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}
