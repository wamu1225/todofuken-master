// scripts/validate-data.js — データ整合性チェック（predeploy で必ず実行）
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

function extractArrayLiteral(src, marker) {
  const start = src.indexOf(marker);
  if (start < 0) throw new Error(`marker not found: ${marker}`);
  // marker の後、型注釈（例 Prefecture[]）の [] を飛ばして「= [」の実データ配列を見つける
  const eqIdx = src.indexOf('=', start);
  const openIdx = src.indexOf('[', eqIdx);
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) return src.slice(openIdx, i + 1);
    }
  }
  throw new Error(`unterminated array: ${marker}`);
}

const errors = [];

// ── prefectures.ts ──
const prefSrc = readFileSync(join(ROOT, 'src/data/prefectures.ts'), 'utf8');
const prefArrLit = extractArrayLiteral(prefSrc, 'export const PREFECTURES');
// eslint-disable-next-line no-new-func
const PREFECTURES = new Function(`return ${prefArrLit}`)();

if (PREFECTURES.length !== 47) errors.push(`都道府県数が47ではありません: ${PREFECTURES.length}`);
const codes = new Set();
const REGIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州'];
for (const p of PREFECTURES) {
  if (codes.has(p.code)) errors.push(`code重複: ${p.code}`);
  codes.add(p.code);
  for (const key of ['name', 'kana', 'slug', 'capital', 'capitalKana', 'region']) {
    if (!p[key]) errors.push(`${p.name ?? p.code}: ${key} が空です`);
  }
  if (!REGIONS.includes(p.region)) errors.push(`${p.name}: 不正な region "${p.region}"`);
  if (typeof p.areaKm2 !== 'number' || p.areaKm2 <= 0) errors.push(`${p.name}: areaKm2 が不正 (${p.areaKm2})`);
}
for (let c = 1; c <= 47; c++) if (!codes.has(c)) errors.push(`code ${c} が欠落しています`);

// ── geo.ts（PREF_SHAPES）──
const geoSrc = readFileSync(join(ROOT, 'src/data/geo.ts'), 'utf8');
const geoArrLit = extractArrayLiteral(geoSrc, 'export const PREF_SHAPES');
// eslint-disable-next-line no-new-func
const PREF_SHAPES = new Function(`return ${geoArrLit}`)();

if (PREF_SHAPES.length !== 47) errors.push(`PREF_SHAPES数が47ではありません: ${PREF_SHAPES.length}`);
const shapeCodes = new Set(PREF_SHAPES.map((s) => s.code));
for (const p of PREFECTURES) {
  if (!shapeCodes.has(p.code)) errors.push(`${p.name}(code=${p.code}) の地図形状がgeo.tsにありません`);
}
for (const s of PREF_SHAPES) {
  if (!s.mainland && !s.nansei) errors.push(`code ${s.code}(${s.name}) に本土・南西諸島どちらの図形もありません`);
}

if (errors.length) {
  console.error('❌ データ検証エラー:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✓ validate-data: 都道府県47件・地図形状47件、整合性OK`);
