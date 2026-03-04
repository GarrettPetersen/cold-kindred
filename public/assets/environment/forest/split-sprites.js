/**
 * Split forest_sprite_sheet.png into individual sprites.
 * Top 2 rows: trees (32×48 each, 5 per row).
 * Rest: small sprites (16×16 each, 10 per row).
 * Names from list.txt in order.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SHEET_PATH = path.join(__dirname, 'forest_sprite_sheet.png');
const LIST_PATH = path.join(__dirname, 'list.txt');
const OUT_DIR = path.join(__dirname, 'sprites');

const TREE_WIDTH = 32;
const TREE_HEIGHT = 48;
const SMALL_SIZE = 16;
const TREE_COLS = 5;
const TREE_ROWS = 2;
const SMALL_PER_ROW = 10;

function parseListTxt(content) {
  const names = [];
  const lines = content.split(/\r?\n/);
  const sectionHeaders = new Set(['TREES', 'LEAVES', 'NUTS', 'BUSHES', 'FLOWERS', 'MUSHROOMS', 'ROCKS', 'CRYSTALS', 'BUGS', 'BUTTERFLIES']);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || sectionHeaders.has(trimmed)) continue;
    // "1. Apple Tree" or "4.Persian Shield"
    const match = trimmed.match(/^\d+\.\s*(.+)$/) || trimmed.match(/^\d+\.(.+)$/);
    if (match) {
      const name = match[1].trim();
      names.push(name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || `sprite_${names.length}`);
    }
  }
  return names;
}

async function main() {
  const listContent = fs.readFileSync(LIST_PATH, 'utf8');
  const names = parseListTxt(listContent);
  if (names.length === 0) throw new Error('No names parsed from list.txt');
  console.log('Parsed', names.length, 'sprite names');

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let index = 0;
  const extract = async (left, top, w, h, name) => {
    const outPath = path.join(OUT_DIR, `${name}.png`);
    await sharp(SHEET_PATH)
      .extract({ left, top, width: w, height: h })
      .png()
      .toFile(outPath);
    index++;
  };

  // Tree rows: 5 per row, 2 rows, each 32×48
  for (let row = 0; row < TREE_ROWS && index < names.length; row++) {
    for (let col = 0; col < TREE_COLS && index < names.length; col++) {
      await extract(col * TREE_WIDTH, row * TREE_HEIGHT, TREE_WIDTH, TREE_HEIGHT, names[index]);
    }
  }

  // Small sprite rows: 10 per row, each 16×16
  const smallStartY = TREE_ROWS * TREE_HEIGHT;
  const smallRows = Math.floor((names.length - TREE_ROWS * TREE_COLS) / SMALL_PER_ROW) + 1;
  for (let row = 0; row < smallRows && index < names.length; row++) {
    for (let col = 0; col < SMALL_PER_ROW && index < names.length; col++) {
      await extract(col * SMALL_SIZE, smallStartY + row * SMALL_SIZE, SMALL_SIZE, SMALL_SIZE, names[index]);
    }
  }

  console.log('Wrote', index, 'sprites to', OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
