import type { LocaleCode } from "./locales";
import { LOCALES } from "./locales";

export const SEO_CATS = [
  "youtube",
  "facebook",
  "tiktok",
  "instagram",
  "x",
  "ai",
  "freelance",
  "other",
] as const;

export type SeoCat = (typeof SEO_CATS)[number];

const NAMES: Record<LocaleCode, Record<SeoCat, string>> = {
  en: {
    youtube: "YouTube channel",
    facebook: "Facebook page",
    tiktok: "TikTok account",
    instagram: "Instagram account",
    x: "X account",
    ai: "AI tool",
    freelance: "freelancer service",
    other: "subscription",
  },
  ko: {
    youtube: "유튜브 채널",
    facebook: "페이스북 페이지",
    tiktok: "틱톡 계정",
    instagram: "인스타그램 계정",
    x: "X 계정",
    ai: "AI 도구",
    freelance: "프리랜서 서비스",
    other: "구독",
  },
  ar: {
    youtube: "قناة يوتيوب",
    facebook: "صفحة فيسبوك",
    tiktok: "حساب تيك توك",
    instagram: "حساب إنستغرام",
    x: "حساب X",
    ai: "أداة ذكاء اصطناعي",
    freelance: "خدمة مستقل",
    other: "اشتراك",
  },
  zh: {
    youtube: "YouTube 频道",
    facebook: "Facebook 主页",
    tiktok: "TikTok 账号",
    instagram: "Instagram 账号",
    x: "X 账号",
    ai: "AI 工具",
    freelance: "自由职业服务",
    other: "订阅",
  },
  ja: {
    youtube: "YouTubeチャンネル",
    facebook: "Facebookページ",
    tiktok: "TikTokアカウント",
    instagram: "Instagramアカウント",
    x: "Xアカウント",
    ai: "AIツール",
    freelance: "フリーランスサービス",
    other: "サブスク",
  },
  ru: {
    youtube: "канал YouTube",
    facebook: "страница Facebook",
    tiktok: "аккаунт TikTok",
    instagram: "аккаунт Instagram",
    x: "аккаунт X",
    ai: "AI-инструмент",
    freelance: "услуга фрилансера",
    other: "подписка",
  },
  fil: {
    youtube: "YouTube channel",
    facebook: "Facebook page",
    tiktok: "TikTok account",
    instagram: "Instagram account",
    x: "X account",
    ai: "AI tool",
    freelance: "freelancer service",
    other: "subscription",
  },
  de: {
    youtube: "YouTube-Kanal",
    facebook: "Facebook-Seite",
    tiktok: "TikTok-Account",
    instagram: "Instagram-Account",
    x: "X-Account",
    ai: "KI-Tool",
    freelance: "Freelancer-Service",
    other: "Abo",
  },
  fr: {
    youtube: "chaîne YouTube",
    facebook: "page Facebook",
    tiktok: "compte TikTok",
    instagram: "compte Instagram",
    x: "compte X",
    ai: "outil IA",
    freelance: "service freelance",
    other: "abonnement",
  },
  es: {
    youtube: "canal de YouTube",
    facebook: "página de Facebook",
    tiktok: "cuenta de TikTok",
    instagram: "cuenta de Instagram",
    x: "cuenta de X",
    ai: "herramienta de IA",
    freelance: "servicio freelance",
    other: "suscripción",
  },
};

/** Base related SEO tags per category, generated for every locale. */
const LINES: Record<LocaleCode, (n: string, cat: SeoCat) => string[]> = {
  en: (n, cat) => [
    `Buy ${n}`,
    `${n} for sale`,
    `${n} purchase`,
    `How to buy ${n}`,
    `Buy monetized ${n}`,
    `Buy non monetized ${n}`,
    `Organic ${n}`,
    `Safe ${n} transfer`,
    `Verified ${n} escrow`,
    `USDT escrow ${n}`,
    cat === "youtube" ? "Buy YouTube channel" : `${cat} ${n}`,
    cat === "freelance" ? "Hire freelancer with escrow" : `${n} marketplace`,
  ],
  ko: (n, cat) => [
    `${n} 구매`,
    `${n} 판매`,
    `${n} 사기`,
    `${n} 구매 방법`,
    `수익화 ${n} 구매`,
    `미수익화 ${n} 구매`,
    `오가닉 ${n}`,
    `안전한 ${n} 이전`,
    `인증 ${n} 에스크로`,
    `USDT 에스크로 ${n}`,
    cat === "youtube" ? "유튜브 채널 구매" : `${n} 마켓`,
    cat === "freelance" ? "에스크로 프리랜서 고용" : `${n} 거래`,
  ],
  ar: (n, cat) => [
    `شراء ${n}`,
    `${n} للبيع`,
    `كيف تشتري ${n}`,
    `شراء ${n} مُفعّل الربح`,
    `شراء ${n} غير مُفعّل`,
    `${n} عضوي`,
    `نقل آمن لـ ${n}`,
    `ضمان موثّق لـ ${n}`,
    `إسكرو USDT ${n}`,
    `صفقة ضمان ${n}`,
    cat === "youtube" ? "شراء قناة يوتيوب" : `سوق ${n}`,
    cat === "freelance" ? "توظيف مستقل بالإسكرو" : `شراء ${n}`,
  ],
  zh: (n, cat) => [
    `购买${n}`,
    `${n}出售`,
    `${n}购买`,
    `如何购买${n}`,
    `购买已变现${n}`,
    `购买未变现${n}`,
    `自然${n}`,
    `安全转让${n}`,
    `已验证${n}担保`,
    `USDT 托管 ${n}`,
    cat === "youtube" ? "购买 YouTube 频道" : `${n}市场`,
    cat === "freelance" ? "托管雇佣自由职业者" : `${n}交易`,
  ],
  ja: (n, cat) => [
    `${n}購入`,
    `${n}を買う`,
    `${n}の買い方`,
    `販売中の${n}`,
    `収益化${n}を購入`,
    `未収益化${n}を購入`,
    `オーガニック${n}`,
    `安全な${n}譲渡`,
    `認証${n}エスクロー`,
    `USDTエスクロー${n}`,
    cat === "youtube" ? "YouTubeチャンネル購入" : `${n}マーケット`,
    cat === "freelance" ? "エスクローでフリーランス依頼" : `${n}取引`,
  ],
  ru: (n, cat) => [
    `купить ${n}`,
    `${n} на продажу`,
    `покупка: ${n}`,
    `как купить ${n}`,
    `купить монетизированный ${n}`,
    `купить без монетизации ${n}`,
    `органический ${n}`,
    `безопасная передача ${n}`,
    `проверенный эскроу ${n}`,
    `USDT эскроу ${n}`,
    cat === "youtube" ? "купить канал YouTube" : `маркет ${n}`,
    cat === "freelance" ? "нанять фрилансера с эскроу" : `сделка ${n}`,
  ],
  fil: (n, cat) => [
    `Bumili ng ${n}`,
    `${n} for sale`,
    `${n} purchase`,
    `Paano bumili ng ${n}`,
    `Bumili ng monetized ${n}`,
    `Bumili ng non monetized ${n}`,
    `Organic ${n}`,
    `Ligtas na transfer ng ${n}`,
    `Verified ${n} escrow`,
    `USDT escrow ${n}`,
    cat === "youtube" ? "Bumili ng YouTube channel" : `${n} marketplace`,
    cat === "freelance" ? "Mag-hire ng freelancer with escrow" : `${n} deal`,
  ],
  de: (n, cat) => [
    `${n} kaufen`,
    `${n} zu verkaufen`,
    `${n} Kauf`,
    `Wie man ${n} kauft`,
    `Monetarisierten ${n} kaufen`,
    `Nicht monetarisierten ${n} kaufen`,
    `Organischer ${n}`,
    `Sicherer ${n} Transfer`,
    `Verifizierter ${n} Escrow`,
    `USDT Escrow ${n}`,
    cat === "youtube" ? "YouTube-Kanal kaufen" : `${n} Marktplatz`,
    cat === "freelance" ? "Freelancer mit Escrow beauftragen" : `${n} Deal`,
  ],
  fr: (n, cat) => [
    `acheter ${n}`,
    `${n} à vendre`,
    `achat ${n}`,
    `comment acheter ${n}`,
    `acheter ${n} monétisé`,
    `acheter ${n} non monétisé`,
    `${n} organique`,
    `transfert sûr ${n}`,
    `escrow vérifié ${n}`,
    `escrow USDT ${n}`,
    cat === "youtube" ? "acheter chaîne YouTube" : `marketplace ${n}`,
    cat === "freelance" ? "embaucher freelance avec escrow" : `deal ${n}`,
  ],
  es: (n, cat) => [
    `comprar ${n}`,
    `${n} en venta`,
    `compra de ${n}`,
    `cómo comprar ${n}`,
    `comprar ${n} monetizado`,
    `comprar ${n} no monetizado`,
    `${n} orgánico`,
    `transferencia segura de ${n}`,
    `escrow verificado de ${n}`,
    `escrow USDT ${n}`,
    cat === "youtube" ? "comprar canal de YouTube" : `marketplace ${n}`,
    cat === "freelance" ? "contratar freelancer con escrow" : `trato ${n}`,
  ],
};

const EXTRA: Record<SeoCat, Partial<Record<LocaleCode, string[]>>> = {
  youtube: {
    en: [
      "Buy YouTube channel",
      "YouTube channel for sale",
      "Buy monetized YouTube channel",
      "Buy non monetized YouTube channel",
      "YouTube account purchase escrow",
      "Safe YouTube channel transfer",
    ],
    ko: ["유튜브 채널 구매", "수익화 유튜브 채널 판매", "유튜브 계정 에스크로"],
    ar: ["شراء قناة يوتيوب", "قناة يوتيوب للبيع", "يوتيوب مفعل الربح"],
    zh: ["购买 YouTube 频道", "已变现 YouTube 频道", "YouTube 频道担保交易"],
    ja: ["YouTubeチャンネル購入", "収益化YouTubeチャンネル", "YouTube譲渡エスクロー"],
    ru: ["купить канал YouTube", "монетизированный YouTube", "эскроу YouTube"],
    fil: ["Bumili ng YouTube channel", "Monetized YouTube for sale"],
    de: ["YouTube-Kanal kaufen", "Monetarisierten YouTube-Kanal kaufen"],
    fr: ["acheter chaîne YouTube", "chaîne YouTube monétisée"],
    es: ["comprar canal de YouTube", "canal YouTube monetizado"],
  },
  facebook: {
    en: ["Buy Facebook page", "Facebook page for sale", "Facebook page escrow"],
    ko: ["페이스북 페이지 구매", "페이스북 페이지 판매"],
    ar: ["شراء صفحة فيسبوك", "صفحة فيسبوك للبيع"],
    zh: ["购买 Facebook 主页", "Facebook 主页出售"],
    ja: ["Facebookページ購入", "Facebookページ販売"],
    ru: ["купить страницу Facebook", "Facebook страница на продажу"],
    fil: ["Bumili ng Facebook page"],
    de: ["Facebook-Seite kaufen"],
    fr: ["acheter page Facebook"],
    es: ["comprar página de Facebook"],
  },
  tiktok: {
    en: ["Buy TikTok account", "TikTok account for sale", "Monetized TikTok"],
    ko: ["틱톡 계정 구매", "틱톡 계정 판매"],
    ar: ["شراء حساب تيك توك", "تيك توك للبيع"],
    zh: ["购买 TikTok 账号", "TikTok 账号出售"],
    ja: ["TikTokアカウント購入", "TikTokアカウント販売"],
    ru: ["купить аккаунт TikTok"],
    fil: ["Bumili ng TikTok account"],
    de: ["TikTok-Account kaufen"],
    fr: ["acheter compte TikTok"],
    es: ["comprar cuenta de TikTok"],
  },
  instagram: {
    en: ["Buy Instagram account", "Instagram account for sale", "IG account escrow"],
    ko: ["인스타그램 계정 구매", "인스타 계정 판매"],
    ar: ["شراء حساب إنستغرام"],
    zh: ["购买 Instagram 账号"],
    ja: ["Instagramアカウント購入"],
    ru: ["купить аккаунт Instagram"],
    fil: ["Bumili ng Instagram account"],
    de: ["Instagram-Account kaufen"],
    fr: ["acheter compte Instagram"],
    es: ["comprar cuenta de Instagram"],
  },
  x: {
    en: ["Buy X account", "Buy Twitter account", "X account for sale"],
    ko: ["X 계정 구매", "트위터 계정 구매"],
    ar: ["شراء حساب X", "شراء حساب تويتر"],
    zh: ["购买 X 账号", "购买 Twitter 账号"],
    ja: ["Xアカウント購入", "Twitterアカウント購入"],
    ru: ["купить аккаунт X", "купить Twitter"],
    fil: ["Bumili ng X account"],
    de: ["X-Account kaufen", "Twitter-Account kaufen"],
    fr: ["acheter compte X", "acheter compte Twitter"],
    es: ["comprar cuenta de X", "comprar cuenta de Twitter"],
  },
  ai: {
    en: ["Buy AI tool", "AI software subscription", "AI tools marketplace"],
    ko: ["AI 도구 구매", "AI 구독"],
    ar: ["شراء أداة ذكاء اصطناعي"],
    zh: ["购买 AI 工具"],
    ja: ["AIツール購入"],
    ru: ["купить AI-инструмент"],
    fil: ["Bumili ng AI tool"],
    de: ["KI-Tool kaufen"],
    fr: ["acheter outil IA"],
    es: ["comprar herramienta de IA"],
  },
  freelance: {
    en: [
      "Hire freelancer with escrow",
      "Buy freelance service",
      "YouTube thumbnail design service",
      "Video editing freelance",
      "Social media management gig",
    ],
    ko: ["에스크로 프리랜서", "유튜브 썸네일 제작", "영상 편집 외주"],
    ar: ["توظيف مستقل بالإسكرو", "تصميم صور يوتيوب"],
    zh: ["托管雇佣自由职业者", "YouTube 缩略图设计"],
    ja: ["エスクローでフリーランス", "YouTubeサムネイル制作"],
    ru: ["нанять фрилансера с эскроу", "дизайн превью YouTube"],
    fil: ["Mag-hire ng freelancer with escrow"],
    de: ["Freelancer mit Escrow beauftragen", "YouTube-Thumbnail Design"],
    fr: ["embaucher freelance avec escrow", "design miniature YouTube"],
    es: ["contratar freelancer con escrow", "diseño de miniaturas YouTube"],
  },
  other: {
    en: ["Buy subscription account", "Digital subscription for sale", "Software license escrow"],
    ko: ["구독 계정 구매", "디지털 구독 판매"],
    ar: ["شراء اشتراك", "اشتراك رقمي للبيع"],
    zh: ["购买订阅账号", "数字订阅出售"],
    ja: ["サブスク購入", "デジタルサブスク販売"],
    ru: ["купить подписку", "цифровая подписка"],
    fil: ["Bumili ng subscription"],
    de: ["Abo kaufen", "Digitales Abo verkaufen"],
    fr: ["acheter abonnement", "abonnement numérique"],
    es: ["comprar suscripción", "suscripción digital"],
  },
};

function unique(tags: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const k = t.trim();
    if (!k) continue;
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
  }
  return out;
}

export function keywordsFor(locale: LocaleCode, cat?: string | null): string[] {
  const key = (SEO_CATS as readonly string[]).includes(cat || "")
    ? (cat as SeoCat)
    : null;

  if (!key) {
    const mixed = LOCALES.flatMap((l) =>
      SEO_CATS.slice(0, 5).map((c) => NAMES[l.code][c])
    );
    if (locale === "en") {
      return unique([
        "Buy YouTube channel",
        "Buy Facebook page",
        "Buy Instagram account",
        "Buy TikTok account",
        "Freelance services",
        "Buy social media account",
        "USDT escrow marketplace",
        "Buy monetized YouTube channel",
        "Hire freelancer with escrow",
        "Buy X account",
        ...mixed.slice(0, 4),
      ]).slice(0, 16);
    }
    return unique([
      ...LINES[locale](NAMES[locale].youtube, "youtube"),
      ...(EXTRA.youtube[locale] || []),
    ]).slice(0, 16);
  }

  return unique([
    ...LINES[locale](NAMES[locale][key], key),
    ...(EXTRA[key][locale] || []),
    ...(EXTRA[key].en || []).slice(0, 4),
  ]).slice(0, 16);
}

/** Keywords for every locale (used when indexing one listing globally). */
export function keywordsAllLocales(cat?: string | null): string[] {
  return unique(LOCALES.flatMap((l) => keywordsFor(l.code, cat))).slice(0, 40);
}
