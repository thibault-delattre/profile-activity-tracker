import assert from "node:assert/strict";
import test from "node:test";
import { createActivityWindows } from "../src/dates.js";

test("createActivityWindows returns rolling UTC windows ending today", () => {
  const windows = createActivityWindows(new Date("2026-07-23T14:00:00Z"));

  assert.equal(windows.week.fromDate, "2026-07-17");
  assert.equal(windows.month.fromDate, "2026-06-24");
  assert.equal(windows.year.fromDate, "2025-07-24");
  for (const window of Object.values(windows)) {
    assert.equal(window.toDate, "2026-07-23");
  }
  assert.deepEqual(
    Object.values(windows).map((window) => window.days),
    [7, 30, 365],
  );
});

test("shorter windows always start inside the longer ones", () => {
  for (const iso of [
    "2026-01-01T00:00:00Z",
    "2026-03-01T23:59:59Z",
    "2026-09-05T12:00:00Z",
    "2024-02-29T06:00:00Z",
  ]) {
    const { week, month, year } = createActivityWindows(new Date(iso));
    assert.ok(year.fromDate <= month.fromDate, iso);
    assert.ok(month.fromDate <= week.fromDate, iso);
    assert.ok(week.fromDate <= week.toDate, iso);
  }
});

test("createActivityWindows rejects invalid dates", () => {
  assert.throws(
    () => createActivityWindows(new Date("invalid")),
    /valid Date/,
  );
});
