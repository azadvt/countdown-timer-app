import { test, expect, jest } from "@jest/globals";
import Timer from "../models/Timer.js";
import Analytics from "../models/Analytics.js";
import { trackImpression } from "../controllers/analyticsController.js";
import { setupTestDB } from "./setup.js";

setupTestDB();

function mockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
  };
}

test("trackImpression increments counts correctly", async () => {
  const timer = await Timer.create({
    shop: "analytics-test.myshopify.com",
    name: "Test Timer",
    type: "fixed",
    startDate: new Date(),
    endDate: new Date("2027-01-01"),
  });

  const req = { body: { shop: "analytics-test.myshopify.com", timerId: timer._id } };

  await trackImpression(req, mockRes(), jest.fn());
  await trackImpression(req, mockRes(), jest.fn());

  const updated = await Timer.findById(timer._id);
  expect(updated.impressions).toBe(2);

  const today = new Date().toISOString().split("T")[0];
  const record = await Analytics.findOne({ timerId: timer._id, date: today });
  expect(record).not.toBeNull();
  expect(record.impressions).toBe(2);
});

test("trackImpression rejects missing fields", async () => {
  const res = mockRes();
  await trackImpression({ body: {} }, res, jest.fn());

  expect(res.statusCode).toBe(400);
  expect(res.data.error).toBeDefined();
});
