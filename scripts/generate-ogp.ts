// scripts/generate-ogp.ts — OGP画像（1200×630）を public/ogp.png に生成する。
// 実行: npx tsx scripts/generate-ogp.ts
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { PREF_SHAPES } from '../src/data/geo';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const FONT = "'Yu Gothic','Hiragino Kaku Gothic ProN','Hiragino Sans',Meiryo,'Noto Sans JP',sans-serif";

// 本土図（北海道〜九州）の実座標を右側に大きく配置する。地図そのものが主役の絵にする。
const combined = PREF_SHAPES.map((s) => s.mainland).filter(Boolean).join(' ');
const nums = combined.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (let i = 0; i + 1 < nums.length; i += 2) {
  const x = nums[i], y = nums[i + 1];
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
}
const mapW = maxX - minX;
const mapH = maxY - minY;
const targetH = 560;
const scale = targetH / mapH;
const targetW = mapW * scale;
const offsetX = 1200 - targetW - 60;
const offsetY = (630 - targetH) / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cfe0e8"/>
      <stop offset="1" stop-color="#b9ccd4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="16" height="630" fill="#12333f"/>
  <rect x="16" y="0" width="6" height="630" fill="#e8a33d"/>
  <g transform="translate(${offsetX} ${offsetY}) scale(${scale})" transform-origin="0 0">
    <g transform="translate(${-minX} ${-minY})">
      ${PREF_SHAPES.map((s) => (s.mainland ? `<path d="${s.mainland}" fill="#f4ead6" stroke="#4b6672" stroke-width="${1.1 / scale}"/>` : '')).join('\n      ')}
    </g>
  </g>
  <text x="96" y="220" font-family="${FONT}" font-size="72" font-weight="700" fill="#16323c">都道府県</text>
  <text x="96" y="300" font-family="${FONT}" font-size="72" font-weight="700" fill="#16323c">マスター</text>
  <text x="96" y="358" font-family="${FONT}" font-size="27" fill="#4a6672">日本地図を触って47都道府県を覚える</text>
  <line x1="96" y1="420" x2="560" y2="420" stroke="#e8a33d" stroke-width="2"/>
  <text x="96" y="470" font-family="${FONT}" font-size="24" fill="#12333f" font-weight="600">study-apps.com/todofuken-master/</text>
</svg>`;

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const outPath = path.join(PUBLIC_DIR, 'ogp.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`✓ ogp.png (1200x630) を生成: ${outPath}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
