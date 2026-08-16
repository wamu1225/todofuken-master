// 47都道府県の基本データ。
// 名称・よみ・県庁所在地とそのよみ ＝ 総務省「全国地方公共団体コード」
// 面積 ＝ 国土地理院「全国都道府県市区町村別面積調」（令和8年4月1日時点・2026年6月26日公表）
//   小数第三位を四捨五入した公表値。境界が確定していない部分を含む県は provisional を true にしている。
// 地方区分は8地方区分（小学校の教科書で使われる分け方）。

export type Prefecture = {
  /** 全国地方公共団体コードの上2桁。北海道=1 … 沖縄県=47 */
  code: number;
  name: string;
  kana: string;
  /** URL に使うローマ字 */
  slug: string;
  capital: string;
  capitalKana: string;
  region: Region;
  /** 海に面していない県 */
  inland: boolean;
  areaKm2: number;
  /** 面積が参考値（境界未定部を含む）かどうか */
  areaProvisional: boolean;
};

export const REGIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州'] as const;
export type Region = (typeof REGIONS)[number];

export const PREFECTURES: Prefecture[] = [
  {code: 1, name: "北海道", kana: "ほっかいどう", slug: "hokkaido", capital: "札幌市", capitalKana: "さっぽろし", region: "北海道", inland: false, areaKm2: 83422.22, areaProvisional: false},
  {code: 2, name: "青森県", kana: "あおもりけん", slug: "aomori", capital: "青森市", capitalKana: "あおもりし", region: "東北", inland: false, areaKm2: 9645.11, areaProvisional: false},
  {code: 3, name: "岩手県", kana: "いわてけん", slug: "iwate", capital: "盛岡市", capitalKana: "もりおかし", region: "東北", inland: false, areaKm2: 15273.78, areaProvisional: false},
  {code: 4, name: "宮城県", kana: "みやぎけん", slug: "miyagi", capital: "仙台市", capitalKana: "せんだいし", region: "東北", inland: false, areaKm2: 7281.12, areaProvisional: true},
  {code: 5, name: "秋田県", kana: "あきたけん", slug: "akita", capital: "秋田市", capitalKana: "あきたし", region: "東北", inland: false, areaKm2: 11637.69, areaProvisional: false},
  {code: 6, name: "山形県", kana: "やまがたけん", slug: "yamagata", capital: "山形市", capitalKana: "やまがたし", region: "東北", inland: false, areaKm2: 9323, areaProvisional: true},
  {code: 7, name: "福島県", kana: "ふくしまけん", slug: "fukushima", capital: "福島市", capitalKana: "ふくしまし", region: "東北", inland: false, areaKm2: 13782.81, areaProvisional: false},
  {code: 8, name: "茨城県", kana: "いばらきけん", slug: "ibaraki", capital: "水戸市", capitalKana: "みとし", region: "関東", inland: false, areaKm2: 6098.32, areaProvisional: false},
  {code: 9, name: "栃木県", kana: "とちぎけん", slug: "tochigi", capital: "宇都宮市", capitalKana: "うつのみやし", region: "関東", inland: true, areaKm2: 6408.09, areaProvisional: false},
  {code: 10, name: "群馬県", kana: "ぐんまけん", slug: "gunma", capital: "前橋市", capitalKana: "まえばしし", region: "関東", inland: true, areaKm2: 6362.28, areaProvisional: false},
  {code: 11, name: "埼玉県", kana: "さいたまけん", slug: "saitama", capital: "さいたま市", capitalKana: "さいたまし", region: "関東", inland: true, areaKm2: 3797.75, areaProvisional: true},
  {code: 12, name: "千葉県", kana: "ちばけん", slug: "chiba", capital: "千葉市", capitalKana: "ちばし", region: "関東", inland: false, areaKm2: 5156.48, areaProvisional: true},
  {code: 13, name: "東京都", kana: "とうきょうと", slug: "tokyo", capital: "新宿区", capitalKana: "しんじゅくく", region: "関東", inland: false, areaKm2: 2199.94, areaProvisional: true},
  {code: 14, name: "神奈川県", kana: "かながわけん", slug: "kanagawa", capital: "横浜市", capitalKana: "よこはまし", region: "関東", inland: false, areaKm2: 2416.55, areaProvisional: false},
  {code: 15, name: "新潟県", kana: "にいがたけん", slug: "niigata", capital: "新潟市", capitalKana: "にいがたし", region: "中部", inland: false, areaKm2: 12583.8, areaProvisional: true},
  {code: 16, name: "富山県", kana: "とやまけん", slug: "toyama", capital: "富山市", capitalKana: "とやまし", region: "中部", inland: false, areaKm2: 4247.6, areaProvisional: true},
  {code: 17, name: "石川県", kana: "いしかわけん", slug: "ishikawa", capital: "金沢市", capitalKana: "かなざわし", region: "中部", inland: false, areaKm2: 4190.94, areaProvisional: false},
  {code: 18, name: "福井県", kana: "ふくいけん", slug: "fukui", capital: "福井市", capitalKana: "ふくいし", region: "中部", inland: false, areaKm2: 4190.56, areaProvisional: false},
  {code: 19, name: "山梨県", kana: "やまなしけん", slug: "yamanashi", capital: "甲府市", capitalKana: "こうふし", region: "中部", inland: true, areaKm2: 4465.27, areaProvisional: true},
  {code: 20, name: "長野県", kana: "ながのけん", slug: "nagano", capital: "長野市", capitalKana: "ながのし", region: "中部", inland: true, areaKm2: 13561.57, areaProvisional: true},
  {code: 21, name: "岐阜県", kana: "ぎふけん", slug: "gifu", capital: "岐阜市", capitalKana: "ぎふし", region: "中部", inland: true, areaKm2: 10621.29, areaProvisional: true},
  {code: 22, name: "静岡県", kana: "しずおかけん", slug: "shizuoka", capital: "静岡市", capitalKana: "しずおかし", region: "中部", inland: false, areaKm2: 7776.57, areaProvisional: true},
  {code: 23, name: "愛知県", kana: "あいちけん", slug: "aichi", capital: "名古屋市", capitalKana: "なごやし", region: "中部", inland: false, areaKm2: 5173.26, areaProvisional: true},
  {code: 24, name: "三重県", kana: "みえけん", slug: "mie", capital: "津市", capitalKana: "つし", region: "近畿", inland: false, areaKm2: 5774.48, areaProvisional: true},
  {code: 25, name: "滋賀県", kana: "しがけん", slug: "shiga", capital: "大津市", capitalKana: "おおつし", region: "近畿", inland: true, areaKm2: 4017.38, areaProvisional: true},
  {code: 26, name: "京都府", kana: "きょうとふ", slug: "kyoto", capital: "京都市", capitalKana: "きょうとし", region: "近畿", inland: false, areaKm2: 4612.09, areaProvisional: false},
  {code: 27, name: "大阪府", kana: "おおさかふ", slug: "osaka", capital: "大阪市", capitalKana: "おおさかし", region: "近畿", inland: false, areaKm2: 1905.26, areaProvisional: false},
  {code: 28, name: "兵庫県", kana: "ひょうごけん", slug: "hyogo", capital: "神戸市", capitalKana: "こうべし", region: "近畿", inland: false, areaKm2: 8400.82, areaProvisional: false},
  {code: 29, name: "奈良県", kana: "ならけん", slug: "nara", capital: "奈良市", capitalKana: "ならし", region: "近畿", inland: true, areaKm2: 3690.94, areaProvisional: false},
  {code: 30, name: "和歌山県", kana: "わかやまけん", slug: "wakayama", capital: "和歌山市", capitalKana: "わかやまし", region: "近畿", inland: false, areaKm2: 4724.65, areaProvisional: false},
  {code: 31, name: "鳥取県", kana: "とっとりけん", slug: "tottori", capital: "鳥取市", capitalKana: "とっとりし", region: "中国", inland: false, areaKm2: 3507, areaProvisional: false},
  {code: 32, name: "島根県", kana: "しまねけん", slug: "shimane", capital: "松江市", capitalKana: "まつえし", region: "中国", inland: false, areaKm2: 6707.75, areaProvisional: false},
  {code: 33, name: "岡山県", kana: "おかやまけん", slug: "okayama", capital: "岡山市", capitalKana: "おかやまし", region: "中国", inland: false, areaKm2: 7114.44, areaProvisional: true},
  {code: 34, name: "広島県", kana: "ひろしまけん", slug: "hiroshima", capital: "広島市", capitalKana: "ひろしまし", region: "中国", inland: false, areaKm2: 8478.17, areaProvisional: false},
  {code: 35, name: "山口県", kana: "やまぐちけん", slug: "yamaguchi", capital: "山口市", capitalKana: "やまぐちし", region: "中国", inland: false, areaKm2: 6112.89, areaProvisional: false},
  {code: 36, name: "徳島県", kana: "とくしまけん", slug: "tokushima", capital: "徳島市", capitalKana: "とくしまし", region: "四国", inland: false, areaKm2: 4146.96, areaProvisional: false},
  {code: 37, name: "香川県", kana: "かがわけん", slug: "kagawa", capital: "高松市", capitalKana: "たかまつし", region: "四国", inland: false, areaKm2: 1876.83, areaProvisional: true},
  {code: 38, name: "愛媛県", kana: "えひめけん", slug: "ehime", capital: "松山市", capitalKana: "まつやまし", region: "四国", inland: false, areaKm2: 5675.82, areaProvisional: false},
  {code: 39, name: "高知県", kana: "こうちけん", slug: "kochi", capital: "高知市", capitalKana: "こうちし", region: "四国", inland: false, areaKm2: 7102.28, areaProvisional: false},
  {code: 40, name: "福岡県", kana: "ふくおかけん", slug: "fukuoka", capital: "福岡市", capitalKana: "ふくおかし", region: "九州", inland: false, areaKm2: 4987.24, areaProvisional: true},
  {code: 41, name: "佐賀県", kana: "さがけん", slug: "saga", capital: "佐賀市", capitalKana: "さがし", region: "九州", inland: false, areaKm2: 2440.64, areaProvisional: false},
  {code: 42, name: "長崎県", kana: "ながさきけん", slug: "nagasaki", capital: "長崎市", capitalKana: "ながさきし", region: "九州", inland: false, areaKm2: 4131.22, areaProvisional: false},
  {code: 43, name: "熊本県", kana: "くまもとけん", slug: "kumamoto", capital: "熊本市", capitalKana: "くまもとし", region: "九州", inland: false, areaKm2: 7409.13, areaProvisional: true},
  {code: 44, name: "大分県", kana: "おおいたけん", slug: "oita", capital: "大分市", capitalKana: "おおいたし", region: "九州", inland: false, areaKm2: 6340.63, areaProvisional: true},
  {code: 45, name: "宮崎県", kana: "みやざきけん", slug: "miyazaki", capital: "宮崎市", capitalKana: "みやざきし", region: "九州", inland: false, areaKm2: 7734.05, areaProvisional: true},
  {code: 46, name: "鹿児島県", kana: "かごしまけん", slug: "kagoshima", capital: "鹿児島市", capitalKana: "かごしまし", region: "九州", inland: false, areaKm2: 9186.05, areaProvisional: true},
  {code: 47, name: "沖縄県", kana: "おきなわけん", slug: "okinawa", capital: "那覇市", capitalKana: "なはし", region: "九州", inland: false, areaKm2: 2282.16, areaProvisional: false},
];

export const byCode = new Map(PREFECTURES.map((p) => [p.code, p]));
