import assert from "node:assert/strict";
import test from "node:test";
import { buildMetrics } from "../src/metrics.js";

const config = {
  username: "example-user",
  introduction: "I build reliable software and thoughtful products.",
  excludedRepositories: ["profile"],
  brand: {
    accent: "#2f81f7",
  },
};

test("buildMetrics creates contribution and active-day totals", () => {
  const metrics = buildMetrics(
    createPayload(),
    config,
    new Date("2026-07-23T14:00:00Z"),
  );

  assert.deepEqual(metrics.activity.week, {
    contributions: 3,
    activeDays: 2,
  });
  assert.deepEqual(metrics.activity.month, {
    contributions: 7,
    activeDays: 3,
  });
  assert.deepEqual(metrics.activity.year, {
    contributions: 20,
    activeDays: 4,
  });
  assert.deepEqual(metrics.activity.total, {
    contributions: 45,
    activeDays: 6,
  });
  assert.equal(metrics.schemaVersion, 6);
  assert.equal(metrics.sourceCount, 1);
  assert.equal("repositories" in metrics, false);
  assert.equal("displayName" in metrics, false);
  assert.deepEqual(
    metrics.languages.map(({ name, percentage }) => ({ name, percentage })),
    [
      { name: "TypeScript", percentage: 75 },
      { name: "Python", percentage: 25 },
    ],
  );
});

function createPayload() {
  return {
    user: {
      repositories: {
        nodes: [
          {
            name: "tracker",
            isFork: false,
            isArchived: false,
            languages: {
              edges: [
                {
                  size: 300,
                  node: { name: "TypeScript", color: "#3178c6" },
                },
                {
                  size: 100,
                  node: { name: "Python", color: "#3572a5" },
                },
              ],
            },
          },
          {
            name: "profile",
            isFork: false,
            isArchived: false,
            languages: {
              edges: [
                {
                  size: 10_000,
                  node: { name: "HTML", color: "#e34c26" },
                },
              ],
            },
          },
        ],
      },
      periods: {
        yearly: {
          2025: collection(25, [12, 0, 13], "2025-07"),
          2026: { contributionCalendar: { totalContributions: 999, weeks: [{ contributionDays: [
            { date: "2026-01-01", contributionCount: 13 },
            { date: "2026-07-01", contributionCount: 4 },
            { date: "2026-07-20", contributionCount: 1 },
            { date: "2026-07-21", contributionCount: 2 },
          ] }] } },
        },
      },
    },
    rateLimit: { cost: 2, remaining: 4998 },
  };
}

function collection(contributions, counts, month) {
  return {
    contributionCalendar: {
      totalContributions: contributions,
      weeks: [
        {
          contributionDays: counts.map((contributionCount, index) => ({
            date: `${month}-${String(index + 1).padStart(2, "0")}`,
            contributionCount,
          })),
        },
      ],
    },
  };
}

function history(entries) {
  const yearly = {};
  for (const [date, contributionCount] of entries) {
    const year = date.slice(0, 4);
    yearly[year] ??= { contributionCalendar: { weeks: [{ contributionDays: [] }] } };
    yearly[year].contributionCalendar.weeks[0].contributionDays.push({ date, contributionCount });
  }
  return { user: { periods: { yearly } } };
}

test("a month-boundary week never reports more than the month containing it", () => {
  const metrics = buildMetrics(history([
    ["2026-08-10", 4],
    ["2026-08-31", 15], ["2026-09-01", 7], ["2026-09-02", 8],
    ["2026-09-06", 99],
  ]), config, new Date("2026-09-05T12:00:00Z"));
  assert.deepEqual(metrics.activity.week, { contributions: 30, activeDays: 3 });
  assert.deepEqual(metrics.activity.month, { contributions: 34, activeDays: 4 });
  assert.deepEqual(metrics.activity.total, metrics.activity.month);
  assert.deepEqual(metrics.periods.week, {
    from: "2026-08-30", to: "2026-09-05", days: 7,
  });
  assertNested(metrics);
});

test("a window crossing New Year counts each date exactly once", () => {
  const metrics = buildMetrics(history([
    ["2025-12-29", 10], ["2025-12-31", 5], ["2026-01-01", 2],
  ]), config, new Date("2026-01-01T12:00:00Z"));
  assert.deepEqual(metrics.activity.week, { contributions: 17, activeDays: 3 });
  assert.deepEqual(metrics.activity.year, { contributions: 17, activeDays: 3 });
  assert.deepEqual(metrics.activity.total, metrics.activity.week);
  assertNested(metrics);
});

test("every column contains the one before it on any generation date", () => {
  const entries = Array.from({ length: 420 }, (_, index) => {
    const date = new Date(Date.UTC(2025, 6, 1) + index * 86_400_000);
    return [date.toISOString().slice(0, 10), index % 3];
  });
  for (const iso of [
    "2026-01-01T00:00:00Z", "2026-08-31T23:00:00Z", "2026-09-05T12:00:00Z",
  ]) {
    assertNested(buildMetrics(history(entries), config, new Date(iso)), iso);
  }
});

/**
 * @param {Record<string, any>} metrics
 * @param {string} [label]
 */
function assertNested({ activity }, label = "") {
  for (const key of ["contributions", "activeDays"]) {
    assert.ok(activity.week[key] <= activity.month[key], `week <= month ${key} ${label}`);
    assert.ok(activity.month[key] <= activity.year[key], `month <= year ${key} ${label}`);
    assert.ok(activity.year[key] <= activity.total[key], `year <= total ${key} ${label}`);
  }
}

test("missing history and duplicate dates fail instead of publishing partial totals", () => {
  assert.throws(() => buildMetrics({}, config, new Date("2026-01-01")), /missing/);
  assert.throws(() => buildMetrics(history([
    ["2026-01-01", 2], ["2026-01-01", 2],
  ]), config, new Date("2026-01-01")), /Duplicate/);
});
