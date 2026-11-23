import type { LocaleCode } from "./locales";
import { CATALOG_TITLES } from "./catalog";
import { translateLoose } from "./words";

type ListingLike = {
  id: number;
  title: string;
  desc: string;
  teaser: string;
  niche: string;
  cat: string;
  followers?: string;
  monetized?: boolean;
  listingType?: string;
};

type SellerLike = {
  id: number;
  name: string;
  bio?: string;
  country?: string;
};

/** Exact overrides for known seed listings (id → locale → fields). */
const LISTING_OVERRIDES: Record<
  number,
  Partial<
    Record<
      LocaleCode,
      Partial<Pick<ListingLike, "title" | "desc" | "teaser" | "niche">>
    >
  >
> = {
  10: {
    ko: {
      title: "유튜브 게이밍 채널 — 구독자 85K",
      niche: "게임",
      teaser: "안정적인 RPM과 깨끗한 이력을 가진 수익화 게이밍 채널.",
      desc: "꾸준한 조회수의 게이밍 채널. YouTube Brand Account로 전체 소유권 이전.",
    },
    ar: {
      title: "قناة يوتيوب للألعاب — 85 ألف مشترك",
      niche: "ألعاب",
      teaser: "قناة ألعاب مُفعّلة الربح مع RPM ثابت وسجل نظيف.",
      desc: "قناة ألعاب راسخة بمشاهدات ثابتة. نقل ملكية كامل عبر حساب العلامة على يوتيوب.",
    },
    zh: {
      title: "YouTube 游戏频道 — 8.5万订阅",
      niche: "游戏",
      teaser: "已开通变现的游戏频道，RPM稳定、历史干净。",
      desc: "成熟游戏频道，浏览量稳定。通过 YouTube 品牌账号完整过户。",
    },
    ja: {
      title: "YouTubeゲームチャンネル — 登録者8.5万人",
      niche: "ゲーム",
      teaser: "安定RPMとクリーンな履歴の収益化ゲームチャンネル。",
      desc: "安定した再生数のゲームチャンネル。YouTubeブランドアカウントで完全譲渡。",
    },
    ru: {
      title: "YouTube игровой канал — 85K подписчиков",
      niche: "Игры",
      teaser: "Монетизированный игровой канал со стабильным RPM и чистой историей.",
      desc: "Устоявшийся игровой канал со стабильными просмотрами. Полная передача через Brand Account.",
    },
    fil: {
      title: "YouTube Gaming Channel — 85K Subs",
      niche: "Gaming",
      teaser: "Monetized gaming channel na may steady RPM at clean history.",
      desc: "Established gaming channel na may consistent views. Full ownership transfer via YouTube Brand Account.",
    },
    de: {
      title: "YouTube Gaming-Kanal — 85K Abos",
      niche: "Gaming",
      teaser: "Monetarisierter Gaming-Kanal mit stabilem RPM und sauberer Historie.",
      desc: "Etablierter Gaming-Kanal mit konstanten Views. Volle Übertragung per YouTube Brand Account.",
    },
    fr: {
      title: "Chaîne YouTube Gaming — 85K abonnés",
      niche: "Jeux",
      teaser: "Chaîne gaming monétisée avec RPM stable et historique propre.",
      desc: "Chaîne gaming établie avec vues régulières. Transfert complet via compte de marque YouTube.",
    },
    es: {
      title: "Canal YouTube Gaming — 85K suscriptores",
      niche: "Gaming",
      teaser: "Canal de gaming monetizado con RPM estable e historial limpio.",
      desc: "Canal de gaming consolidado con vistas constantes. Transferencia completa vía Brand Account.",
    },
  },
  11: {
    ko: {
      title: "인스타그램 패션 페이지 — 팔로워 42K",
      niche: "패션",
      teaser: "미국·유럽 참여도가 높은 감성 패션 페이지.",
      desc: "깔끔한 감성 피드, 이전 후 브랜드 협업에 적합.",
    },
    ar: {
      title: "صفحة إنستغرام أزياء — 42 ألف متابع",
      niche: "أزياء",
      teaser: "صفحة أزياء أنيقة بتفاعل عالٍ من أمريكا وأوروبا.",
      desc: "فيد جمالي نظيف، جاهز لصفقات العلامات بعد النقل.",
    },
    zh: {
      title: "Instagram 时尚账号 — 4.2万粉丝",
      niche: "时尚",
      teaser: "欧美高互动的审美时尚账号。",
      desc: "干净审美内容流，过户后适合品牌合作。",
    },
    ja: {
      title: "Instagramファッションページ — フォロワー4.2万人",
      niche: "ファッション",
      teaser: "米欧からの高いエンゲージメントの美容ファッションページ。",
      desc: "クリーンなフィード。譲渡後のブランド案件に最適。",
    },
    ru: {
      title: "Instagram fashion-страница — 42K подписчиков",
      niche: "Мода",
      teaser: "Эстетичная fashion-страница с высокой вовлечённостью из США и ЕС.",
      desc: "Чистый эстетичный фид, готов к бренд-сделкам после передачи.",
    },
    fil: {
      title: "Instagram Fashion Page — 42K Followers",
      niche: "Fashion",
      teaser: "Aesthetic fashion page na may high engagement mula US & EU.",
      desc: "Clean aesthetic feed, ready for brand deals after transfer.",
    },
    de: {
      title: "Instagram Fashion-Seite — 42K Follower",
      niche: "Mode",
      teaser: "Ästhetische Fashion-Seite mit hoher Engagement aus US & EU.",
      desc: "Sauberer ästhetischer Feed, bereit für Brand Deals nach Transfer.",
    },
    fr: {
      title: "Page Instagram mode — 42K abonnés",
      niche: "Mode",
      teaser: "Page mode esthétique avec fort engagement US & UE.",
      desc: "Feed esthétique propre, prêt pour des deals de marque après transfert.",
    },
    es: {
      title: "Página Instagram moda — 42K seguidores",
      niche: "Moda",
      teaser: "Página de moda estética con alto engagement de EE.UU. y UE.",
      desc: "Feed estético limpio, listo para deals de marca tras la transferencia.",
    },
  },
};

const SELLER_BIO: Record<
  number,
  Partial<Record<LocaleCode, string>>
> = {
  2: {
    en: "Official SocialsFlip store — curated accounts and tools.",
    ko: "공식 SocialsFlip 스토어 — 엄선된 계정과 툴.",
    ar: "متجر SocialsFlip الرسمي — حسابات وأدوات مختارة.",
    zh: "SocialsFlip 官方店铺 — 精选账号与工具。",
    ja: "公式SocialsFlipストア — 厳選アカウントとツール。",
    ru: "Официальный магазин SocialsFlip — отобранные аккаунты и инструменты.",
    fil: "Opisyal na SocialsFlip store — curated accounts at tools.",
    de: "Offizieller SocialsFlip-Store — kuratierte Accounts und Tools.",
    fr: "Boutique officielle SocialsFlip — comptes et outils sélectionnés.",
    es: "Tienda oficial SocialsFlip — cuentas y herramientas seleccionadas.",
  },
};

/** Shared marketplace vocabulary (merged into every non-en locale). */
const BASE_WORDS: Record<LocaleCode, Record<string, string>> = {
  en: {},
  ko: {
    monetized: "수익화",
    Monetized: "수익화",
    subscribers: "구독자",
    Subscribers: "구독자",
    followers: "팔로워",
    Followers: "팔로워",
    channel: "채널",
    Channel: "채널",
    account: "계정",
    Account: "계정",
    youtube: "유튜브",
    YouTube: "유튜브",
    Instagram: "인스타그램",
    TikTok: "틱톡",
    instant: "즉시",
    adsense: "애드센스",
    Adsense: "애드센스",
    link: "링크",
  },
  ar: {
    monetized: "مُفعّل الربح",
    Monetized: "مُفعّل الربح",
    subscribers: "مشتركين",
    Subscribers: "مشتركين",
    followers: "متابعين",
    Followers: "متابعين",
    channel: "قناة",
    Channel: "قناة",
    account: "حساب",
    Account: "حساب",
    youtube: "يوتيوب",
    YouTube: "يوتيوب",
    Instagram: "إنستغرام",
    TikTok: "تيك توك",
    instant: "فوري",
    adsense: "أدسنس",
    Adsense: "أدسنس",
  },
  zh: {
    monetized: "已变现",
    Monetized: "已变现",
    subscribers: "订阅者",
    Subscribers: "订阅者",
    followers: "粉丝",
    Followers: "粉丝",
    channel: "频道",
    Channel: "频道",
    account: "账号",
    Account: "账号",
    youtube: "YouTube",
    YouTube: "YouTube",
    Instagram: "Instagram",
    TikTok: "TikTok",
    instant: "即时",
    adsense: "AdSense",
    Adsense: "AdSense",
  },
  ja: {
    monetized: "収益化",
    Monetized: "収益化",
    subscribers: "登録者",
    Subscribers: "登録者",
    followers: "フォロワー",
    Followers: "フォロワー",
    channel: "チャンネル",
    Channel: "チャンネル",
    account: "アカウント",
    Account: "アカウント",
    youtube: "YouTube",
    YouTube: "YouTube",
    Instagram: "Instagram",
    TikTok: "TikTok",
    instant: "即時",
    adsense: "アドセンス",
    Adsense: "アドセンス",
  },
  ru: {
    monetized: "монетизированный",
    Monetized: "Монетизированный",
    subscribers: "подписчиков",
    Subscribers: "Подписчиков",
    followers: "подписчиков",
    Followers: "Подписчиков",
    channel: "канал",
    Channel: "Канал",
    account: "аккаунт",
    Account: "Аккаунт",
    youtube: "YouTube",
    YouTube: "YouTube",
    Instagram: "Instagram",
    TikTok: "TikTok",
    instant: "мгновенно",
    adsense: "AdSense",
    Adsense: "AdSense",
  },
  fil: {
    monetized: "monetized",
    Monetized: "Monetized",
    subscribers: "subscribers",
    channel: "channel",
    account: "account",
  },
  de: {
    monetized: "monetarisiert",
    Monetized: "Monetarisiert",
    subscribers: "Abonnenten",
    Subscribers: "Abonnenten",
    followers: "Follower",
    Followers: "Follower",
    channel: "Kanal",
    Channel: "Kanal",
    account: "Account",
    Account: "Account",
    instant: "sofort",
    adsense: "AdSense",
  },
  fr: {
    monetized: "monétisé",
    Monetized: "Monétisé",
    subscribers: "abonnés",
    Subscribers: "Abonnés",
    followers: "abonnés",
    Followers: "Abonnés",
    channel: "chaîne",
    Channel: "Chaîne",
    account: "compte",
    Account: "Compte",
    instant: "immédiat",
    adsense: "AdSense",
  },
  es: {
    monetized: "monetizado",
    Monetized: "Monetizado",
    subscribers: "suscriptores",
    Subscribers: "Suscriptores",
    followers: "seguidores",
    Followers: "Seguidores",
    channel: "canal",
    Channel: "Canal",
    account: "cuenta",
    Account: "Cuenta",
    instant: "instantáneo",
    adsense: "AdSense",
  },
};

const PHRASES: Record<LocaleCode, Record<string, string>> = {
  en: {},
  ko: {
    ...BASE_WORDS.ko,
    "YouTube Tech Reviews — Mid Size": "유튜브 테크 리뷰 — 미드 사이즈",
    "TikTok Viral Clips Account": "틱톡 바이럴 클립 계정",
    "X News & Trends Account": "X 뉴스 & 트렌드 계정",
    "listing ready for escrow transfer.": "에스크로 이전 준비가 된 리스팅.",
    "Demo listing for": "데모 리스팅:",
    "Private handle hidden until escrow starts.":
      "에스크로 시작 전까지 프라이빗 핸들은 숨겨집니다.",
    "sells curated social accounts on SocialsFlip.":
      "SocialsFlip에서 엄선된 소셜 계정을 판매합니다.",
    Gaming: "게임",
    Fashion: "패션",
    Tech: "테크",
    Entertainment: "엔터테인먼트",
    News: "뉴스",
    "Not monetized": "미수익화",
    service: "서비스",
    tool: "툴",
  },
  ar: {
    ...BASE_WORDS.ar,
    "YouTube Tech Reviews — Mid Size": "مراجعات تقنية على يوتيوب — متوسط الحجم",
    "TikTok Viral Clips Account": "حساب تيك توك لمقاطع فيروسية",
    "X News & Trends Account": "حساب X للأخبار والترندات",
    "listing ready for escrow transfer.": "قائمة جاهزة للنقل عبر الضمان.",
    "Demo listing for": "قائمة تجريبية لـ",
    "Private handle hidden until escrow starts.":
      "المعرف الخاص مخفي حتى بدء الضمان.",
    "sells curated social accounts on SocialsFlip.":
      "يبيع حسابات اجتماعية مختارة على SocialsFlip.",
    Gaming: "ألعاب",
    Fashion: "أزياء",
    Tech: "تقنية",
    Entertainment: "ترفيه",
    News: "أخبار",
    "Not monetized": "غير مُفعّل الربح",
    service: "خدمة",
    tool: "أداة",
  },
  zh: {
    ...BASE_WORDS.zh,
    "YouTube Tech Reviews — Mid Size": "YouTube 科技评测 — 中型",
    "TikTok Viral Clips Account": "TikTok 爆款短视频账号",
    "X News & Trends Account": "X 新闻与趋势账号",
    "listing ready for escrow transfer.": "可托管过户的商品。",
    "Demo listing for": "演示商品：",
    "Private handle hidden until escrow starts.": "托管开始前隐藏私密链接。",
    "sells curated social accounts on SocialsFlip.":
      "在 SocialsFlip 出售精选社交账号。",
    Gaming: "游戏",
    Fashion: "时尚",
    Tech: "科技",
    Entertainment: "娱乐",
    News: "新闻",
    "Not monetized": "未变现",
    service: "服务",
    tool: "工具",
  },
  ja: {
    ...BASE_WORDS.ja,
    "YouTube Tech Reviews — Mid Size": "YouTubeテックレビュー — ミッドサイズ",
    "TikTok Viral Clips Account": "TikTokバイラルクリップアカウント",
    "X News & Trends Account": "Xニュース＆トレンドアカウント",
    "listing ready for escrow transfer.": "エスクロー譲渡準備完了の出品。",
    "Demo listing for": "デモ出品：",
    "Private handle hidden until escrow starts.":
      "エスクロー開始までプライベートハンドルは非公開。",
    "sells curated social accounts on SocialsFlip.":
      "SocialsFlipで厳選SNSアカウントを販売しています。",
    Gaming: "ゲーム",
    Fashion: "ファッション",
    Tech: "テック",
    Entertainment: "エンタメ",
    News: "ニュース",
    "Not monetized": "未収益化",
    service: "サービス",
    tool: "ツール",
  },
  ru: {
    ...BASE_WORDS.ru,
    "YouTube Tech Reviews — Mid Size": "YouTube обзоры техники — средний размер",
    "TikTok Viral Clips Account": "TikTok аккаунт вирусных клипов",
    "X News & Trends Account": "X аккаунт новостей и трендов",
    "listing ready for escrow transfer.": "объявление готово к передаче через эскроу.",
    "Demo listing for": "Демо-объявление для",
    "Private handle hidden until escrow starts.":
      "Приватный хэндл скрыт до старта эскроу.",
    "sells curated social accounts on SocialsFlip.":
      "продаёт отобранные соцаккаунты на SocialsFlip.",
    Gaming: "Игры",
    Fashion: "Мода",
    Tech: "Техника",
    Entertainment: "Развлечения",
    News: "Новости",
    "Not monetized": "Без монетизации",
    service: "услуга",
    tool: "инструмент",
  },
  fil: {
    ...BASE_WORDS.fil,
    "YouTube Tech Reviews — Mid Size": "YouTube Tech Reviews — Mid Size",
    "TikTok Viral Clips Account": "TikTok Viral Clips Account",
    "X News & Trends Account": "X News & Trends Account",
    "listing ready for escrow transfer.":
      "listing na handa para sa escrow transfer.",
    "Demo listing for": "Demo listing para sa",
    "Private handle hidden until escrow starts.":
      "Nakatago ang private handle hanggang magsimula ang escrow.",
    "sells curated social accounts on SocialsFlip.":
      "nagbebenta ng curated social accounts sa SocialsFlip.",
    Gaming: "Gaming",
    Fashion: "Fashion",
    Tech: "Tech",
    Entertainment: "Entertainment",
    News: "News",
    "Not monetized": "Hindi monetized",
    service: "service",
    tool: "tool",
  },
  de: {
    ...BASE_WORDS.de,
    "YouTube Tech Reviews — Mid Size": "YouTube Tech-Reviews — mittlere Größe",
    "TikTok Viral Clips Account": "TikTok Viral-Clips-Account",
    "X News & Trends Account": "X News- & Trends-Account",
    "listing ready for escrow transfer.":
      "Angebot bereit für Escrow-Übertragung.",
    "Demo listing for": "Demo-Angebot für",
    "Private handle hidden until escrow starts.":
      "Privater Handle verborgen bis Escrow startet.",
    "sells curated social accounts on SocialsFlip.":
      "verkauft kuratierte Social-Accounts auf SocialsFlip.",
    Gaming: "Gaming",
    Fashion: "Mode",
    Tech: "Technik",
    Entertainment: "Entertainment",
    News: "News",
    "Not monetized": "Nicht monetarisiert",
    service: "Service",
    tool: "Tool",
  },
  fr: {
    ...BASE_WORDS.fr,
    "YouTube Tech Reviews — Mid Size": "Avis tech YouTube — taille moyenne",
    "TikTok Viral Clips Account": "Compte TikTok clips viraux",
    "X News & Trends Account": "Compte X actu & tendances",
    "listing ready for escrow transfer.":
      "annonce prête pour transfert sous séquestre.",
    "Demo listing for": "Annonce démo pour",
    "Private handle hidden until escrow starts.":
      "Identifiant privé masqué jusqu’au début de l’escrow.",
    "sells curated social accounts on SocialsFlip.":
      "vend des comptes sociaux sélectionnés sur SocialsFlip.",
    Gaming: "Jeux",
    Fashion: "Mode",
    Tech: "Tech",
    Entertainment: "Divertissement",
    News: "Actu",
    "Not monetized": "Non monétisé",
    service: "service",
    tool: "outil",
  },
  es: {
    ...BASE_WORDS.es,
    "YouTube Tech Reviews — Mid Size": "Reviews tech YouTube — tamaño medio",
    "TikTok Viral Clips Account": "Cuenta TikTok de clips virales",
    "X News & Trends Account": "Cuenta X de noticias y tendencias",
    "listing ready for escrow transfer.":
      "anuncio listo para transferencia con escrow.",
    "Demo listing for": "Anuncio demo para",
    "Private handle hidden until escrow starts.":
      "Handle privado oculto hasta que empiece el escrow.",
    "sells curated social accounts on SocialsFlip.":
      "vende cuentas sociales seleccionadas en SocialsFlip.",
    Gaming: "Gaming",
    Fashion: "Moda",
    Tech: "Tech",
    Entertainment: "Entretenimiento",
    News: "Noticias",
    "Not monetized": "Sin monetizar",
    service: "servicio",
    tool: "herramienta",
  },
};

export function localizeText(text: string, locale: LocaleCode): string {
  if (!text || locale === "en") return text;
  const map = PHRASES[locale] || {};
  let out = text;
  // Longer keys first so partial overlaps don't break
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (!k) continue;
    out = out.split(k).join(map[k]);
  }
  return translateLoose(out, locale);
}

function applyPhrases(text: string, locale: LocaleCode): string {
  return localizeText(text, locale);
}

function catalogTitle(title: string, locale: LocaleCode): string | undefined {
  const exact = CATALOG_TITLES[title]?.[locale];
  if (exact) return exact;
  const key = Object.keys(CATALOG_TITLES).find((k) => title.startsWith(k));
  const mapped = key ? CATALOG_TITLES[key]?.[locale] : undefined;
  if (key && mapped) return mapped + title.slice(key.length);
  return undefined;
}

export function localizeListing<T extends ListingLike>(
  listing: T,
  locale: LocaleCode
): T {
  if (locale === "en") return listing;
  const ov = LISTING_OVERRIDES[listing.id]?.[locale];
  const title = ov?.title || catalogTitle(listing.title, locale) || applyPhrases(listing.title, locale);
  const desc = ov?.desc || applyPhrases(listing.desc, locale);
  const teaser = ov?.teaser || applyPhrases(listing.teaser, locale);
  const niche = ov?.niche || applyPhrases(listing.niche, locale);
  return {
    ...listing,
    title,
    desc,
    teaser,
    niche,
    listingType: listing.listingType
      ? applyPhrases(listing.listingType, locale)
      : listing.listingType,
  };
}

export function localizeSeller<T extends SellerLike>(
  seller: T,
  locale: LocaleCode
): T {
  if (locale === "en") return seller;
  const bioOverride = SELLER_BIO[seller.id]?.[locale];
  const bio = bioOverride || applyPhrases(seller.bio || "", locale);
  return { ...seller, bio };
}

export function parseLocaleParam(raw: string | null | undefined): LocaleCode {
  const v = (raw || "en").toLowerCase();
  const allowed = [
    "en",
    "ko",
    "ar",
    "zh",
    "ja",
    "ru",
    "fil",
    "de",
    "fr",
    "es",
  ] as const;
  return (allowed as readonly string[]).includes(v)
    ? (v as LocaleCode)
    : "en";
}
