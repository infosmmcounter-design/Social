"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { money } from "@/lib/constants";
import { CatIcon } from "@/components/Icons";
import {
  DEAL_STATUS_LABEL,
  FREELANCE_GIG_IDEAS,
  isFreelanceCategory,
  type Category,
  type DealStatus,
} from "@/lib/types";

const SELL_BOARDS: [Category, string][] = [
  ["youtube", "YouTube"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["facebook", "Facebook"],
  ["freelance", "Freelance service"],
  ["ai", "AI Tools"],
];
import { LocaleLink as Link } from "@/components/LocaleLink";
import { StartEscrowChat } from "@/components/StartEscrowChat";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

export default function SellerDashboard() {
  const { user, loading, refresh: refreshAuth, setUser } = useAuth();
  const { locale, t } = useLang();
  const router = useRouter();
  const [listings, setListings] = useState<
    {
      id: number;
      title: string;
      price: number;
      status: string;
      listed: boolean;
      cat: string;
      stock?: number;
      soldCount?: number;
      listingType?: string;
      isFreelance?: boolean;
    }[]
  >([]);
  const [orders, setOrders] = useState<
    { id: number; title: string; total: number; status: DealStatus }[]
  >([]);
  const [offers, setOffers] = useState<
    {
      id: number;
      token: string;
      title: string;
      price: number;
      stock: number;
      status: string;
      sharePath: string;
      createdAt: string;
    }[]
  >([]);
  const [requests, setRequests] = useState<
    {
      id: number;
      listingId: number;
      buyerEmail: string;
      buyerName?: string;
      listingTitle?: string;
      status: string;
    }[]
  >([]);
  const [chats, setChats] = useState<
    {
      id: number;
      source: "inquiry" | "deal";
      kind: string;
      subject: string;
      buyerName: string;
      buyerEmail: string;
      sellerName: string;
      updatedAt: string;
    }[]
  >([]);
  const [form, setForm] = useState({
    title: "",
    cat: "",
    niche: "",
    followers: "",
    monetized: false,
    teaser: "",
    privateHandle: "",
    handlePublic: false,
    price: "",
    desc: "",
    stock: "1",
    listingType: "account",
    deliveryDays: "3",
    revisions: "1",
    img: "",
  });
  const [successOpen, setSuccessOpen] = useState(false);
  const [successGig, setSuccessGig] = useState(false);
  const isFreelanceForm = isFreelanceCategory(form.cat);
  const [listMode, setListMode] = useState<"one" | "stock">("one");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push(withLocalePrefix("/auth/login", locale));
      return;
    }
    if (user.role === "buyer") {
      api<{ user: NonNullable<typeof user> }>("/api/account/become-seller", {
        method: "POST",
      })
        .then((d) => setUser(d.user))
        .catch(() => undefined);
    }
  }, [user, loading, router, locale, setUser]);

  async function refresh() {
    const [l, o, of, r, ch] = await Promise.all([
      api<{ listings: typeof listings }>("/api/listings?mine=1"),
      api<{ orders: typeof orders }>("/api/orders?scope=seller"),
      api<{ offers: typeof offers }>("/api/offers"),
      api<{ requests: typeof requests }>("/api/private-requests"),
      api<{ chats: typeof chats }>("/api/chats"),
    ]);
    setListings(l.listings);
    setOrders(o.orders);
    setOffers(of.offers || []);
    setRequests(r.requests);
    setChats((ch.chats || []).filter((c) => c.kind !== "escrow"));
  }

  useEffect(() => {
    if (user && user.role !== "buyer") refresh().catch(() => {});
  }, [user]);

  function readImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Please choose an image file."));
        return;
      }
      if (file.size > 1_200_000) {
        reject(new Error("Image must be under ~1.2MB."));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read image."));
      reader.readAsDataURL(file);
    });
  }

  async function createListing(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!SELL_BOARDS.some(([k]) => k === form.cat)) {
      setMsg("Choose what you are listing.");
      return;
    }
    try {
      const freelance = isFreelanceCategory(form.cat);
      await api("/api/listings", {
        method: "POST",
        json: {
          ...form,
          listingType: freelance ? "service" : form.listingType || "account",
          handlePublic: freelance ? false : !!form.handlePublic,
          price: Number(form.price),
          stock: freelance
            ? 9999
            : listMode === "one"
              ? 1
              : Math.max(1, Math.floor(Number(form.stock)) || 1),
          deliveryDays: Number(form.deliveryDays) || 3,
          revisions: Number(form.revisions) || 1,
        },
      });
      setSuccessGig(freelance);
      setSuccessOpen(true);
      setMsg("");
      refreshAuth().catch(() => undefined);
      setForm({
        title: "",
        cat: "",
        niche: "",
        followers: "",
        monetized: false,
        teaser: "",
        privateHandle: "",
        handlePublic: false,
        price: "",
        desc: "",
        stock: "1",
        listingType: "account",
        deliveryDays: "3",
        revisions: "1",
        img: "",
      });
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  if (loading || !user) return <p className="sec mut">Loading…</p>;

  return (
    <section className="sec">
      {successOpen ? (
        <div
          className="dep-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="list-success-title"
          onClick={() => setSuccessOpen(false)}
        >
          <div
            className="dep-modal-card list-success-card"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="crypto-kicker">SocialsFlip</p>
            <h2 id="list-success-title" style={{ marginTop: 4 }}>
              {successGig ? t("listing.successGigTitle") : t("listing.successTitle")}
            </h2>
            <p className="sm" style={{ marginTop: 8 }}>
              {successGig ? t("listing.successGigBody") : t("listing.successBody")}
            </p>
            <div className="row" style={{ marginTop: 16 }}>
              <button
                className="btn buy-go"
                type="button"
                onClick={() => setSuccessOpen(false)}
              >
                {t("listing.successOk")}
              </button>
              <Link className="btn o" href="/" onClick={() => setSuccessOpen(false)}>
                {t("home.browse")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
      <h1 style={{ fontSize: "2rem" }}>List anything</h1>
      <p className="mut">
        Post one account or a batch in stock. Photo, name, and verification stay in{" "}
        <Link href="/account" style={{ color: "var(--a)", fontWeight: 700 }}>
          Account
        </Link>
        .
      </p>
      <div className="row" style={{ marginTop: 12, alignItems: "center" }}>
        <StartEscrowChat />
        <span className="sm mut">Escrow is always available, before and after a listing.</span>
      </div>
      {msg ? <p className="okmsg">{msg}</p> : null}

      <h2>New listing</h2>
      <p className="sm mut">
        This goes live immediately. Buyers pay into escrow.
      </p>
      <form className="card list-form" onSubmit={createListing}>
        <p className="list-step">1 · What are you listing?</p>
        <div className="cat-pick" role="radiogroup" aria-label="Listing category">
          {SELL_BOARDS.map(([k, n]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={form.cat === k}
              className={`cat-pick-btn ${form.cat === k ? "on" : ""}`}
              onClick={() => {
                const freelance = isFreelanceCategory(k);
                setForm({
                  ...form,
                  cat: k,
                  listingType: freelance ? "service" : k === "ai" ? "tool" : "account",
                  stock: freelance ? "25" : form.stock || "1",
                });
              }}
            >
              <CatIcon cat={k} size={22} />
              <span>{n}</span>
            </button>
          ))}
        </div>
        {!form.cat ? (
          <p className="sm mut">Pick a board, then fill in the listing.</p>
        ) : null}
        {form.cat ? (
          <>
        <p className="list-step">2 · Complete the listing</p>
        {isFreelanceForm ? (
          <p className="sm mut">
            This posts on the Freelance Services board. Buyer pays escrow; you deliver in chat.
          </p>
        ) : form.cat === "ai" ? (
          <p className="sm mut">
            This posts on the AI Tools board. Buyers pay into escrow.
          </p>
        ) : null}
        {!isFreelanceForm ? (
          <div className="list-mode">
            <p className="sm" style={{ marginTop: 0 }}>
              <b>What are you listing?</b>
            </p>
            <div className="row">
              <button
                type="button"
                className={`btn s ${listMode === "one" ? "" : "o"}`}
                onClick={() => {
                  setListMode("one");
                  setForm({ ...form, stock: "1" });
                }}
              >
                {form.cat === "ai" ? "One tool" : "One account"}
              </button>
              <button
                type="button"
                className={`btn s ${listMode === "stock" ? "" : "o"}`}
                onClick={() => {
                  setListMode("stock");
                  setForm({ ...form, stock: form.stock === "1" ? "100" : form.stock });
                }}
              >
                {form.cat === "ai" ? "Stock of similar tools" : "Stock of similar accounts"}
              </button>
            </div>
            <p className="sm mut">
              {listMode === "one"
                ? "One channel or page, with its subscriber count and link. Buyers see 1 available. The link stays hidden until the deal."
                : "Many similar accounts, written once. Example: 100 monetized YouTube channels. The available count sits at the top of the listing. Each sale takes one. Send that buyer’s link in the deal chat."}
            </p>
          </div>
        ) : null}
        {listMode === "stock" && !isFreelanceForm ? (
          <>
            <label>Available stock</label>
            <input
              type="number"
              min={1}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="100"
            />
            <p className="sm mut">
              Buyers see this count at the top of the listing, for example “{form.stock || "100"} available”.
            </p>
          </>
        ) : null}
        <label>Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder={
            isFreelanceForm
              ? "e.g. YouTube Thumbnail Pack (5 designs)"
              : listMode === "stock"
                ? "e.g. Monetized YouTube channels"
                : "e.g. YouTube channel — 1,000 subscribers"
          }
          required
        />
        <label>{isFreelanceForm ? "Gig niche / skill" : "Niche"}</label>
        <input
          value={form.niche}
          onChange={(e) => setForm({ ...form, niche: e.target.value })}
          placeholder={isFreelanceForm ? "e.g. Thumbnail design" : ""}
        />
        {isFreelanceForm ? (
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {FREELANCE_GIG_IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                className="btn s o"
                onClick={() =>
                  setForm({
                    ...form,
                    niche: idea,
                    title: form.title || idea,
                  })
                }
              >
                {idea}
              </button>
            ))}
          </div>
        ) : null}
        {!isFreelanceForm ? (
          <>
            <label>Followers / subscribers</label>
            <input
              value={form.followers}
              onChange={(e) => setForm({ ...form, followers: e.target.value })}
              placeholder={listMode === "stock" ? "e.g. 1,000 each" : "1,000"}
            />
            <label>
              <input
                type="checkbox"
                checked={form.monetized}
                onChange={(e) =>
                  setForm({ ...form, monetized: e.target.checked })
                }
                style={{ width: "auto", marginRight: 8 }}
              />
              Monetized
            </label>
            <label>
              {listMode === "one"
                ? t("listing.channelUrl")
                : "Sample link (optional)"}
            </label>
            <input
              value={form.privateHandle}
              onChange={(e) =>
                setForm({ ...form, privateHandle: e.target.value })
              }
              placeholder="https://youtube.com/@channel"
            />
            {listMode === "one" ? (
              <div className="handle-vis" role="radiogroup" aria-label={t("listing.channelUrl")}>
                <label className={`handle-vis-opt ${!form.handlePublic ? "on" : ""}`}>
                  <input
                    type="radio"
                    name="handleVis"
                    checked={!form.handlePublic}
                    onChange={() => setForm({ ...form, handlePublic: false })}
                  />
                  <span>
                    <b>{t("listing.hideUrl")}</b>
                    <small>{t("listing.hideUrlHint")}</small>
                  </span>
                </label>
                <label className={`handle-vis-opt ${form.handlePublic ? "on" : ""}`}>
                  <input
                    type="radio"
                    name="handleVis"
                    checked={!!form.handlePublic}
                    onChange={() => setForm({ ...form, handlePublic: true })}
                  />
                  <span>
                    <b>{t("listing.showUrl")}</b>
                    <small>{t("listing.showUrlHint")}</small>
                  </span>
                </label>
              </div>
            ) : (
              <p className="sm mut">
                Leave blank if each unit has its own link. After payment, send that
                buyer’s link in the deal chat.
              </p>
            )}
          </>
        ) : (
          <>
            <label>Delivery time (days)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={form.deliveryDays}
              onChange={(e) =>
                setForm({ ...form, deliveryDays: e.target.value })
              }
            />
            <label>Revisions included</label>
            <input
              type="number"
              min={0}
              max={20}
              value={form.revisions}
              onChange={(e) => setForm({ ...form, revisions: e.target.value })}
            />
          </>
        )}
        <label>Teaser description</label>
        <textarea
          rows={2}
          value={form.teaser}
          onChange={(e) => setForm({ ...form, teaser: e.target.value })}
        />
        {!isFreelanceForm ? (
          listMode === "one" ? (
            <p className="sm mut">Stock for this listing is 1. It is one account.</p>
          ) : null
        ) : (
          <p className="sm mut">
            No stock limit — buyers see how many times this gig was purchased
            (total sold), not inventory.
          </p>
        )}
        <label>Cover image (upload or leave blank for auto)</label>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const dataUrl = await readImageFile(f);
              setForm({ ...form, img: dataUrl });
            } catch (err) {
              setMsg(err instanceof Error ? err.message : "Upload failed");
            }
          }}
        />
        {form.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.img}
            alt=""
            style={{
              marginTop: 8,
              width: "100%",
              maxHeight: 160,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ) : null}
        <label>Price (USD)</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <label>Full description</label>
        <textarea
          rows={3}
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
        />
        <button className="btn" type="submit">
          Publish listing
        </button>
          </>
        ) : null}
      </form>

      <p className="note sm">
        Payments are crypto-only (USDT TRC20 / BEP20) into SocialsFlip escrow.
        Buyers do not pay you via local methods.
      </p>

      <h2 style={{ marginTop: 24 }}>Your listings</h2>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Stock / Sold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => {
              const freelance =
                isFreelanceCategory(l.cat) ||
                l.isFreelance ||
                l.listingType === "service";
              return (
              <tr key={l.id}>
                <td>
                  <Link href={`/listing/${l.id}`}>{l.title}</Link>
                </td>
                <td>{money(l.price)}</td>
                <td>
                  {freelance ? (
                    <span className="sm">{l.soldCount ?? 0} sold</span>
                  ) : (
                    <input
                      key={`${l.id}-${l.stock ?? 0}`}
                      type="number"
                      min={0}
                      defaultValue={l.stock ?? 1}
                      style={{ width: 72 }}
                      aria-label={`Stock for ${l.title}`}
                      onBlur={async (e) => {
                        const stock = Number(e.target.value);
                        if (!Number.isFinite(stock) || stock < 0) return;
                        try {
                          await api("/api/listings", {
                            method: "PATCH",
                            json: { id: l.id, stock },
                          });
                          setMsg(`Stock updated: ${l.title} → ${stock}`);
                          await refresh();
                        } catch (err) {
                          setMsg(
                            err instanceof Error
                              ? err.message
                              : "Stock update failed"
                          );
                        }
                      }}
                    />
                  )}
                </td>
                <td>
                  <span className={`pill ${l.listed ? "g" : "w"}`}>
                    {l.status}
                    {l.listed ? " · live" : ""}
                    {!freelance && (l.stock ?? 1) <= 0 ? " · sold out" : ""}
                  </span>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
        {!listings.length ? <p className="mut">No listings yet.</p> : null}
      </div>

      <h2 style={{ marginTop: 24 }}>Created deal links</h2>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Stock left</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id}>
                <td>{o.title}</td>
                <td>{money(o.price)}</td>
                <td>{o.stock}</td>
                <td>
                  <span className={`pill ${o.status === "open" ? "g" : "w"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="row">
                  <Link className="btn s" href={`/offer/${o.token}`}>
                    Open
                  </Link>
                  <button
                    className="btn s o"
                    type="button"
                    onClick={async () => {
                      const full =
                        typeof window !== "undefined"
                          ? `${window.location.origin}${o.sharePath || `/offer/${o.token}`}`
                          : o.sharePath || `/offer/${o.token}`;
                      await navigator.clipboard.writeText(full);
                      setMsg("Deal link copied.");
                    }}
                  >
                    Copy link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!offers.length ? (
          <p className="mut">
            No created deals yet.{" "}
            <Link href="/create-deal">Create a private deal link</Link>
          </p>
        ) : null}
      </div>

      <h2 style={{ marginTop: 24 }}>Private detail requests</h2>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Listing</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.buyerName ? <b>{r.buyerName}</b> : null}
                  {r.buyerName ? <br /> : null}
                  <span className="mut sm">{r.buyerEmail}</span>
                </td>
                <td>{r.listingTitle || `#${r.listingId}`}</td>
                <td>{r.status}</td>
                <td>
                  {r.status === "requested" ? (
                    <>
                      <button
                        className="btn s"
                        onClick={async () => {
                          await api("/api/private-requests", {
                            method: "PATCH",
                            json: { id: r.id, approve: true },
                          });
                          refresh();
                        }}
                      >
                        Approve
                      </button>{" "}
                      <button
                        className="btn s o"
                        onClick={async () => {
                          await api("/api/private-requests", {
                            method: "PATCH",
                            json: { id: r.id, approve: false },
                          });
                          refresh();
                        }}
                      >
                        Deny
                      </button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!requests.length ? <p className="mut">No requests.</p> : null}
      </div>

      <h2 style={{ marginTop: 24 }}>Buyer chats and deal rooms</h2>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Topic</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {chats.map((c) => (
              <tr key={`${c.source}-${c.id}`}>
                <td>
                  {c.buyerName}
                  <br />
                  <span className="mut sm">{c.buyerEmail}</span>
                </td>
                <td>{c.subject}</td>
                <td>
                  <Link className="btn s" href={c.source === "deal" ? `/deal/${c.id}` : c.id ? `/chat/${c.id}` : "/chats?start=escrow"}>
                    Reply as {c.sellerName || user.name || "you"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!chats.length ? (
          <p className="mut">No pre-deal chats yet.</p>
        ) : null}
      </div>

      <h2 style={{ marginTop: 24 }}>Deals</h2>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.title}</td>
                <td>{DEAL_STATUS_LABEL[o.status]}</td>
                <td>
                  <Link className="btn s o" href={`/deal/${o.id}`}>
                    Chat
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length ? <p className="mut">No deals yet.</p> : null}
      </div>
    </section>
  );
}
