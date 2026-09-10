const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = path.join(__dirname, '..', 'public', 'dali-mask.png');
const outputPath = path.join(__dirname, '..', 'public', 'dali-mask-transparent.png');

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    const w = this.width;
    const h = this.height;
    const visited = new Uint8Array(w * h);
    const queue = [];

    function isNearWhite(idx) {
      const r = this.data[idx];
      const g = this.data[idx + 1];
      const b = this.data[idx + 2];
      return r > 230 && g > 230 && b > 230;
    }

    // Seed outer border pixels
    for (let x = 0; x < w; x++) {
      queue.push([x, 0]);
      queue.push([x, h - 1]);
    }
    for (let y = 0; y < h; y++) {
      queue.push([0, y]);
      queue.push([w - 1, y]);
    }

    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      const vIdx = y * w + x;
      if (visited[vIdx]) continue;
      visited[vIdx] = 1;

      const pIdx = (y * w + x) * 4;
      if (isNearWhite.call(this, pIdx)) {
        // Transparent
        this.data[pIdx + 3] = 0;

        queue.push([x + 1, y]);
        queue.push([x - 1, y]);
        queue.push([x, y + 1]);
        queue.push([x, y - 1]);
      }
    }

    this.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
      console.log('Successfully generated transparent Dalí mask:', outputPath);
    });
  });
