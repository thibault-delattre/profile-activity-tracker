import assert from "node:assert/strict";
import test from "node:test";
import { createActivityWindows } from "../src/dates.js";

test("createActivityWindows returns calendar-to-date UTC periods", () => {
  const windows = createActivityWindows(new Date("2026-07-23T14:00:00Z"));

  assert.equal(windows.week.fromDate, "2026-07-20");
  assert.equal(windows.week.toDate, "2026-07-23");
  assert.equal(windows.month.fromDate, "2026-07-01");
  assert.equal(windows.year.fromDate, "2026-01-01");
});

test("createActivityWindows rejects invalid dates", () => {
  assert.throws(
    () => createActivityWindows(new Date("invalid")),
    /valid Date/,
  );
});
