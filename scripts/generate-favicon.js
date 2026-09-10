const fs = require('fs');
const path = require('path');

const srcPng = path.join(__dirname, '..', 'public', 'dali-mask-transparent.png');
const pngData = fs.readFileSync(srcPng);

// Copy to src/app/icon.png and apple-icon.png (Next.js App Router native icons)
fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'icon.png'), pngData);
fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'apple-icon.png'), pngData);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'dali-mask.png'), pngData);

// Construct a valid standard ICO header wrapping the PNG stream
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type 1 = ICO
icoHeader.writeUInt16LE(1, 4); // count = 1 image

const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(0, 0); // width: 0 = 256px
dirEntry.writeUInt8(0, 1); // height: 0 = 256px
dirEntry.writeUInt8(0, 2); // color count
dirEntry.writeUInt8(0, 3); // reserved
dirEntry.writeUInt16LE(1, 4); // color planes
dirEntry.writeUInt16LE(32, 6); // bpp
dirEntry.writeUInt32LE(pngData.length, 8); // image size
dirEntry.writeUInt32LE(6 + 16, 12); // image offset (header 6 + 1 entry 16 = 22)

const icoBuffer = Buffer.concat([icoHeader, dirEntry, pngData]);

fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'favicon.ico'), icoBuffer);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), icoBuffer);

console.log('Successfully generated favicon.ico, icon.png, and apple-icon.png with the La Casa de Papel Dalí mask!');
