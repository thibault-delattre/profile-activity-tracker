import assert from "node:assert/strict";
import test from "node:test";
import { createDateWindows } from "../src/dates.js";

test("createDateWindows returns adjacent non-overlapping UTC periods", () => {
  const windows = createDateWindows(new Date("2026-07-23T14:00:00Z"), 90);

  assert.equal(windows.current.fromDate, "2026-04-25");
  assert.equal(windows.current.toDate, "2026-07-23");
  assert.equal(windows.previous.fromDate, "2026-01-25");
  assert.equal(windows.previous.toDate, "2026-04-24");
  assert.equal(
    windows.current.from.getTime() - windows.previous.to.getTime(),
    1,
  );
});

test("createDateWindows rejects invalid dates", () => {
  assert.throws(
    () => createDateWindows(new Date("invalid"), 90),
    /valid Date/,
  );
});
