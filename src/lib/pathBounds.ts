/**
 * build-geo.mjs が生成する SVG パス（M/L/Z のみ・曲線なし）から
 * 座標の範囲（bbox）を読み取る。かたちモードで1県だけを切り出して
 * 中央に大きく表示するために使う。
 */
export type Bounds = { minX: number; maxX: number; minY: number; maxY: number }

export function pathBounds(d: string): Bounds {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = nums[i]
    const y = nums[i + 1]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return { minX, maxX, minY, maxY }
}

/** bbox を正方形の viewBox（余白つき）に変換する */
export function squareViewBox(b: Bounds, pad = 0.12): string {
  const w = b.maxX - b.minX
  const h = b.maxY - b.minY
  const size = Math.max(w, h) * (1 + pad * 2)
  const cx = (b.minX + b.maxX) / 2
  const cy = (b.minY + b.maxY) / 2
  return `${cx - size / 2} ${cy - size / 2} ${size} ${size}`
}

/**
 * bbox を縦横比を保ったまま余白つきの viewBox に変換する（地方ズーム用）。
 * squareViewBox と違って正方形に矯正しない＝地図の形を歪めない。
 */
export function paddedViewBox(b: Bounds, pad = 0.2): string {
  const w = b.maxX - b.minX
  const h = b.maxY - b.minY
  const px = w * pad
  const py = h * pad
  return `${b.minX - px} ${b.minY - py} ${w + px * 2} ${h + py * 2}`
}
