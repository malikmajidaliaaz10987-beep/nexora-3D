import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getProceduralTexture(
  type: 'carbon_fiber' | 'brushed_metal' | 'hex_grid' | 'circuit' | 'marble' | 'hologram',
  primaryColor = '#06b6d4'
): THREE.CanvasTexture {
  const cacheKey = `${type}_${primaryColor}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  switch (type) {
    case 'carbon_fiber': {
      // 2x2 weave pattern
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, 512, 512);
      const size = 16;
      for (let y = 0; y < 512; y += size) {
        for (let x = 0; x < 512; x += size) {
          const isEven = ((x / size) + (y / size)) % 2 === 0;
          ctx.fillStyle = isEven ? '#1f2937' : '#030712';
          ctx.fillRect(x, y, size, size);

          // Diagonal micro weave lines
          ctx.strokeStyle = isEven ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + size, y + size);
          ctx.stroke();
        }
      }
      break;
    }
    case 'hex_grid': {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 512, 512);

      const radius = 24;
      const h = radius * Math.sqrt(3);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;

      function drawHex(x: number, y: number) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = x + radius * Math.cos(angle);
          const py = y + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      for (let y = 0; y < 512 + h; y += h) {
        for (let x = 0; x < 512 + radius * 3; x += radius * 3) {
          drawHex(x, y);
          drawHex(x + radius * 1.5, y + h / 2);
        }
      }
      break;
    }
    case 'circuit': {
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;

      // Draw cyber circuit traces
      for (let i = 0; i < 40; i++) {
        const startX = (i * 37) % 512;
        const startY = (i * 53) % 512;
        const len = 30 + ((i * 17) % 80);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        if (i % 2 === 0) {
          ctx.lineTo(startX + len, startY);
          ctx.lineTo(startX + len, startY + len * 0.5);
        } else {
          ctx.lineTo(startX, startY + len);
          ctx.lineTo(startX + len * 0.7, startY + len);
        }
        ctx.stroke();

        // Node pad
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(startX, startY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'brushed_metal': {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 512, 512);

      // Fine horizontal streaks
      for (let y = 0; y < 512; y++) {
        const shade = Math.sin(y * 1.4) * 20 + (Math.random() - 0.5) * 40;
        const c = Math.min(255, Math.max(0, 60 + shade));
        ctx.strokeStyle = `rgba(${c}, ${c}, ${c + 10}, 0.25)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      break;
    }
    case 'marble': {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 512);

      // Organic fluid veins
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        let px = (i * 70) % 512;
        let py = 0;
        ctx.moveTo(px, py);
        while (py < 512) {
          px += (Math.random() - 0.48) * 40;
          py += 20;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      break;
    }
    case 'hologram': {
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      for (let y = 0; y < 512; y += 4) {
        ctx.fillRect(0, y, 512, 2);
      }
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function createGroundShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.4)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
