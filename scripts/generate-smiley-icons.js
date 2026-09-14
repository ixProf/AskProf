const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const size = 128;
const png = new PNG({ width: size, height: size });

// Color definitions
const darkBg = [18, 18, 22, 255]; // #121216 matching dark card background
const red = [220, 38, 38, 255];    // #dc2626 brand red

// Draw dark rounded-square background
const cornerRadius = 26;
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    // Check if inside rounded rectangle [0, 0, size, size] with cornerRadius
    let inside = true;
    let distCorner = 0;

    if (x < cornerRadius && y < cornerRadius) {
      distCorner = Math.sqrt((x - cornerRadius) ** 2 + (y - cornerRadius) ** 2);
      inside = distCorner <= cornerRadius;
    } else if (x >= size - cornerRadius && y < cornerRadius) {
      distCorner = Math.sqrt((x - (size - 1 - cornerRadius)) ** 2 + (y - cornerRadius) ** 2);
      inside = distCorner <= cornerRadius;
    } else if (x < cornerRadius && y >= size - cornerRadius) {
      distCorner = Math.sqrt((x - cornerRadius) ** 2 + (y - (size - 1 - cornerRadius)) ** 2);
      inside = distCorner <= cornerRadius;
    } else if (x >= size - cornerRadius && y >= size - cornerRadius) {
      distCorner = Math.sqrt((x - (size - 1 - cornerRadius)) ** 2 + (y - (size - 1 - cornerRadius)) ** 2);
      inside = distCorner <= cornerRadius;
    }

    const idx = (y * size + x) * 4;
    if (inside) {
      let alpha = 1;
      if (distCorner > cornerRadius - 1 && distCorner <= cornerRadius) {
        alpha = Math.max(0, Math.min(1, cornerRadius - distCorner + 0.5));
      }
      png.data[idx] = darkBg[0];
      png.data[idx + 1] = darkBg[1];
      png.data[idx + 2] = darkBg[2];
      png.data[idx + 3] = Math.round(darkBg[3] * alpha);
    } else {
      png.data[idx] = 0;
      png.data[idx + 1] = 0;
      png.data[idx + 2] = 0;
      png.data[idx + 3] = 0;
    }
  }
}

function drawPixel(x, y, color = red, alphaMul = 1) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const idx = (y * size + x) * 4;
  const srcA = (color[3] * alphaMul) / 255;
  const dstA = png.data[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA > 0) {
    png.data[idx] = Math.round((color[0] * srcA + png.data[idx] * dstA * (1 - srcA)) / outA);
    png.data[idx + 1] = Math.round((color[1] * srcA + png.data[idx + 1] * dstA * (1 - srcA)) / outA);
    png.data[idx + 2] = Math.round((color[2] * srcA + png.data[idx + 2] * dstA * (1 - srcA)) / outA);
    png.data[idx + 3] = Math.round(outA * 255);
  }
}

function drawThickPoint(cx, cy, r, color = red) {
  const minX = Math.floor(cx - r);
  const maxX = Math.ceil(cx + r);
  const minY = Math.floor(cy - r);
  const maxY = Math.ceil(cy + r);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= r) {
        const aa = Math.max(0, Math.min(1, r - dist + 0.5));
        drawPixel(x, y, color, aa);
      }
    }
  }
}

// 1. Draw irregular hand-drawn marker circle outline
// Center ~ 64, 64, radius ~ 42
const steps = 400;
for (let i = 0; i <= steps; i++) {
  const theta = (i / steps) * Math.PI * 2.05 - 0.25;
  const wobble = Math.sin(theta * 2) * 1.6 + Math.cos(theta * 3) * 1.1;
  const r = 42 + wobble;
  const x = 64 + r * Math.cos(theta);
  const y = 64 + r * Math.sin(theta);
  drawThickPoint(x, y, 4.2);
}

// 2. Eyes: two vertical small oval dots
// Left eye: center (49, 54), radius x: 2.8, y: 3.8
for (let dy = -4; dy <= 4; dy++) {
  for (let dx = -3; dx <= 3; dx++) {
    if ((dx / 2.8) ** 2 + (dy / 3.8) ** 2 <= 1) {
      drawPixel(49 + dx, 54 + dy, red, 1);
    }
  }
}
// Right eye: center (79, 54), radius x: 2.8, y: 3.8
for (let dy = -4; dy <= 4; dy++) {
  for (let dx = -3; dx <= 3; dx++) {
    if ((dx / 2.8) ** 2 + (dy / 3.8) ** 2 <= 1) {
      drawPixel(79 + dx, 54 + dy, red, 1);
    }
  }
}

// 3. Smile curve from (47, 75) to (81, 75) curving down to (64, 89)
const smileSteps = 150;
for (let i = 0; i <= smileSteps; i++) {
  const t = i / smileSteps;
  const x = (1 - t) * (1 - t) * 47 + 2 * (1 - t) * t * 64 + t * t * 81;
  const y = (1 - t) * (1 - t) * 75 + 2 * (1 - t) * t * 90 + t * t * 75;
  drawThickPoint(x, y, 4.0);
}

const buffer = PNG.sync.write(png);

// Write targets
const targets = [
  path.join(__dirname, '..', 'public', 'icon.png'),
  path.join(__dirname, '..', 'src', 'app', 'icon.png'),
  path.join(__dirname, '..', 'public', 'apple-icon.png'),
  path.join(__dirname, '..', 'src', 'app', 'apple-icon.png'),
];

targets.forEach((t) => fs.writeFileSync(t, buffer));

// Construct ICO
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);

const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(size > 255 ? 0 : size, 0);
dirEntry.writeUInt8(size > 255 ? 0 : size, 1);
dirEntry.writeUInt8(0, 2);
dirEntry.writeUInt8(0, 3);
dirEntry.writeUInt16LE(1, 4);
dirEntry.writeUInt16LE(32, 6);
dirEntry.writeUInt32LE(buffer.length, 8);
dirEntry.writeUInt32LE(22, 12);

const icoBuffer = Buffer.concat([icoHeader, dirEntry, buffer]);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), icoBuffer);
fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'favicon.ico'), icoBuffer);

console.log('✅ Generated dark rounded-square smiley favicon.ico, icon.png, and apple-icon.png');
