// scripts/prerender.ts — SSG。トップ（ゲーム）・about・privacy の静的フォールバックHTML・
// per-page meta・JSON-LD を焼き込み、sitemap.xml を生成する。
// 実行: npx tsx scripts/prerender.ts（npm run predeploy 内）
import * as fs from 'fs';
import * as path from 'path';
import { PREFECTURES } from '../src/data/prefectures';
import { ABOUT_CONTENT, PRIVACY_CONTENT, SITE_NAME } from '../src/data/static-pages';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const BASE = '/todofuken-master';
const BASE_URL = 'https://study-apps.com/todofuken-master';

console.log('--- todofuken-master SSG Pre-rendering ---');
if (!fs.existsSync(INDEX_HTML_PATH)) {
  console.error('Error: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

const templateHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
// base './' のため、サブディレクトリ用に相対パスを ../ に変換
const subTemplateHtml = templateHtml
  .replace(/href="\.\/assets\//g, 'href="../assets/')
  .replace(/src="\.\/assets\//g, 'src="../assets/')
  .replace(/href="\.\/favicon\.svg"/g, 'href="../favicon.svg"');

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function mdToHtml(content: string): string {
  return content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => (b.startsWith('## ') ? `<h2>${esc(b.slice(3))}</h2>` : `<p>${esc(b)}</p>`))
    .join('\n');
}

function applyMeta(html: string, title: string, description: string, urlPath: string): string {
  const fullTitle = urlPath === '/' ? '都道府県マスター｜日本地図を触って47都道府県を覚える' : `${title}｜${SITE_NAME}`;
  const url = `${BASE_URL}${urlPath}`;
  return html
    .replace(/<title>.*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(fullTitle)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(description)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${esc(fullTitle)}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
}

function writePage(subpath: string, html: string) {
  const dir = subpath === '' ? DIST_DIR : path.join(DIST_DIR, subpath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const disclaimer =
  '<p style="font-size:0.8rem;color:#4a6672;margin-top:24px;border-top:1px solid #b9ccd4;padding-top:12px">※本サイトは個人運営の学習支援サイトです。地図データはNatural Earth（パブリックドメイン）、都道府県データは総務省・国土地理院の公開情報にもとづきます。</p>';
const footerNav = `<nav style="margin-top:20px;display:flex;gap:16px;flex-wrap:wrap"><a href="${BASE}/about/" style="color:#4a6672">サイトについて</a><a href="${BASE}/privacy/" style="color:#4a6672">プライバシーポリシー</a></nav>`;

// ── トップ（ゲーム）：JS必須の静的フォールバック。47都道府県一覧をテキストで持たせる ──
const prefListHtml = PREFECTURES.map(
  (p) => `<li>${esc(p.name)}（${esc(p.kana)}）── 県庁所在地：${esc(p.capital)}・${esc(p.region)}地方</li>`,
).join('\n');
const homeDesc =
  '日本地図を触りながら47都道府県の位置と形を覚える学習サイトです。名前が見える「さんぽ」、名前を頼りに探す「かくれんぼ」、輪郭だけで当てる「かたち」の3つの遊び方があります。';
const homeFallback = `<article id="static-fallback" style="font-family:sans-serif;line-height:1.8;max-width:820px;margin:0 auto;padding:24px 16px;color:#16323c">
  <h1 style="font-size:1.7rem;border-bottom:2px solid #e8a33d;padding-bottom:8px;margin-bottom:14px">${SITE_NAME}</h1>
  <p style="color:#4a6672">${homeDesc}</p>
  <h2 style="font-size:1.15rem;margin:22px 0 8px">47都道府県</h2>
  <ul style="columns:2;column-gap:24px;padding-left:18px">${prefListHtml}</ul>
  ${footerNav}
  ${disclaimer}
</article>`;
let rootHtml = applyMeta(templateHtml, '', homeDesc, '/');
rootHtml = rootHtml.replace('<div id="root"></div>', `<div id="root">${homeFallback}</div>`);
const homeJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: `${BASE_URL}/`,
  description: homeDesc,
  inLanguage: 'ja',
});
rootHtml = rootHtml.replace('</head>', `<script type="application/ld+json">${homeJsonLd}</script>\n  </head>`);
writePage('', rootHtml);
console.log('✓ トップページ');

// ── about / privacy ──
for (const [slug, title, desc, content] of [
  ['about', 'サイトについて', `${SITE_NAME}について。データの出典と編集方針を説明します。`, ABOUT_CONTENT],
  ['privacy', 'プライバシーポリシー', `${SITE_NAME}のプライバシーポリシー。`, PRIVACY_CONTENT],
] as const) {
  const fallback = `<article id="static-fallback" style="font-family:sans-serif;line-height:1.85;max-width:720px;margin:0 auto;padding:24px 16px;color:#16323c">
    <h1 style="font-size:1.5rem;border-bottom:2px solid #e8a33d;padding-bottom:8px;margin-bottom:14px">${esc(title)}</h1>
    ${mdToHtml(content)}
    ${footerNav}
  </article>`;
  let html = applyMeta(subTemplateHtml, title, desc, `/${slug}/`);
  html = html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: desc,
    url: `${BASE_URL}/${slug}/`,
    inLanguage: 'ja',
  });
  html = html.replace('</head>', `<script type="application/ld+json">${jsonLd}</script>\n  </head>`);
  writePage(slug, html);
}
console.log('✓ /about/ /privacy/');

// ── sitemap.xml ──
const today = new Date().toISOString().split('T')[0];
const urls = [
  { loc: `${BASE_URL}/`, priority: '1.0' },
  { loc: `${BASE_URL}/about/`, priority: '0.3' },
  { loc: `${BASE_URL}/privacy/`, priority: '0.2' },
];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml);
console.log(`✓ sitemap.xml（全${urls.length}URL）`);

console.log('--- Done ---');
