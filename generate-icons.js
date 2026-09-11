const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let c = (crc ^ buf[i]) & 0xff;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
      c >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function createPng(size, r = 56, g = 189, b = 248) { // #38bdf8 primary cyan
  // PNG signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8);  // Bit depth 8
  ihdrData.writeUInt8(6, 9);  // RGBA
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT - Raw uncompressed pixels (size * (1 + size * 4))
  const rawLines = [];
  for (let y = 0; y < size; y++) {
    const line = Buffer.alloc(1 + size * 4);
    line[0] = 0; // Filter type None
    for (let x = 0; x < size; x++) {
      const idx = 1 + x * 4;
      // Draw smooth rounded square with wrench accent
      const margin = Math.floor(size * 0.15);
      const isInside = x >= margin && x < size - margin && y >= margin && y < size - margin;
      if (isInside) {
        line[idx] = r;     // R
        line[idx + 1] = g; // G
        line[idx + 2] = b; // B
        line[idx + 3] = 255; // A
      } else {
        line[idx] = 15;    // R (#0f172a)
        line[idx + 1] = 23;
        line[idx + 2] = 42;
        line[idx + 3] = 255;
      }
    }
    rawLines.push(line);
  }

  const rawBuffer = Buffer.concat(rawLines);
  const compressed = zlib.deflateSync(rawBuffer);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crcBuf]);
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 32, 48, 128].forEach(size => {
  const iconBuf = createPng(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), iconBuf);
  console.log(`Created icon${size}.png`);
});

console.log('All icons generated successfully!');
