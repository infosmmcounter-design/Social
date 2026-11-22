"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { money } from "@/lib/constants";
import {
  CATEGORIES,
  DEAL_STATUS_LABEL,
  isFreelanceCategory,
  type CryptoWallet,
  type DealStatus,
} from "@/lib/types";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

type Tab =
  | "dash"
  | "apps"
  | "sellers"
  | "listings"
  | "orders"
  | "created"
  | "chats"
  | "dummy"
  | "requests"
  | "reviews"
  | "blog"
  | "set";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dash");
  const [apps, setApps] = useState<
    {
      id: number;
      name: string;
      email: string;
      phone: string;
      country: string;
      about: string;
      title: string;
      cat: string;
      price: number;
      status: string;
    }[]
  >([]);
  const [sellers, setSellers] = useState<
    {
      id: number;
      name: string;
      country: string;
      verified: boolean;
      dummy: boolean;
      official: boolean;
      rating: number;
      reviewCount: number;
      listingCount: number;
      joinedAt: string;
    }[]
  >([]);
  const [listings, setListings] = useState<
    {
      id: number;
      title: string;
      cat: string;
      price: number;
      status: string;
      listed: boolean;
      stock?: number;
      soldCount?: number;
      listingType?: string;
      isFreelance?: boolean;
      seller?: { name: string; official?: boolean } | null;
    }[]
  >([]);
  const [orders, setOrders] = useState<
    { id: number; title: string; total: number; status: DealStatus; fee: number }[]
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
  const [sellerFilter, setSellerFilter] = useState<
    "all" | "real" | "dummy" | "verified"
  >("all");
  const [sellerQ, setSellerQ] = useState("");
  const [posts, setPosts] = useState<{ id: number; title: string }[]>([]);
  const [settings, setSettings] = useState<{
    fee: number;
    allowDirectPayToSeller: boolean;
    autoDetectCrypto: boolean;
    paymentWindowMins?: number;
    autoHoldOnProof?: boolean;
    deliveryWindowHours?: number;
    escrowHoldDays?: number;
    cryptoWallets: (CryptoWallet & { network?: string })[];
  } | null>(null);
  const [offers, setOffers] = useState<
    {
      id: number;
      token: string;
      title: string;
      price: number;
      stock: number;
      status: string;
      orderId: number | null;
      sharePath: string;
      creator: { name: string } | null;
      createdAt: string;
    }[]
  >([]);
  const [reviews, setReviews] = useState<
    {
      id: number;
      orderId: number;
      sellerId: number;
      about?: string;
      stars: number;
      text: string;
      who: string;
      date: string;
      locale?: string;
    }[]
  >([]);
  const [chats, setChats] = useState<
    {
      id: number;
      subject: string;
      sellerName: string;
      buyerName: string;
      buyerEmail: string;
      updatedAt: string;
      status: string;
    }[]
  >([]);
  const [dummyForm, setDummyForm] = useState({
    count: 3,
    listingsPerSeller: 3,
    name: "",
    verified: true,
  });
  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    password: "seller123",
    country: "Pakistan",
    countryCustom: "",
    bio: "",
    phone: "",
    verified: true,
    dummy: false,
    avatarUrl: "",
  });
  const [newListing, setNewListing] = useState({
    sellerId: "2",
    title: "",
    cat: "youtube",
    price: "",
    desc: "",
    privateHandle: "",
    niche: "",
    followers: "",
    stock: "1",
    listingType: "account",
    deliveryDays: "3",
    revisions: "1",
    img: "",
    monetized: false,
    teaser: "",
  });
  const [blog, setBlog] = useState({ title: "", body: "" });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [msg, setMsg] = useState("");

  const COUNTRIES = [
    "Pakistan",
    "India",
    "UAE",
    "USA",
    "UK",
    "Saudi Arabia",
    "Bangladesh",
    "Turkey",
    "Other",
  ];
  const STOCK_PRESETS = [1, 5, 10, 25, 30, 50, 100];

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

  const [err, setErr] = useState("");
  const { locale } = useLang();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin"))
      router.push(withLocalePrefix("/auth/login", locale));
  }, [user, loading, router, locale]);

  const filteredSellers = useMemo(() => {
    const q = sellerQ.trim().toLowerCase();
    return sellers.filter((s) => {
      if (sellerFilter === "real" && s.dummy) return false;
      if (sellerFilter === "dummy" && !s.dummy) return false;
      if (sellerFilter === "verified" && !s.verified) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q)
      );
    });
  }, [sellers, sellerFilter, sellerQ]);

  async function refresh() {
    const [a, s, l, o, r, b, set, rev, ch, of] = await Promise.all([
      api<{ applications: typeof apps }>("/api/applications"),
      api<{ sellers: typeof sellers }>("/api/admin/sellers"),
      api<{ listings: typeof listings }>("/api/listings?admin=1"),
      api<{ orders: typeof orders }>("/api/orders?scope=admin"),
      api<{ requests: typeof requests }>("/api/private-requests"),
      api<{ posts: typeof posts }>("/api/blog"),
      api<{ settings: NonNullable<typeof settings> }>("/api/admin/settings"),
      api<{ reviews: typeof reviews }>("/api/reviews"),
      api<{ inquiries: typeof chats }>("/api/inquiries?scope=admin"),
      api<{ offers: typeof offers }>("/api/offers?scope=admin"),
    ]);
    setApps(a.applications);
    setSellers(s.sellers);
    setListings(l.listings);
    setOrders(o.orders);
    setRequests(r.requests);
    setPosts(b.posts);
    setSettings(set.settings);
    setReviews(rev.reviews);
    setChats(ch.inquiries);
    setOffers(of.offers);
  }

  async function run(label: string, fn: () => Promise<void>) {
    setErr("");
    setMsg("");
    try {
      await fn();
      if (label) setMsg(label);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  useEffect(() => {
    if (user?.role === "admin") refresh().catch((e) => setErr(String(e)));
  }, [user]);

  useEffect(() => {
    setMsg("");
    setErr("");
  }, [tab]);

  if (loading || !user) return <p className="sec mut">Loading admin…</p>;
  if (user.role !== "admin") {
    return <p className="sec mut">Redirecting to login…</p>;
  }

  const held = orders.filter((o) =>
    ["awaiting_payment", "funds_held", "credentials_shared", "disputed"].includes(
      o.status
    )
  );
  const released = orders.filter((o) => o.status === "completed");

  const tabs: [Tab, string][] = [
    ["dash", "Dashboard"],
    ["apps", "Applications"],
    ["sellers", "Sellers"],
    ["listings", "Listings"],
    ["orders", "Orders"],
    ["created", "Created deals"],
    ["chats", "Seller chats"],
    ["dummy", "Dummy Data / Seller Generator"],
    ["requests", "Private Requests"],
    ["reviews", "Reviews"],
    ["blog", "Blog"],
    ["set", "Settings"],
  ];

  return (
    <section className="sec">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Admin panel</h1>
        <Link className="l" href="/" style={{ color: "var(--a)", fontWeight: 600 }}>
          View storefront
        </Link>
      </div>
      <p className="sm mut">
        Escrow moderation, approvals, crypto wallets, and dummy seller tools.
      </p>
      <div className="tabs">
        {tabs.map(([k, n]) => (
          <button
            key={k}
            className={tab === k ? "on" : ""}
            onClick={() => setTab(k)}
          >
            {n}
          </button>
        ))}
      </div>
      {msg ? <p className="okmsg">{msg}</p> : null}
      {err ? <p className="err">{err}</p> : null}

      {tab === "dash" && (
        <div className="grid">
          <div className="card f">
            <div className="mut sm">Active escrow volume</div>
            <div className="price">
              {money(held.reduce((a, o) => a + o.total, 0))}
            </div>
          </div>
          <div className="card f">
            <div className="mut sm">Fee revenue (completed)</div>
            <div className="price">
              {money(released.reduce((a, o) => a + (o.fee || 0), 0))}
            </div>
          </div>
          <div className="card f">
            <div className="mut sm">New applications</div>
            <div className="price">{apps.filter((a) => a.status === "new").length}</div>
          </div>
          <div className="card f">
            <div className="mut sm">Live listings</div>
            <div className="price">
              {listings.filter((l) => l.listed).length}
            </div>
          </div>
        </div>
      )}

      {tab === "apps" && (
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Service</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.name}
                    <br />
                    <span className="mut sm">
                      {a.email} · {a.phone} · {a.country}
                    </span>
                    <br />
                    <span className="sm">{a.about}</span>
                  </td>
                  <td>
                    {a.title}
                    <br />
                    <span className="mut sm">
                      {a.cat} · {money(a.price)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`pill ${
                        a.status === "new" ? "w" : a.status === "approved" ? "g" : "b"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>
                    {a.status === "new" ? (
                      <>
                        <button
                          className="btn s"
                          onClick={() =>
                            run("", async () => {
                              const r = await api<{
                                tempPassword?: string | null;
                                message?: string;
                              }>("/api/applications", {
                                method: "PATCH",
                                json: { id: a.id, approve: true },
                              });
                              setMsg(
                                r.tempPassword
                                  ? `${r.message || "Approved"} Temp password: ${r.tempPassword}`
                                  : r.message || "Approved"
                              );
                            })
                          }
                        >
                          Approve
                        </button>{" "}
                        <button
                          className="btn s o"
                          onClick={() =>
                            run("Application rejected", async () => {
                              await api("/api/applications", {
                                method: "PATCH",
                                json: { id: a.id, approve: false },
                              });
                            })
                          }
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!apps.length ? <p className="mut">No applications yet.</p> : null}
          <p className="sm mut">
            Approving creates seller access at your discretion. Storefront “Apply
            to sell” only submits the form.
          </p>
        </div>
      )}

      {tab === "sellers" && (
        <>
          <div className="card" style={{ maxWidth: 560, marginBottom: 22 }}>
            <h3>Create seller (complete profile)</h3>
            <p className="sm mut">
              Register a full seller: name, email, country, description, profile
              photo. Leave “Dummy” unchecked for a real seller who can log in.
            </p>
            <label>Display name</label>
            <input
              value={sellerForm.name}
              onChange={(e) =>
                setSellerForm({ ...sellerForm, name: e.target.value })
              }
              placeholder="e.g. Ayesha Media"
            />
            <label>Login email</label>
            <input
              type="email"
              value={sellerForm.email}
              onChange={(e) =>
                setSellerForm({ ...sellerForm, email: e.target.value })
              }
              placeholder="seller@email.com"
            />
            <label>Password</label>
            <input
              value={sellerForm.password}
              onChange={(e) =>
                setSellerForm({ ...sellerForm, password: e.target.value })
              }
            />
            <label>Country</label>
            <select
              value={
                COUNTRIES.includes(sellerForm.country) &&
                sellerForm.country !== "Other"
                  ? sellerForm.country
                  : "Other"
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "Other") {
                  setSellerForm({
                    ...sellerForm,
                    country: sellerForm.countryCustom || "",
                  });
                } else {
                  setSellerForm({ ...sellerForm, country: v, countryCustom: "" });
                }
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {(sellerForm.country === "" ||
              sellerForm.countryCustom !== "" ||
              !COUNTRIES.slice(0, -1).includes(sellerForm.country)) && (
              <>
                <label>Custom country</label>
                <input
                  value={sellerForm.countryCustom || sellerForm.country}
                  onChange={(e) =>
                    setSellerForm({
                      ...sellerForm,
                      countryCustom: e.target.value,
                      country: e.target.value,
                    })
                  }
                  placeholder="Type country name"
                />
              </>
            )}
            <label>Phone (optional)</label>
            <input
              value={sellerForm.phone}
              onChange={(e) =>
                setSellerForm({ ...sellerForm, phone: e.target.value })
              }
            />
            <label>Description / bio</label>
            <textarea
              rows={3}
              value={sellerForm.bio}
              onChange={(e) =>
                setSellerForm({ ...sellerForm, bio: e.target.value })
              }
              placeholder="What this seller offers…"
            />
            <label>Profile photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const dataUrl = await readImageFile(f);
                  setSellerForm({ ...sellerForm, avatarUrl: dataUrl });
                } catch (err) {
                  setMsg(err instanceof Error ? err.message : "Upload failed");
                }
              }}
            />
            {sellerForm.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sellerForm.avatarUrl}
                alt=""
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  marginTop: 8,
                  objectFit: "cover",
                }}
              />
            ) : null}
            <label style={{ marginTop: 12 }}>
              <input
                type="checkbox"
                checked={sellerForm.verified}
                onChange={(e) =>
                  setSellerForm({ ...sellerForm, verified: e.target.checked })
                }
                style={{ width: "auto", marginRight: 8 }}
              />
              Verified (blue tick)
            </label>
            <label>
              <input
                type="checkbox"
                checked={sellerForm.dummy}
                onChange={(e) =>
                  setSellerForm({ ...sellerForm, dummy: e.target.checked })
                }
                style={{ width: "auto", marginRight: 8 }}
              />
              Dummy seller (admin replies as them — leave OFF for real sellers)
            </label>
            <button
              className="btn"
              style={{ marginTop: 12 }}
              onClick={async () => {
                try {
                  const r = await api<{
                    seller: { name: string };
                    tempPassword: string;
                    message: string;
                  }>("/api/admin/sellers", {
                    method: "POST",
                    json: {
                      name: sellerForm.name,
                      email: sellerForm.email,
                      password: sellerForm.password,
                      country: sellerForm.country,
                      bio: sellerForm.bio,
                      phone: sellerForm.phone,
                      verified: sellerForm.verified,
                      dummy: sellerForm.dummy,
                      avatarUrl: sellerForm.avatarUrl,
                    },
                  });
                  setMsg(
                    `${r.message} Login: ${sellerForm.email} / ${r.tempPassword}`
                  );
                  setSellerForm({
                    name: "",
                    email: "",
                    password: "seller123",
                    country: "Pakistan",
                    countryCustom: "",
                    bio: "",
                    phone: "",
                    verified: true,
                    dummy: false,
                    avatarUrl: "",
                  });
                  refresh();
                } catch (e) {
                  setMsg(e instanceof Error ? e.message : "Failed");
                }
              }}
            >
              Create seller
            </button>
          </div>

          <div className="row" style={{ gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <input
              placeholder="Search sellers…"
              value={sellerQ}
              onChange={(e) => setSellerQ(e.target.value)}
              style={{ maxWidth: 220 }}
            />
            {(
              [
                ["all", "All"],
                ["real", "Real"],
                ["dummy", "Dummy"],
                ["verified", "Verified"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                className={`btn s ${sellerFilter === k ? "" : "o"}`}
                onClick={() => setSellerFilter(k)}
              >
                {label}
              </button>
            ))}
            <span className="mut sm">
              {filteredSellers.length} / {sellers.length}
            </span>
          </div>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Country</th>
                  <th>Listings</th>
                  <th>Rating</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredSellers.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.name}{" "}
                      {s.official ? (
                        <span className="pill g">Our store</span>
                      ) : null}{" "}
                      {s.dummy ? <span className="pill w">Dummy</span> : null}{" "}
                      {s.verified ? (
                        <span className="pill g">Verified</span>
                      ) : null}
                      <br />
                      <span className="mut sm">
                        Joined {new Date(s.joinedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>{s.country}</td>
                    <td>{s.listingCount}</td>
                    <td>
                      {s.official
                        ? "—"
                        : `${s.rating.toFixed(1)} (${s.reviewCount})`}
                    </td>
                    <td className="row">
                      {!s.official ? (
                        <>
                          <button
                            className="btn s"
                            onClick={() =>
                              run(
                                s.verified ? "Seller unverified" : "Seller verified",
                                async () => {
                                  await api("/api/admin/sellers", {
                                    method: "PATCH",
                                    json: { id: s.id, verified: !s.verified },
                                  });
                                }
                              )
                            }
                          >
                            {s.verified ? "Unverify" : "Verify ✓"}
                          </button>
                          <button
                            className="btn s o"
                            onClick={() =>
                              run(
                                s.dummy ? "Marked real" : "Marked dummy",
                                async () => {
                                  await api("/api/admin/sellers", {
                                    method: "PATCH",
                                    json: { id: s.id, dummy: !s.dummy },
                                  });
                                }
                              )
                            }
                          >
                            {s.dummy ? "Mark real" : "Mark dummy"}
                          </button>
                          <button
                            className="btn s o"
                            onClick={() => {
                              if (!confirm("Remove seller and listings?"))
                                return;
                              run("Seller removed", async () => {
                                await api("/api/admin/sellers", {
                                  method: "DELETE",
                                  json: { id: s.id },
                                });
                              });
                            }}
                          >
                            Remove
                          </button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredSellers.length ? (
              <p className="mut">No sellers match this filter.</p>
            ) : null}
          </div>
        </>
      )}

      {tab === "listings" && (
        <>
          <div className="card">
            <h3>Add a listing</h3>
            <p className="sm mut">
              Full listing with description, monetization, and available stock
              (e.g. 25 / 30 / 50 identical units).
            </p>
            <label>Listed under (seller)</label>
            <select
              value={newListing.sellerId}
              onChange={(e) =>
                setNewListing({ ...newListing, sellerId: e.target.value })
              }
            >
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.official ? "SocialsFlip (our store)" : s.name}
                  {s.dummy ? " (dummy)" : ""}
                </option>
              ))}
            </select>
            <label>Category board</label>
            <select
              value={newListing.cat}
              onChange={(e) => {
                const cat = e.target.value;
                const freelance = isFreelanceCategory(cat);
                setNewListing({
                  ...newListing,
                  cat,
                  listingType: freelance
                    ? "service"
                    : cat === "other" || cat === "ai"
                      ? "tool"
                      : "account",
                  stock: freelance ? "25" : newListing.stock || "1",
                });
              }}
            >
              {CATEGORIES.map(([k, n]) => (
                <option key={k} value={k}>
                  {n}
                </option>
              ))}
            </select>
            {isFreelanceCategory(newListing.cat) ? (
              <p className="sm mut">
                Posts on the <b>Freelance Services</b> chip (same row as
                YouTube, Facebook, TikTok…). Escrow gig with delivery days.
              </p>
            ) : (
              <>
                <label>Type</label>
                <select
                  value={newListing.listingType}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      listingType: e.target.value,
                    })
                  }
                >
                  <option value="account">Account for sale</option>
                  <option value="tool">Tool / subscription</option>
                </select>
              </>
            )}
            <label>Title</label>
            <input
              value={newListing.title}
              onChange={(e) =>
                setNewListing({ ...newListing, title: e.target.value })
              }
              placeholder={
                isFreelanceCategory(newListing.cat)
                  ? "e.g. YouTube Thumbnail Pack (5 designs)"
                  : "e.g. YouTube 1K Subs Monetized Channel"
              }
            />
            <label>
              {isFreelanceCategory(newListing.cat)
                ? "Gig niche / skill"
                : "Niche"}
            </label>
            <input
              value={newListing.niche}
              onChange={(e) =>
                setNewListing({ ...newListing, niche: e.target.value })
              }
              placeholder={
                isFreelanceCategory(newListing.cat)
                  ? "Thumbnail design, Reels editing…"
                  : "Gaming, Fashion, Tech…"
              }
            />
            {isFreelanceCategory(newListing.cat) ? (
              <>
                <label>Delivery days</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={newListing.deliveryDays}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      deliveryDays: e.target.value,
                    })
                  }
                />
                <label>Revisions included</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={newListing.revisions}
                  onChange={(e) =>
                    setNewListing({ ...newListing, revisions: e.target.value })
                  }
                />
              </>
            ) : (
              <>
                <label>Followers / subscribers</label>
                <input
                  value={newListing.followers}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      followers: e.target.value,
                    })
                  }
                  placeholder="1,000"
                />
                <label>
                  <input
                    type="checkbox"
                    checked={newListing.monetized}
                    onChange={(e) =>
                      setNewListing({
                        ...newListing,
                        monetized: e.target.checked,
                      })
                    }
                    style={{ width: "auto", marginRight: 8 }}
                  />
                  Monetized
                </label>
                <label>Private handle / URL (optional)</label>
                <input
                  value={newListing.privateHandle}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      privateHandle: e.target.value,
                    })
                  }
                  placeholder="Optional — can share in deal chat later"
                />
              </>
            )}
            <label>Price (USD)</label>
            <input
              type="number"
              value={newListing.price}
              onChange={(e) =>
                setNewListing({ ...newListing, price: e.target.value })
              }
            />
            {isFreelanceCategory(newListing.cat) ? (
              <p className="sm mut">
                Freelance gigs have no stock inventory. Buyers see{" "}
                <b>total sold / times purchased</b> instead.
              </p>
            ) : (
              <>
                <label>Available stock</label>
                <div className="row" style={{ marginBottom: 8 }}>
                  {STOCK_PRESETS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`btn s ${
                        String(n) === newListing.stock ? "" : "o"
                      }`}
                      onClick={() =>
                        setNewListing({ ...newListing, stock: String(n) })
                      }
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={0}
                  value={newListing.stock}
                  onChange={(e) =>
                    setNewListing({ ...newListing, stock: e.target.value })
                  }
                  placeholder="Or type any stock qty"
                />
                <p className="sm mut">
                  Example: same “1K monetized YT” offer with 50 units ready →
                  stock 50. Each sale reduces by 1.
                </p>
              </>
            )}
            <label>Short teaser</label>
            <input
              value={newListing.teaser}
              onChange={(e) =>
                setNewListing({ ...newListing, teaser: e.target.value })
              }
            />
            <label>Full description</label>
            <textarea
              rows={4}
              value={newListing.desc}
              onChange={(e) =>
                setNewListing({ ...newListing, desc: e.target.value })
              }
              placeholder="Channel details, niche, transfer method…"
            />
            <label>Cover image (upload or leave blank for auto)</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const dataUrl = await readImageFile(f);
                  setNewListing({ ...newListing, img: dataUrl });
                } catch (err) {
                  setMsg(err instanceof Error ? err.message : "Upload failed");
                }
              }}
            />
            {newListing.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={newListing.img}
                alt=""
                style={{
                  marginTop: 8,
                  maxHeight: 120,
                  borderRadius: 8,
                  objectFit: "cover",
                }}
              />
            ) : null}
            <button
              className="btn"
              style={{ marginTop: 12 }}
              onClick={async () => {
                try {
                  await api("/api/listings", {
                    method: "POST",
                    json: {
                      ...newListing,
                      sellerId: Number(newListing.sellerId),
                      price: Number(newListing.price),
                      stock: Math.max(
                        0,
                        Number.isFinite(Number(newListing.stock))
                          ? Math.floor(Number(newListing.stock))
                          : 1
                      ),
                      monetized: newListing.monetized,
                      listed: true,
                    },
                  });
                  setMsg("Listing published");
                  setNewListing({
                    ...newListing,
                    title: "",
                    price: "",
                    desc: "",
                    privateHandle: "",
                    niche: "",
                    followers: "",
                    stock: isFreelanceCategory(newListing.cat) ? "25" : "1",
                    deliveryDays: "3",
                    revisions: "1",
                    img: "",
                    teaser: "",
                    monetized: false,
                  });
                  refresh();
                } catch (e) {
                  setMsg(e instanceof Error ? e.message : "Failed");
                }
              }}
            >
              Publish now
            </button>
          </div>
          <h3 style={{ marginTop: 22 }}>All listings</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Owner</th>
                  <th>Price</th>
                  <th>Stock / Sold</th>
                  <th>Status</th>
                  <th />
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
                    <td>{l.title}</td>
                    <td>
                      {l.seller?.official ? (
                        <span className="pill g">SocialsFlip</span>
                      ) : (
                        l.seller?.name
                      )}
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
                          onBlur={(e) => {
                            const stock = Number(e.target.value);
                            if (!Number.isFinite(stock) || stock < 0) return;
                            run(`Stock → ${stock}`, async () => {
                              await api("/api/admin/listings", {
                                method: "PATCH",
                                json: { id: l.id, action: "stock", stock },
                              });
                            });
                          }}
                        />
                      )}
                    </td>
                    <td>
                      <span className={`pill ${l.listed ? "g" : "w"}`}>
                        {l.status}
                        {l.listed ? " · live" : ""}
                      </span>
                    </td>
                    <td>
                      {l.status === "pending" ? (
                        <button
                          className="btn s"
                          onClick={() =>
                            run("Listing approved", async () => {
                              await api("/api/admin/listings", {
                                method: "PATCH",
                                json: { id: l.id, action: "approve" },
                              });
                            })
                          }
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          className="btn s o"
                          onClick={() =>
                            run(
                              l.listed ? "Listing unpublished" : "Listing published",
                              async () => {
                                await api("/api/admin/listings", {
                                  method: "PATCH",
                                  json: {
                                    id: l.id,
                                    action: l.listed ? "unlist" : "publish",
                                  },
                                });
                              }
                            )
                          }
                        >
                          {l.listed ? "Unlist" : "Publish"}
                        </button>
                      )}{" "}
                      <button
                        className="btn s o"
                        onClick={() => {
                          if (!confirm(`Delete listing “${l.title}”?`)) return;
                          run("Listing deleted", async () => {
                            await api("/api/admin/listings", {
                              method: "PATCH",
                              json: { id: l.id, action: "delete" },
                            });
                          });
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            {!listings.length ? <p className="mut">No listings yet.</p> : null}
          </div>
        </>
      )}

      {tab === "orders" && (
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Total</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.title}</td>
                  <td>{money(o.total)}</td>
                  <td>
                    <span
                      className={`pill ${
                        o.status === "disputed"
                          ? "b"
                          : o.status === "completed"
                            ? "g"
                            : "w"
                      }`}
                    >
                      {DEAL_STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td>
                    <Link className="btn s o" href={`/deal/${o.id}`}>
                      Open chat / moderate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length ? <p className="mut">No orders yet.</p> : null}
        </div>
      )}

      {tab === "created" && (
        <div className="tbl">
          <p className="sm mut">
            Shareable deal links. When a buyer pays, chat is Deal creator + Buyer
            + Admin/Escrow. Payment goes to SocialsFlip escrow only.
          </p>
          <p style={{ marginBottom: 12 }}>
            <Link className="btn s" href="/create-deal">
              + Create deal link
            </Link>
          </p>
          <table>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Deal</th>
                <th>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td>{o.creator?.name || "—"}</td>
                  <td>
                    {o.title}
                    <br />
                    <span className="mut sm">{money(o.price)}</span>
                  </td>
                  <td>{o.stock} available</td>
                  <td>
                    <span
                      className={`pill ${
                        o.status === "ordered"
                          ? "g"
                          : o.status === "open"
                            ? "w"
                            : "b"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="row">
                    <button
                      className="btn s o"
                      type="button"
                      onClick={async () => {
                        const url =
                          typeof window !== "undefined"
                            ? `${window.location.origin}${o.sharePath}`
                            : o.sharePath;
                        await navigator.clipboard.writeText(url);
                        setMsg("Deal link copied");
                      }}
                    >
                      Copy link
                    </button>
                    {o.orderId ? (
                      <Link className="btn s" href={`/deal/${o.orderId}`}>
                        Open chat
                      </Link>
                    ) : (
                      <Link className="btn s o" href={o.sharePath}>
                        Preview
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!offers.length ? (
            <p className="mut">No created deals yet.</p>
          ) : null}
        </div>
      )}

      {tab === "chats" && (
        <div className="tbl">
          <p className="sm mut">
            Pre-deal chats. Reply as Escrow or as the seller by name (for dummy
            sellers too).
          </p>
          <table>
            <thead>
              <tr>
                <th>Seller</th>
                <th>Buyer</th>
                <th>Topic</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {chats.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>{c.sellerName}</b>
                  </td>
                  <td>
                    {c.buyerName}
                    <br />
                    <span className="mut sm">{c.buyerEmail}</span>
                  </td>
                  <td>
                    {c.subject}
                    <br />
                    <span className="mut sm">
                      {new Date(c.updatedAt).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <Link className="btn s" href={`/chat/${c.id}`}>
                      Open — {c.sellerName}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!chats.length ? <p className="mut">No seller chats yet.</p> : null}
        </div>
      )}

      {tab === "dummy" && (
        <div className="card" style={{ maxWidth: 520 }}>
          <h3>Dummy Data / Seller Generator</h3>
          <p className="sm mut">
            Create unlimited realistic dummy sellers. When a real buyer starts a
            deal with them, you can reply as seller from the deal chat.
          </p>
          <label>How many sellers?</label>
          <input
            type="number"
            min={1}
            max={50}
            value={dummyForm.count}
            onChange={(e) =>
              setDummyForm({ ...dummyForm, count: Number(e.target.value) })
            }
          />
          <label>Listings per seller</label>
          <input
            type="number"
            min={1}
            max={10}
            value={dummyForm.listingsPerSeller}
            onChange={(e) =>
              setDummyForm({
                ...dummyForm,
                listingsPerSeller: Number(e.target.value),
              })
            }
          />
          <label>Custom name (optional, for 1 seller)</label>
          <input
            value={dummyForm.name}
            onChange={(e) => setDummyForm({ ...dummyForm, name: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              checked={dummyForm.verified}
              onChange={(e) =>
                setDummyForm({ ...dummyForm, verified: e.target.checked })
              }
              style={{ width: "auto", marginRight: 8 }}
            />
            Verified badge
          </label>
          <div className="row" style={{ marginTop: 12 }}>
            <button
              className="btn"
              onClick={async () => {
                const r = await api<{ created: unknown[] }>("/api/admin/dummy", {
                  method: "POST",
                  json: { ...dummyForm, autoListings: true },
                });
                setMsg(`${r.created.length} dummy seller(s) created with listings.`);
                refresh();
              }}
            >
              Generate sellers + listings
            </button>
            <button
              className="btn o"
              onClick={async () => {
                if (!confirm("Remove ALL dummy sellers?")) return;
                await api("/api/admin/dummy", { method: "DELETE", json: {} });
                setMsg("All dummy sellers removed");
                refresh();
              }}
            >
              Clear all dummies
            </button>
          </div>
          <p className="sm mut" style={{ marginTop: 12 }}>
            Current dummy sellers: {sellers.filter((s) => s.dummy).length}
          </p>
        </div>
      )}

      {tab === "reviews" && (
        <div className="tbl">
          <p className="sm mut">Delete inappropriate buyer↔seller reviews.</p>
          <table>
            <thead>
              <tr>
                <th>About</th>
                <th>Stars</th>
                <th>Who / Lang</th>
                <th>Text (buyer language)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.about === "buyer" ? "Buyer" : "Seller"} · order #{r.orderId}
                  </td>
                  <td>{r.stars}</td>
                  <td>
                    {r.who}
                    <br />
                    <span className="mut sm">
                      {r.date}
                      {r.locale ? ` · ${r.locale}` : ""}
                    </span>
                  </td>
                  <td lang={r.locale || undefined}>{r.text}</td>
                  <td>
                    <button
                      className="btn s d"
                      onClick={async () => {
                        if (!confirm("Delete this review?")) return;
                        await api("/api/reviews", {
                          method: "DELETE",
                          json: { id: r.id },
                        });
                        setMsg("Review deleted");
                        refresh();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reviews.length ? <p className="mut">No reviews yet.</p> : null}
        </div>
      )}

      {tab === "requests" && (
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
                          onClick={() =>
                            run("Reveal approved", async () => {
                              await api("/api/private-requests", {
                                method: "PATCH",
                                json: { id: r.id, approve: true },
                              });
                            })
                          }
                        >
                          Approve reveal
                        </button>{" "}
                        <button
                          className="btn s o"
                          onClick={() =>
                            run("Reveal denied", async () => {
                              await api("/api/private-requests", {
                                method: "PATCH",
                                json: { id: r.id, approve: false },
                              });
                            })
                          }
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
          {!requests.length ? (
            <p className="mut">No private-handle requests.</p>
          ) : null}
        </div>
      )}

      {tab === "blog" && (
        <>
          <div className="card">
            <label>Post title</label>
            <input
              value={blog.title}
              onChange={(e) => setBlog({ ...blog, title: e.target.value })}
            />
            <label>Body</label>
            <textarea
              rows={4}
              value={blog.body}
              onChange={(e) => setBlog({ ...blog, body: e.target.value })}
            />
            <button
              className="btn"
              onClick={() =>
                run("Blog post published", async () => {
                  await api("/api/blog", { method: "POST", json: blog });
                  setBlog({ title: "", body: "" });
                })
              }
            >
              Publish post
            </button>
          </div>
          <div className="tbl" style={{ marginTop: 14 }}>
            <table>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>
                      <button
                        className="btn s o"
                        onClick={() => {
                          if (!confirm(`Delete post “${p.title}”?`)) return;
                          run("Blog post deleted", async () => {
                            await api("/api/blog", {
                              method: "DELETE",
                              json: { id: p.id },
                            });
                          });
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!posts.length ? <p className="mut">No blog posts yet.</p> : null}
          </div>
        </>
      )}

      {tab === "set" && !settings ? (
        <p className="mut">Loading settings…</p>
      ) : null}
      {tab === "set" && settings && (
        <div className="card" style={{ maxWidth: 560 }}>
          <h3>Escrow & crypto settings</h3>
          <p className="sm mut">
            Payments are crypto-only: USDT TRC20 (Tron) and USDT BEP20 (BNB Smart
            Chain). No JazzCash / bank / local methods.
          </p>
          <label>Escrow fee on seller listings (%)</label>
          <input
            type="number"
            min={0}
            max={30}
            value={settings.fee}
            onChange={(e) =>
              setSettings({ ...settings, fee: Number(e.target.value) })
            }
          />
          <div className="note sm">
            <b>Trust Wallet tip:</b> App ko Trust Wallet se “link” nahi karte.
            Trust Wallet mein USDT deposit addresses copy karke yahan paste
            karein. Buyer wahan send karega; aap Trust Wallet / Tronscan /
            BscScan se check karke deal chat mein “Confirm payment” dabayein.
            Auto-confirm ke liye baad mein TronGrid + BscScan API keys chahiye
            hongi — Trust Wallet khud website ko webhook nahi bhejta.
          </div>
          <label>
            <input
              type="checkbox"
              checked={settings.autoDetectCrypto}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  autoDetectCrypto: e.target.checked,
                })
              }
              style={{ width: "auto", marginRight: 8 }}
            />
            Auto-detect crypto (placeholder — needs explorer API keys later)
          </label>
          <label>Payment window (minutes)</label>
          <input
            type="number"
            min={15}
            max={180}
            value={settings.paymentWindowMins ?? 60}
            onChange={(e) =>
              setSettings({
                ...settings,
                paymentWindowMins: Number(e.target.value),
              })
            }
          />
          <label>Seller delivery window (hours after funds held)</label>
          <input
            type="number"
            min={1}
            max={168}
            value={settings.deliveryWindowHours ?? 24}
            onChange={(e) =>
              setSettings({
                ...settings,
                deliveryWindowHours: Number(e.target.value),
              })
            }
          />
          <p className="sm mut">
            Default 24h. If seller does not deliver in time, buyer can cancel or
            claim refund from the deal room.
          </p>
          <label>Escrow hold guidance (days)</label>
          <input
            type="number"
            min={1}
            max={60}
            value={settings.escrowHoldDays ?? 7}
            onChange={(e) =>
              setSettings({
                ...settings,
                escrowHoldDays: Number(e.target.value),
              })
            }
          />
          <p className="sm mut">
            Shown to buyers: funds stay held until deal completes (typically up
            to this many days). Release only after buyer confirms delivery.
          </p>
          <label>
            <input
              type="checkbox"
              checked={!!settings.autoHoldOnProof}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  autoHoldOnProof: e.target.checked,
                })
              }
              style={{ width: "auto", marginRight: 8 }}
            />
            Auto-hold funds when buyer submits TX proof
          </label>
          <h3 style={{ marginTop: 18 }}>Escrow USDT addresses</h3>
          {settings.cryptoWallets.map((w, i) => (
            <div key={w.asset} style={{ marginBottom: 10 }}>
              <label>
                <input
                  type="checkbox"
                  checked={w.enabled}
                  onChange={(e) => {
                    const cryptoWallets = [...settings.cryptoWallets];
                    cryptoWallets[i] = { ...w, enabled: e.target.checked };
                    setSettings({ ...settings, cryptoWallets });
                  }}
                  style={{ width: "auto", marginRight: 8 }}
                />
                {w.label} {w.network ? `· ${w.network}` : ""}
              </label>
              <input
                placeholder={
                  w.asset === "USDT_TRC20"
                    ? "T… Tron address from Trust Wallet"
                    : "0x… BNB Smart Chain address from Trust Wallet"
                }
                value={w.address}
                onChange={(e) => {
                  const cryptoWallets = [...settings.cryptoWallets];
                  cryptoWallets[i] = { ...w, address: e.target.value.trim() };
                  setSettings({ ...settings, cryptoWallets });
                }}
              />
            </div>
          ))}
          <button
            className="btn"
            onClick={() =>
              run("Crypto settings saved", async () => {
                await api("/api/admin/settings", {
                  method: "POST",
                  json: { ...settings, allowDirectPayToSeller: false },
                });
              })
            }
          >
            Save settings
          </button>

          <h3 style={{ marginTop: 28 }}>Change admin password</h3>
          <p className="sm mut">
            Live pe pehle default <code>admin123</code> change kar dein.
          </p>
          <label>Current password</label>
          <input
            type="password"
            value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })}
          />
          <label>New password</label>
          <input
            type="password"
            value={pw.next}
            onChange={(e) => setPw({ ...pw, next: e.target.value })}
          />
          <button
            className="btn o"
            style={{ marginTop: 10 }}
            onClick={() =>
              run("Admin password updated", async () => {
                await api("/api/admin/password", {
                  method: "POST",
                  json: pw,
                });
                setPw({ current: "", next: "" });
              })
            }
          >
            Update password
          </button>
        </div>
      )}
    </section>
  );
}
