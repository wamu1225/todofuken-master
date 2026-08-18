/**
 * build-geo.mjs が生成する SVG パス（M x,y L x,y … Z の繰り返し）から、
 * ラベルを置くのに適した点を計算する。
 * 複数の輪（本土＋離島など）を持つ県は、最も面積の大きい輪の重心を使う
 * ＝小さな離島に引かれてラベルが海上に落ちるのを防ぐ。
 */
type Point = [number, number]

function parseRings(d: string): Point[][] {
  return d
    .split('M')
    .slice(1)
    .map((seg) => {
      const body = seg.replace(/Z\s*$/, '')
      return body
        .split('L')
        .filter(Boolean)
        .map((pair) => {
          const [x, y] = pair.split(',').map(Number)
          return [x, y] as Point
        })
    })
    .filter((ring) => ring.length >= 3)
}

/** 多角形の符号付き面積（頂点順が時計回りか反時計回りかで符号が変わる） */
function signedArea(ring: Point[]): number {
  let a = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
  }
  return a / 2
}

/** 多角形の重心（標準公式）。面積が0に近い退化図形では頂点平均で代用する */
function ringCentroid(ring: Point[]): Point {
  const a = signedArea(ring)
  if (Math.abs(a) < 1e-6) {
    const n = ring.length
    const sx = ring.reduce((s, p) => s + p[0], 0) / n
    const sy = ring.reduce((s, p) => s + p[1], 0) / n
    return [sx, sy]
  }
  let cx = 0
  let cy = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
    cx += (ring[j][0] + ring[i][0]) * f
    cy += (ring[j][1] + ring[i][1]) * f
  }
  return [cx / (6 * a), cy / (6 * a)]
}

export function labelPoint(d: string): Point | null {
  const rings = parseRings(d)
  if (!rings.length) return null
  let best = rings[0]
  let bestArea = Math.abs(signedArea(best))
  for (const r of rings.slice(1)) {
    const a = Math.abs(signedArea(r))
    if (a > bestArea) {
      bestArea = a
      best = r
    }
  }
  return ringCentroid(best)
}
