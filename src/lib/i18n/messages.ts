import type { LocaleCode } from "./locales";

/** Core UI dictionary — every locale must cover these keys (fallback → en). */
export type MsgKey =
  | "nav.home"
  | "nav.listings"
  | "nav.services"
  | "nav.sellers"
  | "nav.createDeal"
  | "nav.sell"
  | "nav.chats"
  | "nav.orders"
  | "nav.blog"
  | "nav.login"
  | "nav.logout"
  | "nav.admin"
  | "nav.dashboard"
  | "nav.language"
  | "nav.help"
  | "nav.privacy"
  | "home.kicker"
  | "home.headline"
  | "home.sub"
  | "home.search"
  | "home.searchBtn"
  | "home.browse"
  | "home.listings"
  | "home.services"
  | "home.accounts"
  | "home.sellers"
  | "home.all"
  | "home.newest"
  | "home.priceAsc"
  | "home.priceDesc"
  | "home.noListings"
  | "home.noSellers"
  | "freelance.badge"
  | "freelance.delivery"
  | "freelance.revisions"
  | "freelance.days"
  | "freelance.orderGig"
  | "freelance.notes"
  | "freelance.sla"
  | "freelance.sold"
  | "freelance.purchased"
  | "freelance.soldTimes"
  | "common.available"
  | "common.soldOut"
  | "common.loading"
  | "common.verified"
  | "common.price"
  | "common.escrowFee"
  | "common.total"
  | "listing.back"
  | "listing.privateHidden"
  | "listing.requestPrivate"
  | "listing.viewSeller"
  | "listing.startEscrow"
  | "listing.guestNote"
  | "listing.stockLabel"
  | "listing.sla"
  | "listing.yourName"
  | "listing.yourEmail"
  | "listing.transferNotes"
  | "listing.payWith"
  | "listing.buyNow"
  | "listing.opening"
  | "deal.escrowPay"
  | "deal.iPaid"
  | "deal.comeAgain"
  | "deal.chat"
  | "deal.asEscrow"
  | "deal.send"
  | "deal.deliverySla"
  | "deal.claimRefund"
  | "deal.cancel"
  | "deal.holdGuide"
  | "createDeal.title"
  | "createDeal.sub"
  | "createDeal.copy"
  | "createDeal.create"
  | "createDeal.privateOptional"
  | "offer.guideTitle"
  | "offer.payEscrow"
  | "offer.creatorPaidByUs"
  | "orders.title"
  | "orders.track"
  | "blog.title"
  | "seo.title"
  | "seo.description"
  | "footer.escrow"
  | "help.title"
  | "help.sub"
  | "help.contact"
  | "help.contactBody"
  | "help.faq"
  | "help.escrowBadge"
  | "help.chatEscrow"
  | "help.chatEscrowSub"
  | "help.startEscrowChat"
  | "help.firstMessage"
  | "help.messagePlaceholder"
  | "help.orEmail"
  | "help.quickLinks"
  | "privacy.title"
  | "privacy.updated"
  | "privacy.s1Title"
  | "privacy.s1Body"
  | "privacy.s2Title"
  | "privacy.s2Body"
  | "privacy.s3Title"
  | "privacy.s3Body"
  | "privacy.s4Title"
  | "privacy.s4Body"
  | "privacy.s5Title"
  | "privacy.s5Body"
  | "privacy.s6Title"
  | "privacy.s6Body"
  | "reviews.buyerReviews"
  | "reviews.publicNote"
  | "reviews.none"
  | "reviews.reviewSeller"
  | "reviews.rating"
  | "reviews.yourReview"
  | "reviews.writeInYourLang"
  | "reviews.post"
  | "reviews.buyerLanguage"
  | "reviews.shownInBuyerLang";

type Dict = Record<MsgKey, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.listings": "Listings",
  "nav.services": "Services",
  "nav.sellers": "Sellers",
  "nav.createDeal": "Create deal",
  "nav.sell": "Sell",
  "nav.chats": "Chats",
  "nav.orders": "Orders",
  "nav.blog": "Blog",
  "nav.login": "Log in",
  "nav.logout": "Log out",
  "nav.admin": "Admin",
  "nav.dashboard": "Dashboard",
  "nav.language": "Language",
  "nav.help": "Help & Support",
  "nav.privacy": "Privacy Policy",
  "home.kicker": "Escrow-protected marketplace",
  "home.headline": "Buy social accounts, freelance services & tools with confidence.",
  "home.sub":
    "Pay USDT (TRC20 / BEP20) into escrow. Chat with seller and admin until delivery is confirmed.",
  "home.search": "Search listings on this page",
  "home.searchBtn": "Search",
  "home.browse": "Browse",
  "home.listings": "Listings",
  "home.services": "Freelance",
  "home.accounts": "Accounts",
  "home.sellers": "Sellers",
  "home.all": "All",
  "home.newest": "Newest",
  "home.priceAsc": "Price: low → high",
  "home.priceDesc": "Price: high → low",
  "home.noListings": "No listings match this filter.",
  "home.noSellers": "No sellers yet.",
  "freelance.badge": "Freelance gig",
  "freelance.delivery": "Delivery",
  "freelance.revisions": "Revisions",
  "freelance.days": "days",
  "freelance.orderGig": "Order this gig / Start escrow",
  "freelance.notes": "What you need from the freelancers (brief, links, files…)",
  "freelance.sla":
    "After payment is held, the freelancers deliver in the stated delivery window. Revisions included are listed on the gig.",
  "freelance.sold": "sold",
  "freelance.purchased": "Purchased by customers",
  "freelance.soldTimes": "times sold",
  "common.available": "available",
  "common.soldOut": "Sold out",
  "common.loading": "Loading…",
  "common.verified": "Verified",
  "common.price": "Price",
  "common.escrowFee": "Escrow fee",
  "common.total": "Total",
  "listing.back": "Back",
  "listing.privateHidden":
    "Hidden until escrow deal starts or seller/admin approves your request.",
  "listing.requestPrivate": "Request private details",
  "listing.viewSeller": "View seller profile",
  "listing.startEscrow": "Start Escrow Deal",
  "listing.guestNote":
    "Guests can buy without an account. A 3-way chat opens with Buyer, Seller, and Admin.",
  "listing.stockLabel": "Available stock",
  "listing.sla":
    "After payment is held in escrow, the seller has 24 hours to deliver. If they miss it, you can cancel or claim a refund.",
  "listing.yourName": "Your name",
  "listing.yourEmail": "Your email",
  "listing.transferNotes": "Transfer details / notes",
  "listing.payWith": "Pay with (crypto only)",
  "listing.buyNow": "Buy Now / Start Escrow Deal",
  "listing.opening": "Opening deal…",
  "deal.escrowPay": "Escrow crypto payment",
  "deal.iPaid": "I have made the payment",
  "deal.comeAgain": "I'll come again",
  "deal.chat": "Deal chat",
  "deal.asEscrow": "As Escrow",
  "deal.send": "Send",
  "deal.deliverySla": "Seller must deliver within the delivery window",
  "deal.claimRefund": "Claim refund (24h missed)",
  "deal.cancel": "Cancel deal",
  "deal.holdGuide":
    "Funds stay held in SocialsFlip escrow until the deal is completed (typically up to 7 days, or until you confirm delivery). Never pay the seller directly.",
  "createDeal.title": "Create a deal link",
  "createDeal.sub":
    "Copy the link and send it to your buyer. They pay SocialsFlip escrow — not you directly.",
  "createDeal.copy": "Copy link",
  "createDeal.create": "Create deal & get link",
  "createDeal.privateOptional": "Private handle / URL (optional)",
  "offer.guideTitle": "Buyer guide — how this deal works",
  "offer.payEscrow": "Pay escrow & open deal chat",
  "offer.creatorPaidByUs": "Paid by SocialsFlip escrow after delivery",
  "orders.title": "Track your order",
  "orders.track": "Open escrow deal room",
  "blog.title": "Blog",
  "seo.title":
    "SocialsFlip: Buy Social Accounts & Freelance Services (YouTube, IG, AI)",
  "seo.description":
    "Escrow-protected marketplace for social accounts and Fiverr-style freelance gigs (YouTube, Facebook, Instagram, AI tools). Pay USDT TRC20/BEP20 — funds held until delivery.",
  "footer.escrow": "Escrow-held payments on marketplace orders",
  "help.title": "Help & Support",
  "help.sub":
    "Escrow deals, freelance gigs, payments, and reviews — quick answers.",
  "help.contact": "Contact support",
  "help.contactBody":
    "For open deals, use the deal chat (buyer + seller + escrow). For account or payment questions, chat with Escrow below.",
  "help.faq": "FAQ",
  "help.escrowBadge": "Direct escrow support",
  "help.chatEscrow": "Chat with Escrow",
  "help.chatEscrowSub":
    "Talk only with SocialsFlip escrow moderators — no seller in this room. Use for payment issues, disputes, or marketplace help.",
  "help.startEscrowChat": "Start chat with Escrow",
  "help.firstMessage": "How can we help?",
  "help.messagePlaceholder": "Describe your issue (order #, payment network…)",
  "help.orEmail": "Or email",
  "help.quickLinks": "Quick links",
  "privacy.title": "Privacy Policy",
  "privacy.updated": "Last updated: November 2026",
  "privacy.s1Title": "1. What we collect",
  "privacy.s1Body":
    "We collect account details you provide (name, email, country), listing content, deal chat messages, payment proofs (transaction hashes), and buyer reviews. Crypto payments go to escrow wallets — we do not store private keys or card numbers.",
  "privacy.s2Title": "2. How we use data",
  "privacy.s2Body":
    "Data is used to run escrow deals, moderate disputes, show public seller ratings, prevent fraud, and improve SocialsFlip. Public profiles show seller name, bio, ratings, and listings. Buyer reviews are public and shown in the language the buyer selected when writing them.",
  "privacy.s3Title": "3. Reviews & language",
  "privacy.s3Body":
    "When a buyer reviews a seller after a completed deal, the review text is stored and displayed publicly in the buyer’s selected language. We do not auto-translate user reviews. Language UI chrome (buttons, labels) still follows the visitor’s language switcher.",
  "privacy.s4Title": "4. Sharing",
  "privacy.s4Body":
    "We share data with escrow moderators as needed for deals, and with payment networks only as required to verify USDT transfers. We do not sell personal data.",
  "privacy.s5Title": "5. Retention & security",
  "privacy.s5Body":
    "Deal records and chats are kept for dispute handling and compliance. Access is limited to authorized admins. Use a strong password and never share credentials outside escrow chat.",
  "privacy.s6Title": "6. Contact",
  "privacy.s6Body":
    "Questions about privacy: privacy@socialsflip.com. For deal support, use Help & Support or your deal chat.",
  "reviews.buyerReviews": "Buyer reviews",
  "reviews.publicNote":
    "Reviews are public and shown in the language each buyer selected when posting.",
  "reviews.none": "No reviews yet.",
  "reviews.reviewSeller": "Review the seller",
  "reviews.rating": "Rating",
  "reviews.yourReview": "Your review",
  "reviews.writeInYourLang":
    "Write in your selected language — it stays public in that language.",
  "reviews.post": "Post public review",
  "reviews.buyerLanguage": "Buyer’s language",
  "reviews.shownInBuyerLang": "Shown in buyer’s language",
};

/** Partial overrides per locale; missing keys fall back to English. */
const ko: Partial<Dict> = {
  "nav.home": "홈",
  "nav.listings": "리스팅",
  "nav.services": "프리랜스",
  "nav.sellers": "판매자",
  "home.services": "프리랜스",
  "home.accounts": "계정",
  "freelance.badge": "프리랜스 긱",
  "nav.createDeal": "딜 만들기",
  "nav.sell": "판매",
  "nav.chats": "채팅",
  "nav.orders": "주문",
  "nav.blog": "블로그",
  "nav.login": "로그인",
  "nav.logout": "로그아웃",
  "nav.language": "언어",
  "home.kicker": "에스크로 보호 마켓플레이스",
  "home.headline": "소셜 계정·서비스·툴을 안전하게 구매하세요.",
  "home.sub":
    "USDT(TRC20/BEP20)를 에스크로로 결제하고, 배송 확인까지 판매자·관리자와 채팅하세요.",
  "home.search": "이 페이지에서 검색",
  "home.searchBtn": "검색",
  "home.browse": "둘러보기",
  "home.listings": "리스팅",
  "home.sellers": "판매자",
  "home.all": "전체",
  "common.available": "재고",
  "common.soldOut": "품절",
  "common.loading": "로딩 중…",
  "listing.startEscrow": "에스크로 딜 시작",
  "listing.buyNow": "구매 / 에스크로 시작",
  "listing.stockLabel": "가용 재고",
  "deal.escrowPay": "에스크로 암호화폐 결제",
  "deal.iPaid": "결제했습니다",
  "deal.chat": "딜 채팅",
  "createDeal.title": "딜 링크 만들기",
  "createDeal.create": "딜 생성 및 링크 받기",
  "offer.payEscrow": "에스크로 결제 및 채팅 열기",
  "orders.title": "주문 추적",
  "blog.title": "블로그",
  "seo.title": "SocialsFlip: 소셜 계정·서비스·툴 구매",
  "seo.description":
    "에스크로로 보호되는 소셜 마켓플레이스. USDT TRC20/BEP20 결제, 배송까지 자금 보관.",
};

const ar: Partial<Dict> = {
  "nav.home": "الرئيسية",
  "nav.listings": "القوائم",
  "nav.sellers": "البائعون",
  "nav.createDeal": "إنشاء صفقة",
  "nav.sell": "بيع",
  "nav.chats": "المحادثات",
  "nav.orders": "الطلبات",
  "nav.blog": "المدونة",
  "nav.login": "تسجيل الدخول",
  "nav.logout": "تسجيل الخروج",
  "nav.language": "اللغة",
  "home.kicker": "سوق محمي بالضمان",
  "home.headline": "اشترِ حسابات وخدمات وأدوات التواصل بثقة.",
  "home.sub":
    "ادفع USDT (TRC20 / BEP20) إلى الضمان. تحدث مع البائع والمشرف حتى تأكيد التسليم.",
  "home.search": "ابحث في هذه الصفحة",
  "home.searchBtn": "بحث",
  "home.browse": "تصفح",
  "home.listings": "القوائم",
  "home.sellers": "البائعون",
  "home.all": "الكل",
  "common.available": "متاح",
  "common.soldOut": "نفد المخزون",
  "common.loading": "جاري التحميل…",
  "listing.startEscrow": "بدء صفقة الضمان",
  "listing.buyNow": "اشترِ الآن / ابدأ الضمان",
  "listing.stockLabel": "المخزون المتاح",
  "deal.escrowPay": "دفع العملة المشفرة للضمان",
  "deal.iPaid": "لقد قمت بالدفع",
  "deal.chat": "محادثة الصفقة",
  "createDeal.title": "إنشاء رابط صفقة",
  "createDeal.create": "إنشاء الصفقة والحصول على الرابط",
  "offer.payEscrow": "ادفع للضمان وافتح المحادثة",
  "orders.title": "تتبع طلبك",
  "blog.title": "المدونة",
  "seo.title": "SocialsFlip: شراء حسابات وخدمات التواصل",
  "seo.description":
    "سوق محمي بالضمان للحسابات والخدمات. ادفع USDT TRC20/BEP20 — تُحتجز الأموال حتى التسليم.",
};

const zh: Partial<Dict> = {
  "nav.home": "首页",
  "nav.listings": "商品",
  "nav.sellers": "卖家",
  "nav.createDeal": "创建交易",
  "nav.sell": "出售",
  "nav.chats": "聊天",
  "nav.orders": "订单",
  "nav.blog": "博客",
  "nav.login": "登录",
  "nav.logout": "退出",
  "nav.language": "语言",
  "home.kicker": "托管保护的市场",
  "home.headline": "放心购买社交账号、服务与工具。",
  "home.sub": "将 USDT（TRC20/BEP20）支付到托管。确认交付前与卖家和管理员聊天。",
  "home.search": "在本页搜索",
  "home.searchBtn": "搜索",
  "home.browse": "浏览",
  "home.listings": "商品",
  "home.sellers": "卖家",
  "home.all": "全部",
  "common.available": "可售",
  "common.soldOut": "售罄",
  "common.loading": "加载中…",
  "listing.startEscrow": "开始托管交易",
  "listing.buyNow": "立即购买 / 开始托管",
  "listing.stockLabel": "可用库存",
  "deal.escrowPay": "托管加密支付",
  "deal.iPaid": "我已付款",
  "deal.chat": "交易聊天",
  "createDeal.title": "创建交易链接",
  "createDeal.create": "创建交易并获取链接",
  "offer.payEscrow": "支付托管并打开聊天",
  "orders.title": "追踪订单",
  "blog.title": "博客",
  "seo.title": "SocialsFlip：购买社交媒体账号、服务与工具",
  "seo.description":
    "托管保护的社交市场。使用 USDT TRC20/BEP20 支付——资金保管至交付完成。",
};

const ja: Partial<Dict> = {
  "nav.home": "ホーム",
  "nav.listings": "出品",
  "nav.sellers": "出品者",
  "nav.createDeal": "取引を作成",
  "nav.sell": "販売",
  "nav.chats": "チャット",
  "nav.orders": "注文",
  "nav.blog": "ブログ",
  "nav.login": "ログイン",
  "nav.logout": "ログアウト",
  "nav.language": "言語",
  "home.kicker": "エスクロー保護マーケット",
  "home.headline": "ソーシャルアカウント・サービス・ツールを安心して購入。",
  "home.sub":
    "USDT（TRC20/BEP20）をエスクローへ。納品確認まで出品者と管理者とチャット。",
  "home.search": "このページで検索",
  "home.searchBtn": "検索",
  "home.browse": "見る",
  "home.listings": "出品",
  "home.sellers": "出品者",
  "home.all": "すべて",
  "common.available": "在庫あり",
  "common.soldOut": "売り切れ",
  "common.loading": "読み込み中…",
  "listing.startEscrow": "エスクロー取引を開始",
  "listing.buyNow": "購入 / エスクロー開始",
  "listing.stockLabel": "在庫",
  "deal.escrowPay": "エスクロー暗号決済",
  "deal.iPaid": "支払い済み",
  "deal.chat": "取引チャット",
  "createDeal.title": "取引リンクを作成",
  "createDeal.create": "取引を作成してリンク取得",
  "offer.payEscrow": "エスクロー支払い＆チャット開始",
  "orders.title": "注文を追跡",
  "blog.title": "ブログ",
  "seo.title": "SocialsFlip：SNSアカウント・サービス・ツール購入",
  "seo.description":
    "エスクロー保護のSNSマーケット。USDT TRC20/BEP20で支払い—納品まで資金を保管。",
};

const ru: Partial<Dict> = {
  "nav.home": "Главная",
  "nav.listings": "Объявления",
  "nav.sellers": "Продавцы",
  "nav.createDeal": "Создать сделку",
  "nav.sell": "Продать",
  "nav.chats": "Чаты",
  "nav.orders": "Заказы",
  "nav.blog": "Блог",
  "nav.login": "Войти",
  "nav.logout": "Выйти",
  "nav.language": "Язык",
  "home.kicker": "Маркетплейс с эскроу",
  "home.headline": "Покупайте соцсчета, услуги и инструменты безопасно.",
  "home.sub":
    "Платите USDT (TRC20/BEP20) на эскроу. Общайтесь с продавцом и админом до подтверждения.",
  "home.search": "Поиск на этой странице",
  "home.searchBtn": "Искать",
  "home.browse": "Обзор",
  "home.listings": "Объявления",
  "home.sellers": "Продавцы",
  "home.all": "Все",
  "common.available": "в наличии",
  "common.soldOut": "Нет в наличии",
  "common.loading": "Загрузка…",
  "listing.startEscrow": "Начать эскроу-сделку",
  "listing.buyNow": "Купить / Начать эскроу",
  "listing.stockLabel": "Доступный запас",
  "deal.escrowPay": "Крипто-оплата в эскроу",
  "deal.iPaid": "Я оплатил",
  "deal.chat": "Чат сделки",
  "createDeal.title": "Создать ссылку на сделку",
  "createDeal.create": "Создать сделку и получить ссылку",
  "offer.payEscrow": "Оплатить эскроу и открыть чат",
  "orders.title": "Отследить заказ",
  "blog.title": "Блог",
  "seo.title": "SocialsFlip: покупка соцаккаунтов, услуг и инструментов",
  "seo.description":
    "Маркетплейс с эскроу. Оплата USDT TRC20/BEP20 — средства удерживаются до передачи.",
};

const fil: Partial<Dict> = {
  "nav.home": "Home",
  "nav.listings": "Mga listing",
  "nav.sellers": "Mga seller",
  "nav.createDeal": "Gumawa ng deal",
  "nav.sell": "Magbenta",
  "nav.chats": "Mga chat",
  "nav.orders": "Mga order",
  "nav.blog": "Blog",
  "nav.login": "Mag-login",
  "nav.logout": "Mag-logout",
  "nav.language": "Wika",
  "home.kicker": "Marketplace na protektado ng escrow",
  "home.headline": "Bumili ng social accounts, services at tools nang ligtas.",
  "home.sub":
    "Magbayad ng USDT (TRC20/BEP20) sa escrow. Makipag-chat sa seller at admin hanggang ma-confirm ang delivery.",
  "home.search": "Maghanap sa page na ito",
  "home.searchBtn": "Hanapin",
  "home.browse": "Mag-browse",
  "home.listings": "Mga listing",
  "home.sellers": "Mga seller",
  "home.all": "Lahat",
  "common.available": "available",
  "common.soldOut": "Sold out",
  "common.loading": "Naglo-load…",
  "listing.startEscrow": "Simulan ang Escrow Deal",
  "listing.buyNow": "Bumili / Simulan ang Escrow",
  "listing.stockLabel": "Available stock",
  "deal.escrowPay": "Escrow crypto payment",
  "deal.iPaid": "Nagbayad na ako",
  "deal.chat": "Deal chat",
  "createDeal.title": "Gumawa ng deal link",
  "createDeal.create": "Gumawa ng deal at kunin ang link",
  "offer.payEscrow": "Magbayad sa escrow at buksan ang chat",
  "orders.title": "I-track ang order",
  "blog.title": "Blog",
  "seo.title": "SocialsFlip: Bumili ng Social Media Accounts, Services at Tools",
  "seo.description":
    "Escrow-protected marketplace. Magbayad ng USDT TRC20/BEP20 — hawak ang bayad hanggang delivery.",
};

const de: Partial<Dict> = {
  "nav.home": "Start",
  "nav.listings": "Angebote",
  "nav.sellers": "Verkäufer",
  "nav.createDeal": "Deal erstellen",
  "nav.sell": "Verkaufen",
  "nav.chats": "Chats",
  "nav.orders": "Bestellungen",
  "nav.blog": "Blog",
  "nav.login": "Anmelden",
  "nav.logout": "Abmelden",
  "nav.language": "Sprache",
  "home.kicker": "Treuhand-geschützter Marktplatz",
  "home.headline": "Social-Accounts, Services & Tools sicher kaufen.",
  "home.sub":
    "Zahlen Sie USDT (TRC20/BEP20) in Escrow. Chatten Sie mit Verkäufer und Admin bis zur Lieferung.",
  "home.search": "Auf dieser Seite suchen",
  "home.searchBtn": "Suchen",
  "home.browse": "Stöbern",
  "home.listings": "Angebote",
  "home.sellers": "Verkäufer",
  "home.all": "Alle",
  "common.available": "verfügbar",
  "common.soldOut": "Ausverkauft",
  "common.loading": "Lädt…",
  "listing.startEscrow": "Escrow-Deal starten",
  "listing.buyNow": "Jetzt kaufen / Escrow starten",
  "listing.stockLabel": "Verfügbarer Bestand",
  "deal.escrowPay": "Escrow-Krypto-Zahlung",
  "deal.iPaid": "Ich habe bezahlt",
  "deal.chat": "Deal-Chat",
  "createDeal.title": "Deal-Link erstellen",
  "createDeal.create": "Deal erstellen & Link holen",
  "offer.payEscrow": "Escrow zahlen & Chat öffnen",
  "orders.title": "Bestellung verfolgen",
  "blog.title": "Blog",
  "seo.title": "SocialsFlip: Social-Accounts, Services und Tools kaufen",
  "seo.description":
    "Escrow-geschützter Marktplatz. Zahlen Sie USDT TRC20/BEP20 — Gelder bis zur Lieferung verwahrt.",
};

const fr: Partial<Dict> = {
  "nav.home": "Accueil",
  "nav.listings": "Annonces",
  "nav.sellers": "Vendeurs",
  "nav.createDeal": "Créer une offre",
  "nav.sell": "Vendre",
  "nav.chats": "Chats",
  "nav.orders": "Commandes",
  "nav.blog": "Blog",
  "nav.login": "Connexion",
  "nav.logout": "Déconnexion",
  "nav.language": "Langue",
  "home.kicker": "Marketplace protégée par séquestre",
  "home.headline": "Achetez comptes, services et outils en toute confiance.",
  "home.sub":
    "Payez en USDT (TRC20/BEP20) en séquestre. Discutez avec le vendeur et l’admin jusqu’à la livraison.",
  "home.search": "Rechercher sur cette page",
  "home.searchBtn": "Rechercher",
  "home.browse": "Parcourir",
  "home.listings": "Annonces",
  "home.sellers": "Vendeurs",
  "home.all": "Tous",
  "common.available": "disponible",
  "common.soldOut": "Épuisé",
  "common.loading": "Chargement…",
  "listing.startEscrow": "Démarrer l’escrow",
  "listing.buyNow": "Acheter / Démarrer l’escrow",
  "listing.stockLabel": "Stock disponible",
  "deal.escrowPay": "Paiement crypto en séquestre",
  "deal.iPaid": "J’ai payé",
  "deal.chat": "Chat de l’offre",
  "createDeal.title": "Créer un lien d’offre",
  "createDeal.create": "Créer l’offre et obtenir le lien",
  "offer.payEscrow": "Payer l’escrow et ouvrir le chat",
  "orders.title": "Suivre votre commande",
  "blog.title": "Blog",
  "seo.title": "SocialsFlip : acheter comptes, services et outils sociaux",
  "seo.description":
    "Marketplace protégée par séquestre. Payez en USDT TRC20/BEP20 — fonds retenus jusqu’à la livraison.",
};

const es: Partial<Dict> = {
  "nav.home": "Inicio",
  "nav.listings": "Anuncios",
  "nav.sellers": "Vendedores",
  "nav.createDeal": "Crear trato",
  "nav.sell": "Vender",
  "nav.chats": "Chats",
  "nav.orders": "Pedidos",
  "nav.blog": "Blog",
  "nav.login": "Iniciar sesión",
  "nav.logout": "Cerrar sesión",
  "nav.language": "Idioma",
  "home.kicker": "Marketplace protegido con escrow",
  "home.headline": "Compra cuentas, servicios y herramientas con confianza.",
  "home.sub":
    "Paga USDT (TRC20/BEP20) en escrow. Habla con el vendedor y el admin hasta confirmar la entrega.",
  "home.search": "Buscar en esta página",
  "home.searchBtn": "Buscar",
  "home.browse": "Explorar",
  "home.listings": "Anuncios",
  "home.sellers": "Vendedores",
  "home.all": "Todos",
  "common.available": "disponible",
  "common.soldOut": "Agotado",
  "common.loading": "Cargando…",
  "listing.startEscrow": "Iniciar trato escrow",
  "listing.buyNow": "Comprar / Iniciar escrow",
  "listing.stockLabel": "Stock disponible",
  "deal.escrowPay": "Pago cripto en escrow",
  "deal.iPaid": "Ya pagué",
  "deal.chat": "Chat del trato",
  "createDeal.title": "Crear enlace de trato",
  "createDeal.create": "Crear trato y obtener enlace",
  "offer.payEscrow": "Pagar escrow y abrir chat",
  "orders.title": "Seguir tu pedido",
  "blog.title": "Blog",
  "seo.title": "SocialsFlip: compra cuentas, servicios y herramientas",
  "seo.description":
    "Marketplace con escrow. Paga USDT TRC20/BEP20 — fondos retenidos hasta la entrega.",
};

const TABLE: Record<LocaleCode, Partial<Dict>> = {
  en,
  ko,
  ar,
  zh,
  ja,
  ru,
  fil,
  de,
  fr,
  es,
};

export function t(locale: LocaleCode, key: MsgKey): string {
  return TABLE[locale]?.[key] || en[key] || key;
}

export function dictFor(locale: LocaleCode): Dict {
  const out = { ...en };
  const partial = TABLE[locale] || {};
  for (const k of Object.keys(partial) as MsgKey[]) {
    const v = partial[k];
    if (v) out[k] = v;
  }
  return out;
}
