import assert from "node:assert/strict";
import test from "node:test";
import { compareListings, listingBand } from "./listing-rank";

const seller = (rating: number, reviewCount = 4) => ({ rating, reviewCount });

test("sold channel sinks, stock ranks by rating, new channels stay newest", () => {
  const rows = [
    { id: 1, stock: 1, soldCount: 0, price: 10, seller: seller(5) },
    { id: 2, stock: 0, soldCount: 1, soldOut: true, price: 1, seller: seller(5) },
    { id: 3, stock: 100, soldCount: 0, price: 20, seller: seller(3, 2) },
    { id: 4, stock: 100, soldCount: 10, price: 20, seller: seller(4.8, 20) },
    { id: 8, stock: 1, soldCount: 0, price: 30, seller: seller(1) },
    {
      id: 5,
      isFreelance: true,
      soldCount: 40,
      price: 15,
      seller: seller(4.2, 9),
    },
  ];
  const order = [...rows].sort((a, b) => compareListings(a, b)).map((r) => r.id);
  assert.deepEqual(order, [4, 5, 3, 8, 1, 2]);
  assert.equal(listingBand(rows[1]), 2);
  assert.equal(listingBand(rows[2]), 0);
  assert.equal(listingBand(rows[0]), 1);
});

test("a last unit of a stock batch stays with stock, not with new channels", () => {
  const last = { id: 9, stock: 1, soldCount: 99, seller: seller(4) };
  const fresh = { id: 20, stock: 1, soldCount: 0, seller: seller(5) };
  assert.equal(listingBand(last), 0);
  assert.equal(listingBand(fresh), 1);
  assert.ok(compareListings(last, fresh) < 0);
});

test("price sort still keeps a sold channel at the bottom", () => {
  const sold = { id: 2, stock: 0, soldOut: true, price: 1, seller: seller(5) };
  const fresh = { id: 8, stock: 1, soldCount: 0, price: 500, seller: seller(1) };
  const order = [sold, fresh]
    .sort((a, b) => compareListings(a, b, "price_asc"))
    .map((r) => r.id);
  assert.deepEqual(order, [8, 2]);
});
