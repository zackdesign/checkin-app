#!/usr/bin/env node
/**
 * Generate placeholder PWA icons (192x192 and 512x512 PNGs).
 *
 * Produces valid PNG files using only built-in Node.js APIs.
 * Each icon is a dark background (#18181b) with a white checkmark
 * inside a green circle.
 *
 * Usage: node scripts/generate-icons.js
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// -- PNG helpers --------------------------------------------------------------

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function buildPNG(width, height, pixelRows) {
  const raw = Buffer.concat(pixelRows);
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // colour type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = pngChunk("IHDR", ihdrData);

  const idat = pngChunk("IDAT", compressed);
  const iend = pngChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// -- Drawing helpers ----------------------------------------------------------

function drawIcon(size) {
  const bg = [0x18, 0x18, 0x1b, 0xff];       // #18181b
  const fg = [0xff, 0xff, 0xff, 0xff];       // white
  const accent = [0x22, 0xc5, 0x5e, 0xff];   // green #22c55e

  const pixels = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    pixels[i * 4]     = bg[0];
    pixels[i * 4 + 1] = bg[1];
    pixels[i * 4 + 2] = bg[2];
    pixels[i * 4 + 3] = bg[3];
  }

  function setPixel(x, y, color) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    pixels[idx]     = color[0];
    pixels[idx + 1] = color[1];
    pixels[idx + 2] = color[2];
    pixels[idx + 3] = color[3];
  }

  // Draw filled circle
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(x, y, accent);
      }
    }
  }

  // Draw checkmark (two line segments)
  const s = size;
  const p1 = { x: 0.28 * s, y: 0.50 * s };
  const p2 = { x: 0.43 * s, y: 0.65 * s };
  const p3 = { x: 0.72 * s, y: 0.35 * s };
  const thickness = Math.max(Math.round(s * 0.07), 2);

  function drawLine(ax, ay, bx, by, thick, color) {
    const dist = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
    const steps = Math.ceil(dist * 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = ax + (bx - ax) * t;
      const py = ay + (by - ay) * t;
      for (let dy = -thick; dy <= thick; dy++) {
        for (let dx = -thick; dx <= thick; dx++) {
          if (dx * dx + dy * dy <= thick * thick) {
            setPixel(Math.round(px + dx), Math.round(py + dy), color);
          }
        }
      }
    }
  }

  drawLine(p1.x, p1.y, p2.x, p2.y, thickness, fg);
  drawLine(p2.x, p2.y, p3.x, p3.y, thickness, fg);

  // Build PNG rows
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // no filter
    const slice = pixels.slice(y * size * 4, (y + 1) * size * 4);
    for (let i = 0; i < slice.length; i++) {
      row[1 + i] = slice[i];
    }
    rows.push(row);
  }

  return buildPNG(size, size, rows);
}

// -- Main ---------------------------------------------------------------------

const outDir = path.join(__dirname, "..", "public");
const sizes = [192, 512];

for (const size of sizes) {
  const png = drawIcon(size);
  const outPath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Created ${outPath}  (${png.length} bytes)`);
}

console.log("Done.");
