import { test, expect, jest } from "@jest/globals";
import Timer from "../models/Timer.js";
import { createTimer, listTimers } from "../controllers/timerController.js";
import { setupTestDB } from "./setup.js";

setupTestDB();

function mockRes(shopName) {
  return {
    locals: { shopify: { session: { shop: shopName } } },
    statusCode: 200,
    data: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
  };
}

test("createTimer saves timer with correct shop", async () => {
  const req = {
    body: {
      name: "Flash Sale",
      type: "fixed",
      startDate: new Date("2026-12-01").toISOString(),
      endDate: new Date("2026-12-05").toISOString(),
    },
  };
  const res = mockRes("my-shop.myshopify.com");
  const next = jest.fn();

  await createTimer(req, res, next);

  expect(res.statusCode).toBe(201);
  expect(res.data.name).toBe("Flash Sale");
  expect(res.data.shop).toBe("my-shop.myshopify.com");

  const found = await Timer.findById(res.data._id);
  expect(found).not.toBeNull();
  expect(found.shop).toBe("my-shop.myshopify.com");
});

test("listTimers isolates data by shop", async () => {
  await Timer.create({ shop: "shop-a.myshopify.com", name: "Timer A", type: "evergreen", duration: 3600 });
  await Timer.create({ shop: "shop-b.myshopify.com", name: "Timer B", type: "evergreen", duration: 3600 });
  await Timer.create({ shop: "shop-a.myshopify.com", name: "Timer C", type: "fixed", startDate: new Date(), endDate: new Date("2027-01-01") });

  const req = { query: {} };
  const res = mockRes("shop-a.myshopify.com");
  const next = jest.fn();

  await listTimers(req, res, next);

  expect(res.data.length).toBe(2);
  expect(res.data.every((t) => t.shop === "shop-a.myshopify.com")).toBe(true);
});

test("createTimer rejects evergreen without duration", async () => {
  const req = {
    body: {
      name: "Bad Evergreen",
      type: "evergreen",
    },
  };
  const res = mockRes("test.myshopify.com");
  const next = jest.fn();

  await createTimer(req, res, next);

  expect(res.statusCode).toBe(400);
  expect(res.data.error).toMatch(/duration/i);
});
