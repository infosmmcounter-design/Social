import type { LocaleCode } from "./locales";

/** Extra marketplace words so a new English listing still reads in the selected language. */
const EN = [
  "editing",
  "thumbnail",
  "pack",
  "designs",
  "reels",
  "setup",
  "system",
  "content",
  "video",
  "creation",
  "growth",
  "management",
  "page",
  "buy",
  "purchase",
  "escrow",
  "deal",
  "freelancer",
  "freelance",
  "service",
  "organic",
  "over",
  "selling",
  "with",
  "for",
  "and",
  "from",
  "your",
  "how",
  "non",
  "tools",
  "gig",
  "delivery",
  "revisions",
  "shorts",
  "views",
  "niche",
  "safe",
  "verified",
  "transfer",
  "ownership",
  "required",
  "info",
  "subscribers",
  "followers",
  "channel",
  "account",
  "monetized",
  "instant",
  "link",
  "youtube",
  "instagram",
  "tiktok",
  "facebook",
] as const;

const PACK: Record<Exclude<LocaleCode, "en">, string> = {
  ar: "مونتاج,صورة مصغرة,حزمة,تصاميم,ريلز,إعداد,نظام,محتوى,فيديو,إنشاء,نمو,إدارة,صفحة,شراء,شراء,ضمان,صفقة,مستقل,عمل حر,خدمة,عضوي,أكثر من,بيع,مع,لـ,و,من,خاصتك,كيف,غير,أدوات,خدمة,تسليم,مراجعات,شورتس,مشاهدات,تخصص,آمن,موثّق,نقل,ملكية,مطلوب,معلومات,مشتركين,متابعين,قناة,حساب,مُفعّل الربح,فوري,رابط,يوتيوب,إنستغرام,تيك توك,فيسبوك",
  ko: "편집,썸네일,팩,디자인,릴스,설정,시스템,콘텐츠,영상,제작,성장,관리,페이지,구매,구매,에스크로,거래,프리랜서,프리랜스,서비스,오가닉,이상,판매,함께,용,및,에서,귀하의,방법,비,도구,서비스,배송,수정,쇼츠,조회수,분야,안전,인증,이전,소유권,필수,정보,구독자,팔로워,채널,계정,수익화,즉시,링크,유튜브,인스타그램,틱톡,페이스북",
  zh: "剪辑,封面,套装,设计,Reels,设置,系统,内容,视频,制作,增长,管理,主页,购买,购买,担保,交易,自由职业,自由职业,服务,自然,超过,出售,与,用于,和,来自,您的,如何,非,工具,服务,交付,修改,短视频,观看,领域,安全,已验证,转让,所有权,必填,信息,订阅者,粉丝,频道,账号,已变现,即时,链接,YouTube,Instagram,TikTok,Facebook",
  ja: "編集,サムネイル,パック,デザイン,リール,設定,システム,コンテンツ,動画,制作,成長,管理,ページ,購入,購入,エスクロー,取引,フリーランス,フリーランス,サービス,オーガニック,以上,販売,付き,向け,と,から,あなたの,方法,非,ツール,サービス,納品,修正,ショート,再生,分野,安全,認証済み,譲渡,所有権,必須,情報,登録者,フォロワー,チャンネル,アカウント,収益化,即時,リンク,YouTube,Instagram,TikTok,Facebook",
  ru: "монтаж,превью,пакет,дизайны,рилс,настройка,система,контент,видео,создание,рост,ведение,страница,купить,покупка,эскроу,сделка,фрилансер,фриланс,услуга,органический,более,продажа,с,для,и,из,ваш,как,не,инструменты,услуга,доставка,правки,шортс,просмотры,ниша,безопасный,проверенный,передача,владение,нужно,данные,подписчиков,подписчиков,канал,аккаунт,монетизированный,сразу,ссылка,YouTube,Instagram,TikTok,Facebook",
  fil: "editing,thumbnail,pack,mga disenyo,reels,setup,system,content,video,paglikha,growth,management,page,bumili,pagbili,escrow,deal,freelancer,freelance,serbisyo,organic,higit,pagbebenta,kasama,para,at,mula,iyong,paano,hindi,tools,gig,delivery,revisions,shorts,views,niche,ligtas,verified,transfer,pagmamay-ari,kailangan,impormasyon,subscribers,followers,channel,account,monetized,agad,link,YouTube,Instagram,TikTok,Facebook",
  de: "Schnitt,Thumbnail,Paket,Designs,Reels,Einrichtung,System,Inhalt,Video,Erstellung,Wachstum,Verwaltung,Seite,kaufen,Kauf,Escrow,Deal,Freelancer,Freelance,Service,organisch,über,Verkauf,mit,für,und,von,Ihr,wie,nicht,Tools,Auftrag,Lieferung,Revisionen,Shorts,Aufrufe,Nische,sicher,verifiziert,Übertragung,Eigentum,nötig,Info,Abonnenten,Follower,Kanal,Account,monetarisiert,sofort,Link,YouTube,Instagram,TikTok,Facebook",
  fr: "montage,miniature,pack,designs,reels,configuration,système,contenu,vidéo,création,croissance,gestion,page,acheter,achat,escrow,deal,freelance,freelance,service,organique,plus de,vente,avec,pour,et,de,votre,comment,non,outils,service,livraison,révisions,shorts,vues,niche,sûr,vérifié,transfert,propriété,requis,infos,abonnés,abonnés,chaîne,compte,monétisé,immédiat,lien,YouTube,Instagram,TikTok,Facebook",
  es: "edición,miniatura,pack,diseños,reels,configuración,sistema,contenido,video,creación,crecimiento,gestión,página,comprar,compra,escrow,trato,freelancer,freelance,servicio,orgánico,más de,venta,con,para,y,de,tu,cómo,no,herramientas,servicio,entrega,revisiones,shorts,vistas,nicho,seguro,verificado,transferencia,propiedad,requerido,datos,suscriptores,seguidores,canal,cuenta,monetizado,instantáneo,enlace,YouTube,Instagram,TikTok,Facebook",
};

function table(locale: Exclude<LocaleCode, "en">) {
  const parts = PACK[locale].split(",");
  const map: Record<string, string> = {};
  EN.forEach((word, i) => {
    const value = (parts[i] || "").trim();
    if (value) map[word] = value;
  });
  map["i am"] = {
    ar: "أنا",
    ko: "저는",
    zh: "我",
    ja: "私は",
    ru: "я",
    fil: "ako ay",
    de: "ich",
    fr: "je",
    es: "yo",
  }[locale];
  map.a = "";
  map.an = "";
  map.the = "";
  map["not monetized"] = {
    ar: "غير مُفعّل الربح",
    ko: "미수익화",
    zh: "未变现",
    ja: "未収益化",
    ru: "без монетизации",
    fil: "hindi monetized",
    de: "nicht monetarisiert",
    fr: "non monétisé",
    es: "sin monetizar",
  }[locale];
  return map;
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function translateLoose(text: string, locale: LocaleCode): string {
  if (!text || locale === "en") return text;
  const map = table(locale);
  let out = text;
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const value = map[key];
    if (value == null) continue;
    const re = new RegExp(`\\b${escapeReg(key)}\\b`, "gi");
    out = out.replace(re, (match) => {
      if (match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()) {
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
      return value;
    });
  }
  return out.replace(/\s{2,}/g, " ").trim();
}
