import type { LocaleCode } from "./locales";
import { translateLoose } from "./words";

/** Built-in translated copies of seed blog posts (id → locale → content). */
const BUILTIN: Record<
  number,
  Partial<Record<LocaleCode, { title: string; body: string }>>
> = {
  1: {
    en: {
      title: "How SocialsFlip escrow protects buyers",
      body: "Every marketplace order is held in escrow until you confirm delivery. Our admin moderators sit in the deal chat with you and the seller.",
    },
    ko: {
      title: "SocialsFlip 에스크로가 구매자를 보호하는 방법",
      body: "모든 마켓플레이스 주문은 배송을 확인할 때까지 에스크로에 보관됩니다. 관리자가 딜 채팅에서 구매자·판매자와 함께합니다.",
    },
    ar: {
      title: "كيف يحمي ضمان SocialsFlip المشترين",
      body: "كل طلب في السوق يُحتجز في الضمان حتى تؤكد التسليم. المشرفون يشاركون في محادثة الصفقة معك ومع البائع.",
    },
    zh: {
      title: "SocialsFlip 托管如何保护买家",
      body: "每笔市场订单都会托管，直到你确认交付。管理员会与你和卖家一起参与交易聊天。",
    },
    ja: {
      title: "SocialsFlipエスクローが買い手を守る仕組み",
      body: "マーケット注文は納品確認までエスクローで保管されます。管理者が取引チャットに同席します。",
    },
    ru: {
      title: "Как эскроу SocialsFlip защищает покупателей",
      body: "Каждый заказ удерживается в эскроу до подтверждения доставки. Админ участвует в чате сделки с вами и продавцом.",
    },
    fil: {
      title: "Paano pinoprotektahan ng SocialsFlip escrow ang mga buyer",
      body: "Bawat marketplace order ay hawak sa escrow hanggang kumpirmahin mo ang delivery. Kasama ang admin sa deal chat.",
    },
    de: {
      title: "So schützt SocialsFlip-Escrow Käufer",
      body: "Jeder Marktplatz-Auftrag bleibt im Escrow, bis Sie die Lieferung bestätigen. Admins sitzen mit im Deal-Chat.",
    },
    fr: {
      title: "Comment l’escrow SocialsFlip protège les acheteurs",
      body: "Chaque commande est séquestrée jusqu’à confirmation de livraison. Les admins sont dans le chat avec vous et le vendeur.",
    },
    es: {
      title: "Cómo el escrow de SocialsFlip protege a los compradores",
      body: "Cada pedido se retiene en escrow hasta que confirmes la entrega. Los admins están en el chat del trato contigo y el vendedor.",
    },
  },
  2: {
    en: {
      title: "USDT TRC20 vs BEP20 — pay on the right network",
      body: "SocialsFlip escrow accepts USDT on Tron (TRC20) and BNB Smart Chain (BEP20) only. Always match the network shown at checkout. Sending on the wrong network can permanently lose funds.",
    },
    ko: {
      title: "USDT TRC20 vs BEP20 — 올바른 네트워크로 결제하세요",
      body: "SocialsFlip 에스크로는 트론(TRC20)과 BNB 스마트체인(BEP20) USDT만 받습니다. 결제 화면에 표시된 네트워크와 일치해야 합니다. 잘못된 네트워크로 보내면 자금을 잃을 수 있습니다.",
    },
    ar: {
      title: "USDT TRC20 مقابل BEP20 — ادفع على الشبكة الصحيحة",
      body: "يقبل ضمان SocialsFlip USDT على ترون (TRC20) وBNB Smart Chain (BEP20) فقط. طابق الشبكة المعروضة عند الدفع. الإرسال على شبكة خاطئة قد يفقد الأموال نهائياً.",
    },
    zh: {
      title: "USDT TRC20 与 BEP20 — 请在正确网络支付",
      body: "SocialsFlip 托管仅接受 Tron（TRC20）与 BNB Smart Chain（BEP20）上的 USDT。务必匹配结账所示网络。发错网络可能导致资金永久丢失。",
    },
    ja: {
      title: "USDT TRC20 vs BEP20 — 正しいネットワークで支払う",
      body: "SocialsFlipエスクローはTron（TRC20）とBNB Smart Chain（BEP20）のUSDTのみ対応。チェックアウト表示のネットワークに合わせてください。誤送金は資金喪失の原因になります。",
    },
    ru: {
      title: "USDT TRC20 vs BEP20 — платите в нужной сети",
      body: "Эскроу SocialsFlip принимает USDT только в сетях Tron (TRC20) и BNB Smart Chain (BEP20). Всегда совпадайте с сетью на оплате. Неверная сеть может безвозвратно потерять средства.",
    },
    fil: {
      title: "USDT TRC20 vs BEP20 — magbayad sa tamang network",
      body: "Ang SocialsFlip escrow ay tumatanggap lang ng USDT sa Tron (TRC20) at BNB Smart Chain (BEP20). Itugma ang network sa checkout. Mali ang network = maaaring mawala ang pondo.",
    },
    de: {
      title: "USDT TRC20 vs BEP20 — im richtigen Netzwerk zahlen",
      body: "SocialsFlip-Escrow akzeptiert USDT nur auf Tron (TRC20) und BNB Smart Chain (BEP20). Stimmen Sie mit dem Checkout-Netzwerk überein. Falsches Netzwerk kann Mittel dauerhaft verlieren.",
    },
    fr: {
      title: "USDT TRC20 vs BEP20 — payez sur le bon réseau",
      body: "L’escrow SocialsFlip n’accepte l’USDT que sur Tron (TRC20) et BNB Smart Chain (BEP20). Respectez le réseau affiché. Un mauvais réseau peut faire perdre les fonds.",
    },
    es: {
      title: "USDT TRC20 vs BEP20 — paga en la red correcta",
      body: "El escrow de SocialsFlip solo acepta USDT en Tron (TRC20) y BNB Smart Chain (BEP20). Coincide con la red del checkout. Enviar a la red incorrecta puede perder fondos.",
    },
  },
};

export function localizePost(
  post: { id: number; title: string; body: string; createdAt: string },
  locale: LocaleCode
) {
  const tr = BUILTIN[post.id]?.[locale];
  if (tr) return { ...post, title: tr.title, body: tr.body };
  if (locale === "en") return post;
  return {
    ...post,
    title: translateLoose(post.title, locale),
    body: translateLoose(post.body, locale),
  };
}
