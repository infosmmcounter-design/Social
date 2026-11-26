"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/types";

export default function ApplyPage() {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    about: "",
    title: "",
    cat: "youtube",
    price: "",
    desc: "",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await api("/api/applications", {
        method: "POST",
        json: { ...form, price: Number(form.price) },
      });
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  if (done) {
    return (
      <section className="sec">
        <h1 style={{ fontSize: "2rem" }}>Application received</h1>
        <p className="mut">
          We will review it. Approving your seller access is at our discretion.
          Meanwhile you can still buy as a guest/buyer.
        </p>
        <Link className="btn" href="/">
          Back home
        </Link>
      </section>
    );
  }

  return (
    <section className="sec" style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: "2rem" }}>Apply to become a seller</h1>
      <div className="seller-apply" style={{ marginBottom: 16 }}>
        <span>Sell accounts and freelance gigs</span>
        <small>1. Send this form. 2. Admin approves you. 3. Open the seller dashboard and list stock.</small>
      </div>
      <p className="mut">
        Approval is manual. After it, your seller dashboard is where new listings are added.
      </p>
      <form className="card" onSubmit={submit}>
        <label>Full name</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
        <label>Phone</label>
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <label>Country</label>
        <input value={form.country} onChange={(e) => set("country", e.target.value)} />
        <label>About you and your experience</label>
        <textarea
          rows={3}
          value={form.about}
          onChange={(e) => set("about", e.target.value)}
        />
        <h3 style={{ marginTop: 18 }}>First service to list</h3>
        <label>Title</label>
        <input value={form.title} onChange={(e) => set("title", e.target.value)} required />
        <label>Category board</label>
        <select value={form.cat} onChange={(e) => set("cat", e.target.value)}>
          {CATEGORIES.map(([k, n]) => (
            <option key={k} value={k}>
              {n}
            </option>
          ))}
        </select>
        <p className="sm mut">
          Pick <b>Freelance Services</b> to list a gig (editing, growth, AI
          work…). Other boards are for accounts &amp; tools.
        </p>
        <label>Your price (USD)</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          required
        />
        <label>Details</label>
        <textarea
          rows={3}
          value={form.desc}
          onChange={(e) => set("desc", e.target.value)}
        />
        <p className="sm mut">Identity verification may be requested before approval.</p>
        {err ? <p className="err">{err}</p> : null}
        <button className="btn" type="submit">
          Submit application
        </button>
      </form>
    </section>
  );
}
