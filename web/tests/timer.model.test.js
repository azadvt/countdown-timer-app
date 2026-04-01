import { test, expect } from "@jest/globals";
import Timer from "../models/Timer.js";
import { setupTestDB } from "./setup.js";

setupTestDB();

test("should fail without required fields", async () => {
  const timer = new Timer({});
  const err = timer.validateSync();

  expect(err.errors.shop).toBeDefined();
  expect(err.errors.name).toBeDefined();
  expect(err.errors.type).toBeDefined();
});

test("should create a fixed timer with correct defaults", async () => {
  const timer = await Timer.create({
    shop: "test-store.myshopify.com",
    name: "Black Friday Sale",
    type: "fixed",
    startDate: new Date("2026-11-25"),
    endDate: new Date("2026-11-30"),
  });

  expect(timer.shop).toBe("test-store.myshopify.com");
  expect(timer.type).toBe("fixed");
  expect(timer.targetType).toBe("all");
  expect(timer.isActive).toBe(true);
  expect(timer.impressions).toBe(0);
  expect(timer.style.size).toBe("medium");
  expect(timer.style.position).toBe("top");
});

test("should reject invalid timer type", async () => {
  const timer = new Timer({
    shop: "test.myshopify.com",
    name: "Bad Timer",
    type: "invalid_type",
  });

  const err = timer.validateSync();
  expect(err.errors.type).toBeDefined();
});

test("getStatus returns correct status for fixed timers", async () => {
  const now = new Date();
  const past = new Date(now.getTime() - 86400000);
  const future = new Date(now.getTime() + 86400000);
  const farFuture = new Date(now.getTime() + 172800000);

  const active = new Timer({
    shop: "s.myshopify.com", name: "Active", type: "fixed",
    startDate: past, endDate: future, isActive: true,
  });
  expect(active.getStatus()).toBe("active");

  const scheduled = new Timer({
    shop: "s.myshopify.com", name: "Scheduled", type: "fixed",
    startDate: future, endDate: farFuture, isActive: true,
  });
  expect(scheduled.getStatus()).toBe("scheduled");

  const expired = new Timer({
    shop: "s.myshopify.com", name: "Expired", type: "fixed",
    startDate: new Date("2024-01-01"), endDate: past, isActive: true,
  });
  expect(expired.getStatus()).toBe("expired");

  const evergreen = new Timer({
    shop: "s.myshopify.com", name: "Evergreen", type: "evergreen",
    duration: 3600, isActive: true,
  });
  expect(evergreen.getStatus()).toBe("active");
});
