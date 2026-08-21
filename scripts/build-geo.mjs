/**
 * src/data/geo.ts を生成する。
 *
 * 元データ：Natural Earth 1:10m Admin 1 – States, Provinces（パブリックドメイン）
 *   https://www.naturalearthdata.com/downloads/10m-cultural-vectors/
 *   配布ミラー：https://github.com/nvkelso/natural-earth-vector
 *   利用条件：パブリックドメイン。帰属表示は不要（任意）。正確性は無保証。
 *
 * 手順
 *   1. admin_1 の GeoJSON から iso_a2 が JP のフィーチャ（47件）を取り出す
 *   2. ランベルト正角円錐図法（標準緯線 33°N / 43°N・中央経線 137°E）で投影する
 *   3. 本州から九州までの本土図と、南西諸島の枠（インセット）に振り分ける
 *   4. 画面解像度より細かい頂点を間引き、SVG のパス文字列にして書き出す
 *
 * 実行：node scripts/build-geo.mjs
 * 元 GeoJSON（約 40MB）はリポジトリに置かず、無ければその場で取得する。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const CACHE = path.join(ROOT, 'node_modules', '.cache', 'ne10_admin1.geojson');
const SRC_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson';
const OUT = path.join(ROOT, 'src', 'data', 'geo.ts');

// ---- 1. 元データ ---------------------------------------------------------

async function loadSource() {
  if (!fs.existsSync(CACHE)) {
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    process.stdout.write(`元データを取得します: ${SRC_URL}\n`);
    const res = await fetch(SRC_URL);
    if (!res.ok) throw new Error(`取得に失敗しました: HTTP ${res.status}`);
    fs.writeFileSync(CACHE, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
}

// ---- 2. 投影 -------------------------------------------------------------

const RAD = Math.PI / 180;
const PHI1 = 33 * RAD; // 標準緯線（南）
const PHI2 = 43 * RAD; // 標準緯線（北）
const LON0 = 137 * RAD; // 中央経線
const PHI0 = 36 * RAD; // 原点緯度

const t = (phi) => Math.tan(Math.PI / 4 + phi / 2);
const N = Math.log(Math.cos(PHI1) / Math.cos(PHI2)) / Math.log(t(PHI2) / t(PHI1));
const F = (Math.cos(PHI1) * Math.pow(t(PHI1), N)) / N;
const RHO0 = F / Math.pow(t(PHI0), N);

/** 経緯度 → 投影座標。y は南が大きくなる（画面座標に合わせる） */
function project(lon, lat) {
  const rho = F / Math.pow(t(lat * RAD), N);
  const theta = N * (lon * RAD - LON0);
  return [rho * Math.sin(theta), -(RHO0 - rho * Math.cos(theta))];
}

// ---- 3. リングの仕分けと間引き -------------------------------------------

/** 多角形の符号なし面積（投影座標） */
function ringArea(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(a / 2);
}

/** Douglas–Peucker。eps は出力座標系の単位＝おおむね画面 px */
function simplify(ring, eps) {
  if (ring.length < 5) return ring;
  const keep = new Uint8Array(ring.length);
  keep[0] = keep[ring.length - 1] = 1;
  const stack = [[0, ring.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    const [x1, y1] = ring[s];
    const [x2, y2] = ring[e];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1e-12;
    let far = -1;
    let max = eps;
    for (let i = s + 1; i < e; i++) {
      const d = Math.abs(dy * ring[i][0] - dx * ring[i][1] + x2 * y1 - y2 * x1) / len;
      if (d > max) {
        max = d;
        far = i;
      }
    }
    if (far > 0) {
      keep[far] = 1;
      stack.push([s, far], [far, e]);
    }
  }
  const out = ring.filter((_, i) => keep[i]);
  return out.length >= 4 ? out : ring;
}

const toPath = (rings) =>
  rings
    .map(
      (r) =>
        'M' +
        r
          .map(([x, y]) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`)
          .join('L') +
        'Z',
    )
    .join('');

// ---- 4. 本体 -------------------------------------------------------------

/** 本土図に載せる範囲。南西諸島（奄美・沖縄）と小笠原はここから外れる。
 *  東の上限は択捉島の東端（東経 148.86 度）を含める値にしている。
 *  旧値は 147 で、北方領土を足しても択捉島の東半分が切り落とされていた。 */
const MAINLAND = (lon, lat) => lat >= 30 && lon <= 149.2;
/** 南西諸島の枠に載せる範囲。小笠原・南鳥島（東経132度以東）は含めない */
const NANSEI = (lon, lat) => lat < 30 && lon < 132;

/**
 * 北方領土（択捉島・国後島・色丹島・歯舞群島）のリングを取り出す。
 *
 * なぜ必要か：Natural Earth は北方領土をロシア（サハリン州 RU-SAK）に含めているため、
 * `iso_a2 === 'JP'` で絞ると4島がまるごと地図から消える。日本の学習指導要領は
 * 北方領土を日本固有の領土として扱い、国土地理院の地図も日本領として描いているので、
 * 日本の小学生向けの地図としては欠かせない。**帰属の判断は日本の一次情報に合わせる**。
 *   国土地理院 地図記号・地形図 https://www.gsi.go.jp/
 *   内閣府 北方領土問題対策協会（4島の範囲） https://www.hoppou.go.jp/
 *
 * 切り出しの根拠：北方領土は択捉島までで、その北東の得撫（うるっぷ）島から先は含まない。
 * 択捉島の北東端は 45.53°N / 148.86°E、得撫島の南西端は 45.58°N / 149.44°E なので、
 * 「緯度 45.75 未満かつ経度 149.3 未満」で両者はきれいに分かれる（実測で確認）。
 */
const NORTHERN_TERRITORIES = (rings) =>
  rings.filter((ring) => {
    let maxLat = -Infinity, maxLon = -Infinity, minLat = Infinity;
    for (const [lon, lat] of ring) {
      if (lat > maxLat) maxLat = lat;
      if (lat < minLat) minLat = lat;
      if (lon > maxLon) maxLon = lon;
    }
    return maxLat < 45.75 && maxLon < 149.3 && minLat > 42.9;
  });

const main = async () => {
  const gj = await loadSource();
  const feats = gj.features.filter((f) => f.properties.iso_a2 === 'JP');
  if (feats.length !== 47) throw new Error(`都道府県が47件ではありません: ${feats.length}件`);

  // 北方領土を北海道（JP-01）のリングに足す。Natural Earth 側の帰属をそのまま使わない。
  const sakhalin = gj.features.find((f) => f.properties.iso_3166_2 === 'RU-SAK');
  if (!sakhalin) throw new Error('サハリン州のフィーチャが見つかりません（北方領土を取り出せない）');
  const sakGeom = sakhalin.geometry;
  const sakRings = (sakGeom.type === 'Polygon' ? [sakGeom.coordinates] : sakGeom.coordinates).map(
    (p) => p[0],
  );
  const ntRings = NORTHERN_TERRITORIES(sakRings);
  if (ntRings.length < 4)
    throw new Error(`北方領土のリングが少なすぎます: ${ntRings.length}件（4島ぶん以上を期待）`);
  const hokkaido = feats.find((f) => f.properties.iso_3166_2 === 'JP-01');
  if (!hokkaido) throw new Error('北海道のフィーチャが見つかりません');
  if (hokkaido.geometry.type === 'Polygon')
    hokkaido.geometry = { type: 'MultiPolygon', coordinates: [hokkaido.geometry.coordinates] };
  for (const ring of ntRings) hokkaido.geometry.coordinates.push([ring]);
  console.log(`北方領土として北海道に足したリング: ${ntRings.length}件`);

  const groups = { mainland: [], nansei: [], dropped: [] };

  const prefs = feats
    .map((f) => {
      const code = Number(f.properties.iso_3166_2.slice(3)); // JP-01 → 1
      const geom = f.geometry;
      const rings =
        geom.type === 'Polygon' ? [geom.coordinates[0]] : geom.coordinates.map((p) => p[0]);

      const sorted = { mainland: [], nansei: [] };
      for (const ring of rings) {
        const lon = ring.reduce((s, p) => s + p[0], 0) / ring.length;
        const lat = ring.reduce((s, p) => s + p[1], 0) / ring.length;
        const projected = ring.map(([x, y]) => project(x, y));
        if (MAINLAND(lon, lat)) sorted.mainland.push(projected);
        else if (NANSEI(lon, lat)) sorted.nansei.push(projected);
        else groups.dropped.push({ code, lon, lat });
      }
      return { code, name: f.properties.name_ja, ...sorted };
    })
    .sort((a, b) => a.code - b.code);

  // 2つの枠それぞれで、投影座標を 0..1 に正規化するための範囲を測る
  const bounds = (key) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of prefs)
      for (const r of p[key])
        for (const [x, y] of r) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
    return { minX, minY, maxX, maxY };
  };

  // 本土図：幅 1000 に合わせる。南西諸島：本土と同じ縮尺では小さすぎるので枠内で拡大する
  const layout = {
    mainland: { ...bounds('mainland'), width: 1000, ox: 0, oy: 0 },
    nansei: { ...bounds('nansei'), width: 300, ox: 0, oy: 0 },
  };
  for (const key of ['mainland', 'nansei']) {
    const b = layout[key];
    b.scale = b.width / (b.maxX - b.minX);
    b.height = Math.round((b.maxY - b.minY) * b.scale);
  }

  const emit = (rings, key, eps, minArea) => {
    const b = layout[key];
    const out = [];
    for (const ring of rings) {
      const scaled = ring.map(([x, y]) => [(x - b.minX) * b.scale + b.ox, (y - b.minY) * b.scale + b.oy]);
      if (ringArea(scaled) < minArea) {
        groups.dropped.push({ tiny: true, key, area: ringArea(scaled) });
        continue;
      }
      out.push(simplify(scaled, eps));
      groups[key].push(scaled.length);
    }
    return out;
  };

  /**
   * 「かたち」モード用に、県を単独で 0..100 の枠に正規化したパスを作る。
   *
   * なぜ別に持つか：本土図（mainland）と南西諸島の枠（nansei）は**別の座標系**で、
   * しかも nansei は枠内で拡大している。この2つを文字列連結すると、両方を持つ
   * 鹿児島県だけが「x が 0〜1000 に広がった bbox の中で本土が潰れて点になる」。
   * 実際に本番でそうなっていた（2026-08-19 ユーザー指摘）。
   * 県の形を単体で見せる用途では、県ごとに同一座標系で投影し直すのが正しい。
   * 全県を同じ扱いにする（鹿児島だけ特別扱いにしない）。
   */
  const shapeOf = (p) => {
    const rings = [...p.mainland, ...p.nansei]; // 投影済み・振り分け前の同一座標系
    if (!rings.length) return '';
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const r of rings)
      for (const [x, y] of r) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    const scale = 100 / Math.max(maxX - minX, maxY - minY);
    const ox = (100 - (maxX - minX) * scale) / 2;
    const oy = (100 - (maxY - minY) * scale) / 2;
    const out = [];
    for (const r of rings) {
      const scaled = r.map(([x, y]) => [(x - minX) * scale + ox, (y - minY) * scale + oy]);
      if (ringArea(scaled) < 0.02) continue; // 100×100 の枠で見えない粒だけ落とす
      out.push(simplify(scaled, 0.08));
    }
    return toPath(out);
  };

  const records = prefs.map((p) => ({
    code: p.code,
    name: p.name,
    mainland: toPath(emit(p.mainland, 'mainland', 0.35, 1.2)),
    nansei: toPath(emit(p.nansei, 'nansei', 0.35, 1.2)),
    shape: shapeOf(p),
  }));

  const totalPts = (s) => (s.match(/,/g) || []).length;
  const kept = records.reduce((n, r) => n + totalPts(r.mainland) + totalPts(r.nansei), 0);

  const body = `// このファイルは scripts/build-geo.mjs が生成します。手で編集しないこと。
// 元データ：Natural Earth 1:10m Admin 1 – States, Provinces（パブリックドメイン）
// 投影：ランベルト正角円錐図法（標準緯線 33°N / 43°N・中央経線 137°E）。方位は北が上。
// 生成日：${new Date().toISOString().slice(0, 10)}

/** 地図の枠。mainland＝本州から九州までの本土図、nansei＝南西諸島の枠 */
export const MAP_FRAME = {
  mainland: { width: ${layout.mainland.width}, height: ${layout.mainland.height} },
  nansei: { width: ${layout.nansei.width}, height: ${layout.nansei.height} },
} as const;

export type PrefShape = {
  /** 全国地方公共団体コードの上2桁（北海道=1 … 沖縄=47） */
  code: number;
  name: string;
  /** 本土図の SVG パス。南西諸島だけの県は空文字 */
  mainland: string;
  /** 南西諸島の枠の SVG パス。該当がなければ空文字 */
  nansei: string;
  /** 「かたち」モード用。県を単独で 0..100 の枠に正規化したパス（本土図とは別の座標系） */
  shape: string;
};

export const PREF_SHAPES: PrefShape[] = ${JSON.stringify(records, null, 0).replace(/\},\{/g, '},\n  {').replace(/^\[/, '[\n  ').replace(/\]$/, ',\n]')};
`;

  fs.writeFileSync(OUT, body, 'utf8');

  const nansei = records.filter((r) => r.nansei).map((r) => `${r.code}:${r.name}`);
  console.log(`都道府県 ${records.length}件 / 頂点 ${kept}点 / ${(body.length / 1024).toFixed(0)}KB`);
  console.log(`本土図 ${layout.mainland.width}×${layout.mainland.height} / 南西諸島 ${layout.nansei.width}×${layout.nansei.height}`);
  console.log(`南西諸島の枠に載る県: ${nansei.join(', ')}`);
  console.log(`枠外に置いたリング: ${groups.dropped.filter((d) => !d.tiny).length}件（小笠原諸島・南鳥島など）`);
  console.log(`画面上で点になるため落としたリング: ${groups.dropped.filter((d) => d.tiny).length}件`);
  // 2026-08-22 調査（O-2-22 完了条件(2)）：竹島・尖閣諸島・小笠原諸島・南鳥島・沖ノ鳥島の扱いを
  // 個別に確認し、about ページに理由つきで明記した。3つの異なる原因があった：
  //   竹島・沖ノ鳥島＝Natural Earth の元データに形状そのものが収録されていない（47都道府県の
  //     どのフィーチャにも含まれない。全フィーチャを走査して確認済み）。
  //   尖閣諸島＝沖縄県（JP-47）のフィーチャに8リングとして収録されているが、南西諸島の枠の縮尺
  //     では最大でも面積0.43px²しかなく、tiny 判定（minArea=1.2）で全て脱落する。
  //   小笠原諸島・南鳥島＝東京都（JP-13）のフィーチャに収録されているが、MAINLAND
  //     （lat>=30）・NANSEI（lat<30 && lon<132）のどちらの範囲条件にも当てはまらず
  //     「枠外に置いたリング」に入る（南鳥島は上のログで lon≈154 として実際に出ている）。
  // いずれも「小さすぎる」「枠に収まらない」という作図上の制約で、帰属の判断ではない。
};

main();
