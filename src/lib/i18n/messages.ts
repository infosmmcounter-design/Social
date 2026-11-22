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
  | "nav.deals"
  | "nav.account"
  | "nav.blog"
  | "nav.login"
  | "nav.signup"
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
  | "cat.youtube"
  | "cat.facebook"
  | "cat.tiktok"
  | "cat.instagram"
  | "cat.x"
  | "cat.ai"
  | "cat.freelance"
  | "cat.other"
  | "card.soldBy"
  | "card.monetized"
  | "card.notMonetized"
  | "card.noReviews"
  | "card.official"
  | "card.seller"
  | "card.listing"
  | "card.listings"
  | "chat.fab"
  | "chat.withEscrow"
  | "chat.myChats"
  | "chat.private"
  | "chat.empty"
  | "deals.title"
  | "deals.buying"
  | "deals.selling"
  | "deals.inProgress"
  | "deals.all"
  | "deals.emptyBuy"
  | "deals.emptySell"
  | "deals.browse"
  | "deals.login"
  | "deals.item"
  | "account.login"
  | "account.edit"
  | "account.view"
  | "account.wallet"
  | "account.walletHint"
  | "account.deposit"
  | "account.depositAmount"
  | "account.depositNote"
  | "account.applySell"
  | "account.buyer"
  | "account.seller"
  | "account.country"
  | "account.phone"
  | "account.bio"
  | "account.save"
  | "account.saved"
  | "account.days"
  | "account.emailPending"
  | "listings.freelanceIntro"
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
  | "listing.quantity"
  | "listing.qtyOver"
  | "listing.each"
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
  "nav.deals": "Deals",
  "nav.account": "Account",
  "nav.blog": "Blog",
  "nav.login": "Log in",
  "nav.signup": "Sign up",
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
  "cat.youtube": "YouTube",
  "cat.facebook": "Facebook",
  "cat.tiktok": "TikTok",
  "cat.instagram": "Instagram",
  "cat.x": "X (Twitter)",
  "cat.ai": "AI Tools",
  "cat.freelance": "Freelance Services",
  "cat.other": "Subscriptions & Other",
  "card.soldBy": "Sold by SocialsFlip",
  "card.monetized": "Monetized",
  "card.notMonetized": "Not monetized",
  "card.noReviews": "No reviews yet",
  "card.official": "Official store",
  "card.seller": "Seller",
  "card.listing": "listing",
  "card.listings": "listings",
  "chat.fab": "Chat",
  "chat.withEscrow": "Chat with Escrow",
  "chat.myChats": "My chats",
  "chat.private": "Private chat · deals protected by escrow",
  "chat.empty": "No chats yet. Open a listing to message a seller, or start an escrow chat below.",
  "deals.title": "My deals",
  "deals.buying": "Buying",
  "deals.selling": "Selling",
  "deals.inProgress": "In progress",
  "deals.all": "All deals",
  "deals.emptyBuy": "No purchases in progress right now.",
  "deals.emptySell": "No sales in progress right now.",
  "deals.browse": "Browse listings",
  "deals.login": "Log in to see the deals you are buying or selling.",
  "deals.item": "Item",
  "account.login": "Create an account to keep a profile, a personal wallet, and your deals.",
  "account.edit": "Edit profile",
  "account.view": "View profile",
  "account.wallet": "Wallet",
  "account.walletHint":
    "Send USDT to escrow, then submit the amount and transaction hash. Admin credits this wallet after checking the payment.",
  "account.deposit": "Submit deposit",
  "account.depositAmount": "Amount (USDT)",
  "account.depositNote": "Transaction hash or note",
  "account.applySell": "Apply to sell",
  "account.buyer": "Buyer",
  "account.seller": "Seller",
  "account.country": "Country",
  "account.phone": "Phone",
  "account.bio": "Bio",
  "account.save": "Save profile",
  "account.saved": "Profile saved.",
  "account.days": "Days",
  "account.emailPending": "Email not verified yet",
  "listings.freelanceIntro":
    "Freelance services — YouTube editing, Instagram growth, AI setup, and more. Buyers pay escrow; you deliver in chat.",
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
  "listing.quantity": "Quantity",
  "listing.qtyOver": "You are selecting more than the available stock.",
  "listing.each": "each",
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
  "nav.signup": "가입",
  "listing.yourName": "이름",
  "listing.yourEmail": "이메일",
  "help.chatEscrow": "에스크로와 채팅",
  "help.chatEscrowSub": "판매자 없이 에스크로와만 대화합니다.",
  "help.startEscrowChat": "에스크로 채팅 시작",
  "help.firstMessage": "무엇을 도와드릴까요?",
  "help.messagePlaceholder": "주문 번호나 결제 네트워크를 적어 주세요",
  "cat.youtube": "유튜브",
  "cat.facebook": "페이스북",
  "cat.tiktok": "틱톡",
  "cat.instagram": "인스타그램",
  "cat.x": "X (트위터)",
  "cat.ai": "AI 도구",
  "cat.freelance": "프리랜스 서비스",
  "cat.other": "구독 및 기타",
  "card.soldBy": "SocialsFlip 판매",
  "card.monetized": "수익화됨",
  "card.notMonetized": "미수익화",
  "card.noReviews": "아직 리뷰 없음",
  "card.official": "공식 스토어",
  "card.seller": "판매자",
  "card.listing": "리스팅",
  "card.listings": "리스팅",
  "chat.fab": "채팅",
  "chat.withEscrow": "에스크로와 채팅",
  "chat.myChats": "내 채팅",
  "listings.freelanceIntro": "프리랜스 서비스 — 유튜브 편집, 인스타그램 성장, AI 세팅 등. 구매자는 에스크로로 결제하고, 작업은 채팅으로 전달합니다.",
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
  "listing.quantity": "수량",
  "listing.qtyOver": "가용 재고보다 많이 선택했습니다.",
  "listing.each": "개당",
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
  "nav.signup": "إنشاء حساب",
  "listing.yourName": "اسمك",
  "listing.yourEmail": "بريدك",
  "help.chatEscrow": "محادثة مع الضمان",
  "help.chatEscrowSub": "محادثة مباشرة مع الضمان فقط، بدون البائع.",
  "help.startEscrowChat": "ابدأ المحادثة مع الضمان",
  "help.firstMessage": "كيف نساعدك؟",
  "help.messagePlaceholder": "اشرح المشكلة (رقم الطلب، شبكة الدفع…)",
  "cat.youtube": "يوتيوب",
  "cat.facebook": "فيسبوك",
  "cat.tiktok": "تيك توك",
  "cat.instagram": "إنستغرام",
  "cat.x": "إكس (تويتر)",
  "cat.ai": "أدوات الذكاء الاصطناعي",
  "cat.freelance": "خدمات العمل الحر",
  "cat.other": "اشتراكات وأخرى",
  "card.soldBy": "يبيعها SocialsFlip",
  "card.monetized": "مُفعّل الربح",
  "card.notMonetized": "غير مُفعّل الربح",
  "card.noReviews": "لا توجد مراجعات بعد",
  "card.official": "المتجر الرسمي",
  "card.seller": "البائع",
  "card.listing": "قائمة",
  "card.listings": "قوائم",
  "chat.fab": "محادثة",
  "chat.withEscrow": "محادثة مع الضمان",
  "chat.myChats": "محادثاتي",
  "listings.freelanceIntro": "خدمات العمل الحر — مونتاج يوتيوب، نمو إنستغرام، إعداد الذكاء الاصطناعي وغيرها. يدفع المشتري عبر الضمان، والتسليم يتم في المحادثة.",
  "nav.home": "الرئيسية",
  "nav.listings": "القوائم",
  "nav.sellers": "البائعون",
  "nav.createDeal": "إنشاء صفقة",
  "nav.sell": "بيع",
  "nav.chats": "المحادثات",
  "nav.orders": "الطلبات",
  "nav.deals": "الصفقات",
  "nav.account": "الحساب",
  "deals.title": "صفقاتي",
  "deals.buying": "أشتري",
  "deals.selling": "أبيع",
  "deals.emptyBuy": "لا توجد مشتريات جارية الآن.",
  "deals.browse": "تصفح القوائم",
  "account.wallet": "المحفظة",
  "account.edit": "تعديل الملف",
  "account.applySell": "قدّم للبيع",
  "account.deposit": "إرسال إيداع",
  "chat.private": "محادثة خاصة · الصفقات محمية بالضمان",
  "chat.empty": "لا توجد محادثات بعد. افتح قائمة لمراسلة البائع، أو ابدأ محادثة الضمان.",
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
  "listing.quantity": "الكمية",
  "listing.qtyOver": "أنت تختار أكثر من المخزون المتاح.",
  "listing.each": "للوحدة",
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
  "nav.signup": "注册",
  "listing.yourName": "你的名字",
  "listing.yourEmail": "你的邮箱",
  "help.chatEscrow": "与托管客服聊天",
  "help.chatEscrowSub": "只和托管客服聊，卖家不在这个房间。",
  "help.startEscrowChat": "开始托管聊天",
  "help.firstMessage": "需要什么帮助？",
  "help.messagePlaceholder": "写下问题（订单号、支付网络…）",
  "cat.youtube": "YouTube",
  "cat.facebook": "Facebook",
  "cat.tiktok": "TikTok",
  "cat.instagram": "Instagram",
  "cat.x": "X（推特）",
  "cat.ai": "AI 工具",
  "cat.freelance": "自由职业服务",
  "cat.other": "订阅及其他",
  "card.soldBy": "由 SocialsFlip 出售",
  "card.monetized": "已变现",
  "card.notMonetized": "未变现",
  "card.noReviews": "还没有评价",
  "card.official": "官方商店",
  "card.seller": "卖家",
  "card.listing": "个商品",
  "card.listings": "个商品",
  "chat.fab": "聊天",
  "chat.withEscrow": "与托管客服聊天",
  "chat.myChats": "我的聊天",
  "listings.freelanceIntro": "自由职业服务 — YouTube 剪辑、Instagram 增长、AI 搭建等。买家付托管，交付在聊天里完成。",
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
  "listing.quantity": "数量",
  "listing.qtyOver": "您选择的数量超过了可用库存。",
  "listing.each": "每件",
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
  "nav.signup": "登録",
  "listing.yourName": "お名前",
  "listing.yourEmail": "メール",
  "help.chatEscrow": "エスクローとチャット",
  "help.chatEscrowSub": "出品者なしで、エスクローとだけ話します。",
  "help.startEscrowChat": "エスクローチャットを開始",
  "help.firstMessage": "何をお手伝いしましょうか？",
  "help.messagePlaceholder": "内容を書いてください（注文番号、支払いネットワーク…）",
  "cat.youtube": "YouTube",
  "cat.facebook": "Facebook",
  "cat.tiktok": "TikTok",
  "cat.instagram": "Instagram",
  "cat.x": "X（ツイッター）",
  "cat.ai": "AIツール",
  "cat.freelance": "フリーランスサービス",
  "cat.other": "サブスクとその他",
  "card.soldBy": "SocialsFlipが販売",
  "card.monetized": "収益化済み",
  "card.notMonetized": "未収益化",
  "card.noReviews": "まだレビューはありません",
  "card.official": "公式ストア",
  "card.seller": "出品者",
  "card.listing": "件",
  "card.listings": "件",
  "chat.fab": "チャット",
  "chat.withEscrow": "エスクローとチャット",
  "chat.myChats": "自分のチャット",
  "listings.freelanceIntro": "フリーランスサービス — YouTube編集、Instagram成長、AI構築など。支払いはエスクロー、納品はチャットです。",
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
  "listing.quantity": "数量",
  "listing.qtyOver": "在庫数より多く選択しています。",
  "listing.each": "1件あたり",
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
  "nav.signup": "Регистрация",
  "listing.yourName": "Ваше имя",
  "listing.yourEmail": "Ваш email",
  "help.chatEscrow": "Чат с эскроу",
  "help.chatEscrowSub": "Только с эскроу, без продавца.",
  "help.startEscrowChat": "Начать чат с эскроу",
  "help.firstMessage": "Чем помочь?",
  "help.messagePlaceholder": "Опишите вопрос (номер заказа, сеть оплаты…)",
  "cat.youtube": "YouTube",
  "cat.facebook": "Facebook",
  "cat.tiktok": "TikTok",
  "cat.instagram": "Instagram",
  "cat.x": "X (Твиттер)",
  "cat.ai": "ИИ-инструменты",
  "cat.freelance": "Фриланс-услуги",
  "cat.other": "Подписки и другое",
  "card.soldBy": "Продаёт SocialsFlip",
  "card.monetized": "Монетизирован",
  "card.notMonetized": "Без монетизации",
  "card.noReviews": "Отзывов пока нет",
  "card.official": "Официальный магазин",
  "card.seller": "Продавец",
  "card.listing": "объявление",
  "card.listings": "объявлений",
  "chat.fab": "Чат",
  "chat.withEscrow": "Чат с эскроу",
  "chat.myChats": "Мои чаты",
  "listings.freelanceIntro": "Фриланс-услуги — монтаж YouTube, рост Instagram, настройка ИИ и другое. Покупатель платит в эскроу, сдача в чате.",
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
  "listing.quantity": "Количество",
  "listing.qtyOver": "Вы выбираете больше, чем есть в наличии.",
  "listing.each": "за шт.",
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
  "nav.signup": "Mag-sign up",
  "listing.yourName": "Pangalan",
  "listing.yourEmail": "Email",
  "help.chatEscrow": "Chat sa Escrow",
  "help.chatEscrowSub": "Diretsong chat sa escrow lang, walang seller.",
  "help.startEscrowChat": "Simulan ang chat sa escrow",
  "help.firstMessage": "Paano kami makakatulong?",
  "help.messagePlaceholder": "Ilarawan ang issue (order #, payment network…)",
  "cat.youtube": "YouTube",
  "cat.facebook": "Facebook",
  "cat.tiktok": "TikTok",
  "cat.instagram": "Instagram",
  "cat.x": "X (Twitter)",
  "cat.ai": "AI Tools",
  "cat.freelance": "Freelance Services",
  "cat.other": "Subscriptions at iba",
  "card.soldBy": "Binebenta ng SocialsFlip",
  "card.monetized": "Monetized",
  "card.notMonetized": "Hindi monetized",
  "card.noReviews": "Wala pang review",
  "card.official": "Opisyal na tindahan",
  "card.seller": "Seller",
  "card.listing": "listing",
  "card.listings": "listings",
  "chat.fab": "Chat",
  "chat.withEscrow": "Chat sa Escrow",
  "chat.myChats": "Mga chat ko",
  "listings.freelanceIntro": "Freelance services — YouTube editing, Instagram growth, AI setup, at iba pa. Escrow ang bayad; sa chat ang delivery.",
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
  "listing.quantity": "Dami",
  "listing.qtyOver": "Mas mataas ang pinili mo kaysa sa available na stock.",
  "listing.each": "bawat isa",
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
  "nav.signup": "Registrieren",
  "listing.yourName": "Ihr Name",
  "listing.yourEmail": "Ihre E-Mail",
  "help.chatEscrow": "Chat mit Escrow",
  "help.chatEscrowSub": "Nur mit dem Escrow, ohne Verkäufer.",
  "help.startEscrowChat": "Escrow-Chat starten",
  "help.firstMessage": "Wobei können wir helfen?",
  "help.messagePlaceholder": "Problem beschreiben (Bestellnr., Zahlungsnetzwerk…)",
  "cat.youtube": "YouTube",
  "cat.facebook": "Facebook",
  "cat.tiktok": "TikTok",
  "cat.instagram": "Instagram",
  "cat.x": "X (Twitter)",
  "cat.ai": "KI-Tools",
  "cat.freelance": "Freelance-Dienste",
  "cat.other": "Abos und mehr",
  "card.soldBy": "Verkauft von SocialsFlip",
  "card.monetized": "Monetarisiert",
  "card.notMonetized": "Nicht monetarisiert",
  "card.noReviews": "Noch keine Bewertungen",
  "card.official": "Offizieller Shop",
  "card.seller": "Verkäufer",
  "card.listing": "Angebot",
  "card.listings": "Angebote",
  "chat.fab": "Chat",
  "chat.withEscrow": "Chat mit Escrow",
  "chat.myChats": "Meine Chats",
  "listings.freelanceIntro": "Freelance-Dienste — YouTube-Schnitt, Instagram-Wachstum, KI-Setup und mehr. Käufer zahlen in Escrow, Lieferung im Chat.",
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
  "listing.quantity": "Menge",
  "listing.qtyOver": "Sie wählen mehr als den verfügbaren Bestand.",
  "listing.each": "pro Stück",
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
  "nav.signup": "Inscription",
  "listing.yourName": "Votre nom",
  "listing.yourEmail": "Votre e-mail",
  "help.chatEscrow": "Chat avec l’escrow",
  "help.chatEscrowSub": "Discussion directe avec l’escrow, sans le vendeur.",
  "help.startEscrowChat": "Démarrer le chat escrow",
  "help.firstMessage": "Comment pouvons-nous aider ?",
  "help.messagePlaceholder": "Décrivez le problème (n° de commande, réseau…)",
  "cat.youtube": "YouTube",
  "cat.facebook": "Facebook",
  "cat.tiktok": "TikTok",
  "cat.instagram": "Instagram",
  "cat.x": "X (Twitter)",
  "cat.ai": "Outils IA",
  "cat.freelance": "Services freelance",
  "cat.other": "Abonnements et autres",
  "card.soldBy": "Vendu par SocialsFlip",
  "card.monetized": "Monétisé",
  "card.notMonetized": "Non monétisé",
  "card.noReviews": "Pas encore d’avis",
  "card.official": "Boutique officielle",
  "card.seller": "Vendeur",
  "card.listing": "annonce",
  "card.listings": "annonces",
  "chat.fab": "Chat",
  "chat.withEscrow": "Chat avec l’escrow",
  "chat.myChats": "Mes chats",
  "listings.freelanceIntro": "Services freelance — montage YouTube, croissance Instagram, setup IA et plus. Paiement en escrow, livraison dans le chat.",
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
  "listing.quantity": "Quantité",
  "listing.qtyOver": "Vous sélectionnez plus que le stock disponible.",
  "listing.each": "l'unité",
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
  "nav.signup": "Registrarse",
  "listing.yourName": "Tu nombre",
  "listing.yourEmail": "Tu correo",
  "help.chatEscrow": "Chat con el escrow",
  "help.chatEscrowSub": "Chat directo solo con el escrow, sin el vendedor.",
  "help.startEscrowChat": "Empezar chat con el escrow",
  "help.firstMessage": "¿Cómo podemos ayudar?",
  "help.messagePlaceholder": "Describe el problema (n.º de pedido, red de pago…)",
  "cat.youtube": "YouTube",
  "cat.facebook": "Facebook",
  "cat.tiktok": "TikTok",
  "cat.instagram": "Instagram",
  "cat.x": "X (Twitter)",
  "cat.ai": "Herramientas de IA",
  "cat.freelance": "Servicios freelance",
  "cat.other": "Suscripciones y más",
  "card.soldBy": "Vendido por SocialsFlip",
  "card.monetized": "Monetizado",
  "card.notMonetized": "Sin monetizar",
  "card.noReviews": "Aún no hay reseñas",
  "card.official": "Tienda oficial",
  "card.seller": "Vendedor",
  "card.listing": "anuncio",
  "card.listings": "anuncios",
  "chat.fab": "Chat",
  "chat.withEscrow": "Chat con el escrow",
  "chat.myChats": "Mis chats",
  "listings.freelanceIntro": "Servicios freelance — edición de YouTube, crecimiento de Instagram, setup de IA y más. El comprador paga en escrow y la entrega es por chat.",
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
  "listing.quantity": "Cantidad",
  "listing.qtyOver": "Estás eligiendo más que el stock disponible.",
  "listing.each": "por unidad",
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
