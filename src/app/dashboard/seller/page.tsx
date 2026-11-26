"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { money } from "@/lib/constants";
import {
  CATEGORIES,
  DEAL_STATUS_LABEL,
  FREELANCE_GIG_IDEAS,
  isFreelanceCategory,
  type DealStatus,
} from "@/lib/types";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

export default function SellerDashboard() {
  const { user, loading, refresh: refreshAuth } = useAuth();
  const { locale } = useLang();
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
    cat: "youtube",
    niche: "",
    followers: "",
    monetized: false,
    teaser: "",
    privateHandle: "",
    price: "",
    desc: "",
    stock: "1",
    listingType: "account",
    deliveryDays: "3",
    revisions: "1",
    img: "",
  });
  const isFreelanceForm = isFreelanceCategory(form.cat);
  const [listMode, setListMode] = useState<"one" | "stock">("one");
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    country: "",
    phone: "",
    avatarUrl: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!loading && (!user || (user.role !== "seller" && user.role !== "admin"))) {
      router.push(withLocalePrefix("/auth/login", locale));
    }
  }, [user, loading, router, locale]);

  async function refresh() {
    const [l, o, of, r, me, ch] = await Promise.all([
      api<{ listings: typeof listings }>("/api/listings?mine=1"),
      api<{ orders: typeof orders }>("/api/orders?scope=seller"),
      api<{ offers: typeof offers }>("/api/offers"),
      api<{ requests: typeof requests }>("/api/private-requests"),
      api<{
        seller: {
          name: string;
          bio: string;
          country: string;
          phone?: string;
          avatarUrl?: string;
        };
      }>("/api/sellers/me"),
      api<{ chats: typeof chats }>("/api/chats"),
    ]);
    setListings(l.listings);
    setOrders(o.orders);
    setOffers(of.offers || []);
    setRequests(r.requests);
    setChats((ch.chats || []).filter((c) => c.kind !== "escrow"));
    setProfile({
      name: me.seller.name || "",
      bio: me.seller.bio || "",
      country: me.seller.country || "",
      phone: me.seller.phone || "",
      avatarUrl: me.seller.avatarUrl || "",
    });
  }

  useEffect(() => {
    if (user) refresh().catch(() => {});
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
    try {
      const freelance = isFreelanceCategory(form.cat);
      await api("/api/listings", {
        method: "POST",
        json: {
          ...form,
          listingType: freelance ? "service" : form.listingType || "account",
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
      setMsg(
        freelance
          ? "Freelance gig submitted for admin approval."
          : "Listing submitted for admin approval."
      );
      setForm({
        title: "",
        cat: "youtube",
        niche: "",
        followers: "",
        monetized: false,
        teaser: "",
        privateHandle: "",
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

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      await api("/api/sellers/me", { method: "PATCH", json: profile });
      await refreshAuth();
      setMsg("Profile updated — public page refreshed.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    }
  }

  if (loading || !user) return <p className="sec mut">Loading…</p>;

  return (
    <section className="sec">
      <h1 style={{ fontSize: "2rem" }}>Seller dashboard</h1>
      <p className="mut">
        Manage profile, listings, private requests, and deals.{" "}
        {user.id ? (
          <Link href={`/seller/${user.id}`} style={{ color: "var(--a)", fontWeight: 600 }}>
            View public profile
          </Link>
        ) : null}
      </p>
      {msg ? <p className="okmsg">{msg}</p> : null}

      <h2>Your public profile</h2>
      <form className="card" onSubmit={saveProfile}>
        <div className="row" style={{ gap: 14, alignItems: "center" }}>
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : null}
          <div style={{ flex: 1 }}>
            <label>Profile photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const dataUrl = await readImageFile(f);
                  setProfile({ ...profile, avatarUrl: dataUrl });
                } catch (err) {
                  setMsg(err instanceof Error ? err.message : "Upload failed");
                }
              }}
            />
          </div>
        </div>
        <label>Display name</label>
        <input
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          required
        />
        <label>Country</label>
        <input
          value={profile.country}
          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
        />
        <label>Phone (private)</label>
        <input
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />
        <label>Bio</label>
        <textarea
          rows={3}
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
        />
        <button className="btn" type="submit">
          Save profile
        </button>
      </form>

      <h2 style={{ marginTop: 24 }}>Post a listing</h2>
      <form className="card" onSubmit={createListing}>
        <label>Category board</label>
        <select
          value={form.cat}
          onChange={(e) => {
            const cat = e.target.value;
            const freelance = isFreelanceCategory(cat);
            setForm({
              ...form,
              cat,
              listingType: freelance ? "service" : "account",
              stock: freelance ? "25" : form.stock || "1",
            });
          }}
        >
          {CATEGORIES.map(([k, n]) => (
            <option key={k} value={k}>
              {n}
            </option>
          ))}
        </select>
        {isFreelanceForm ? (
          <p className="sm mut">
            This posts on the <b>Freelance Services</b> board (with YouTube,
            Facebook, TikTok…). Buyer pays escrow; you deliver in chat.
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
                One account
              </button>
              <button
                type="button"
                className={`btn s ${listMode === "stock" ? "" : "o"}`}
                onClick={() => {
                  setListMode("stock");
                  setForm({ ...form, stock: form.stock === "1" ? "100" : form.stock });
                }}
              >
                Stock of similar accounts
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
                ? "Channel or page link"
                : "Sample link (optional)"}
            </label>
            <input
              value={form.privateHandle}
              onChange={(e) =>
                setForm({ ...form, privateHandle: e.target.value })
              }
              placeholder="https://youtube.com/@channel"
            />
            <p className="sm mut">
              {listMode === "one"
                ? "Buyers do not see this link until escrow starts. Then it is revealed in the deal."
                : "Leave blank if each unit has its own link. After payment, send that buyer’s link in the deal chat."}
            </p>
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
          Submit for approval
        </button>
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
                  <Link className="btn s" href={c.source === "deal" ? `/deal/${c.id}` : `/chat/${c.id}`}>
                    Reply as {c.sellerName || profile.name || "you"}
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
