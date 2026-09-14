const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const width = 1200;
const height = 630;
const png = new PNG({ width, height });

// Fill background with dark canvas #09090b
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    png.data[idx] = 9;
    png.data[idx + 1] = 9;
    png.data[idx + 2] = 11;
    png.data[idx + 3] = 255;
  }
}

// Draw Inner Elevated Card (x: 48 to 1152, y: 48 to 582, rounded corners r=24)
const cardX1 = 48;
const cardY1 = 48;
const cardX2 = 1152;
const cardY2 = 582;
const cardR = 24;

for (let y = cardY1; y <= cardY2; y++) {
  for (let x = cardX1; x <= cardX2; x++) {
    let inside = true;
    if (x < cardX1 + cardR && y < cardY1 + cardR) {
      inside = Math.sqrt((x - (cardX1 + cardR)) ** 2 + (y - (cardY1 + cardR)) ** 2) <= cardR;
    } else if (x > cardX2 - cardR && y < cardY1 + cardR) {
      inside = Math.sqrt((x - (cardX2 - cardR)) ** 2 + (y - (cardY1 + cardR)) ** 2) <= cardR;
    } else if (x < cardX1 + cardR && y > cardY2 - cardR) {
      inside = Math.sqrt((x - (cardX1 + cardR)) ** 2 + (y - (cardY2 - cardR)) ** 2) <= cardR;
    } else if (x > cardX2 - cardR && y > cardY2 - cardR) {
      inside = Math.sqrt((x - (cardX2 - cardR)) ** 2 + (y - (cardY2 - cardR)) ** 2) <= cardR;
    }

    if (inside) {
      const idx = (y * width + x) * 4;
      // Gradient / Surface tone: #121216 to #15151b
      const tone = Math.round(18 + (y / height) * 5);
      png.data[idx] = tone;
      png.data[idx + 1] = tone;
      png.data[idx + 2] = tone + 4;
      png.data[idx + 3] = 255;
    }
  }
}

// Draw Top Brand Red Accent Line across the card (y: 48 to 54)
for (let y = cardY1; y <= cardY1 + 6; y++) {
  for (let x = cardX1 + cardR; x <= cardX2 - cardR; x++) {
    const idx = (y * width + x) * 4;
    png.data[idx] = 220;
    png.data[idx + 1] = 38;
    png.data[idx + 2] = 38;
    png.data[idx + 3] = 255;
  }
}

function drawThickPoint(cx, cy, r, color = [220, 38, 38, 255]) {
  const minX = Math.floor(cx - r);
  const maxX = Math.ceil(cx + r);
  const minY = Math.floor(cy - r);
  const maxY = Math.ceil(cy + r);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= r) {
        const idx = (y * width + x) * 4;
        const aa = Math.max(0, Math.min(1, r - dist + 0.5));
        const srcA = (color[3] * aa) / 255;
        const dstA = png.data[idx + 3] / 255;
        const outA = srcA + dstA * (1 - srcA);
        if (outA > 0) {
          png.data[idx] = Math.round((color[0] * srcA + png.data[idx] * dstA * (1 - srcA)) / outA);
          png.data[idx + 1] = Math.round((color[1] * srcA + png.data[idx + 1] * dstA * (1 - srcA)) / outA);
          png.data[idx + 2] = Math.round((color[2] * srcA + png.data[idx + 2] * dstA * (1 - srcA)) / outA);
          png.data[idx + 3] = Math.round(outA * 255);
        }
      }
    }
  }
}

// Draw Large Hand-drawn Marker Smiley on Left side
// Center: (220, 315), Radius: 120
const iconCenterX = 220;
const iconCenterY = 315;
const iconR = 110;

// 1. Circle outline
const steps = 600;
for (let i = 0; i <= steps; i++) {
  const theta = (i / steps) * Math.PI * 2.05 - 0.25;
  const wobble = Math.sin(theta * 2) * 3.5 + Math.cos(theta * 3) * 2.5;
  const r = iconR + wobble;
  const x = iconCenterX + r * Math.cos(theta);
  const y = iconCenterY + r * Math.sin(theta);
  drawThickPoint(x, y, 7.5);
}

// 2. Eyes
// Left eye ~ (180, 285)
for (let dy = -11; dy <= 11; dy++) {
  for (let dx = -7; dx <= 7; dx++) {
    if ((dx / 7) ** 2 + (dy / 11) ** 2 <= 1) {
      drawThickPoint(180 + dx, 285 + dy, 3);
    }
  }
}
// Right eye ~ (260, 285)
for (let dy = -11; dy <= 11; dy++) {
  for (let dx = -7; dx <= 7; dx++) {
    if ((dx / 7) ** 2 + (dy / 11) ** 2 <= 1) {
      drawThickPoint(260 + dx, 285 + dy, 3);
    }
  }
}

// 3. Smile curve
const smileSteps = 300;
for (let i = 0; i <= smileSteps; i++) {
  const t = i / smileSteps;
  const x = (1 - t) * (1 - t) * 175 + 2 * (1 - t) * t * 220 + t * t * 265;
  const y = (1 - t) * (1 - t) * 345 + 2 * (1 - t) * t * 390 + t * t * 345;
  drawThickPoint(x, y, 7);
}

// Draw crisp decorative typography lines / block on right side
// "AskProf." badge & banner
const white = [244, 244, 246, 255];
const muted = [161, 161, 170, 255];
const redColor = [220, 38, 38, 255];

// Helper to draw horizontal bars / letter blocks
function fillRect(rx1, ry1, rx2, ry2, color) {
  for (let y = ry1; y <= ry2; y++) {
    for (let x = rx1; x <= rx2; x++) {
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      const idx = (y * width + x) * 4;
      png.data[idx] = color[0];
      png.data[idx + 1] = color[1];
      png.data[idx + 2] = color[2];
      png.data[idx + 3] = color[3];
    }
  }
}

// Draw Title: "Ask Prof." using clean bold glyph geometry
// Let's render "ASK PROF." cleanly
function drawCharA(x, y, h = 60, w = 45, col = white) {
  // Left leg
  for (let i = 0; i <= h; i++) {
    const px = x + (i / h) * (w / 2);
    const py = y + h - i;
    drawThickPoint(px, py, 4.5, col);
  }
  // Right leg
  for (let i = 0; i <= h; i++) {
    const px = x + w / 2 + (i / h) * (w / 2);
    const py = y + i;
    drawThickPoint(px, py, 4.5, col);
  }
  // Crossbar
  fillRect(x + 12, y + 36, x + w - 12, y + 43, col);
}

function drawCharS(x, y, h = 60, w = 40, col = white) {
  // Top curve
  for (let deg = 0; deg <= 180; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const px = x + w / 2 + (w / 2 - 4) * Math.cos(rad);
    const py = y + 16 - 13 * Math.sin(rad);
    drawThickPoint(px, py, 4.5, col);
  }
  // Middle diag
  for (let i = 0; i <= 20; i++) {
    const px = x + w - 6 - (i / 20) * (w - 12);
    const py = y + 16 + (i / 20) * 26;
    drawThickPoint(px, py, 4.5, col);
  }
  // Bottom curve
  for (let deg = 0; deg <= 180; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const px = x + w / 2 - (w / 2 - 4) * Math.cos(rad);
    const py = y + h - 16 + 13 * Math.sin(rad);
    drawThickPoint(px, py, 4.5, col);
  }
}

function drawCharK(x, y, h = 60, w = 40, col = white) {
  fillRect(x, y, x + 8, y + h, col);
  for (let i = 0; i <= 30; i++) {
    const px = x + 8 + (i / 30) * (w - 10);
    const py = y + 30 - (i / 30) * 30;
    drawThickPoint(px, py, 4.5, col);
  }
  for (let i = 0; i <= 32; i++) {
    const px = x + 12 + (i / 32) * (w - 14);
    const py = y + 25 + (i / 32) * 35;
    drawThickPoint(px, py, 4.5, col);
  }
}

function drawCharP(x, y, h = 60, w = 40, col = white) {
  fillRect(x, y, x + 8, y + h, col);
  for (let deg = -90; deg <= 90; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const px = x + 8 + (w - 12) * Math.cos(rad);
    const py = y + 18 + 17 * Math.sin(rad);
    drawThickPoint(px, py, 4.5, col);
  }
}

function drawCharR(x, y, h = 60, w = 40, col = white) {
  drawCharP(x, y, h, w, col);
  for (let i = 0; i <= 30; i++) {
    const px = x + 16 + (i / 30) * (w - 18);
    const py = y + 32 + (i / 30) * 28;
    drawThickPoint(px, py, 4.5, col);
  }
}

function drawCharO(x, y, h = 60, w = 44, col = white) {
  for (let deg = 0; deg <= 360; deg += 3) {
    const rad = (deg * Math.PI) / 180;
    const px = x + w / 2 + (w / 2 - 4) * Math.cos(rad);
    const py = y + h / 2 + (h / 2 - 4) * Math.sin(rad);
    drawThickPoint(px, py, 4.5, col);
  }
}

function drawCharF(x, y, h = 60, w = 38, col = white) {
  fillRect(x, y, x + 8, y + h, col);
  fillRect(x + 8, y, x + w, y + 8, col);
  fillRect(x + 8, y + 24, x + w - 8, y + 32, col);
}

// Render "Ask Prof."
const titleX = 400;
const titleY = 220;
drawCharA(titleX, titleY);
drawCharS(titleX + 55, titleY);
drawCharK(titleX + 105, titleY);

// Space
const profX = titleX + 175;
drawCharP(profX, titleY);
drawCharR(profX + 50, titleY);
drawCharO(profX + 100, titleY);
drawCharF(profX + 155, titleY);

// Red period "."
for (let dy = -6; dy <= 6; dy++) {
  for (let dx = -6; dx <= 6; dx++) {
    if (dx * dx + dy * dy <= 36) {
      drawThickPoint(profX + 205 + dx, titleY + 54 + dy, 1, redColor);
    }
  }
}

// Subtitle bar: "MAHMOUD SAYED MOHAMED • BACKEND DEVELOPER"
// Draw a clean separator line
fillRect(titleX, titleY + 85, 1080, titleY + 87, [40, 40, 48, 255]);

// Tagline indicator pill
fillRect(titleX, titleY + 115, titleX + 220, titleY + 145, [220, 38, 38, 35]);
// Red border around pill
for (let x = titleX; x <= titleX + 220; x++) {
  drawThickPoint(x, titleY + 115, 1, redColor);
  drawThickPoint(x, titleY + 145, 1, redColor);
}
for (let y = titleY + 115; y <= titleY + 145; y++) {
  drawThickPoint(titleX, y, 1, redColor);
  drawThickPoint(titleX + 220, y, 1, redColor);
}

// Subtitle text representations
fillRect(titleX + 16, titleY + 127, titleX + 204, titleY + 133, redColor);
fillRect(titleX + 240, titleY + 127, titleX + 600, titleY + 133, muted);

// Body text indicator lines
fillRect(titleX, titleY + 175, titleX + 650, titleY + 182, muted);
fillRect(titleX, titleY + 195, titleX + 580, titleY + 202, muted);
fillRect(titleX, titleY + 215, titleX + 420, titleY + 222, muted);

const buffer = PNG.sync.write(png);

const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
fs.writeFileSync(outputPath, buffer);

console.log('✅ Successfully generated 1200x630 og-image.png at:', outputPath);
