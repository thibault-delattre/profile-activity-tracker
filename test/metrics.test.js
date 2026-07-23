import assert from "node:assert/strict";
import test from "node:test";
import { buildMetrics, flattenDays } from "../src/metrics.js";

const config = {
  username: "thibault-delattre",
  excludedRepositories: ["profile"],
  brand: {
    accent: "#2f81f7",
  },
};

test("flattenDays returns ordered, valid contribution days", () => {
  const result = flattenDays([
    {
      contributionDays: [
        { date: "2026-07-02", contributionCount: 2 },
        { date: "2026-07-01", contributionCount: 1 },
      ],
    },
  ]);

  assert.deepEqual(
    result.map((day) => day.date),
    ["2026-07-01", "2026-07-02"],
  );
});

test("buildMetrics creates week, month, year, and all-time totals", () => {
  const metrics = buildMetrics(
    createPayload(),
    config,
    new Date("2026-07-23T14:00:00Z"),
  );

  assert.deepEqual(metrics.activity.week, { commits: 3, activeDays: 2 });
  assert.deepEqual(metrics.activity.month, { commits: 7, activeDays: 3 });
  assert.deepEqual(metrics.activity.year, { commits: 20, activeDays: 4 });
  assert.deepEqual(metrics.activity.total, {
    commits: 45,
    activeDays: 6,
  });
  assert.equal(metrics.schemaVersion, 3);
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
        week: collection(3, [1, 2, 0]),
        month: collection(7, [1, 2, 0, 4]),
        year: collection(20, [1, 2, 0, 4, 3]),
        yearly: {
          2025: collection(25, [1, 0, 2]),
          2026: collection(20, [1, 2, 0, 4, 3]),
        },
      },
    },
    rateLimit: { cost: 2, remaining: 4998 },
  };
}

function collection(commits, counts) {
  return {
    totalCommitContributions: commits,
    contributionCalendar: {
      weeks: [
        {
          contributionDays: counts.map((contributionCount, index) => ({
            date: `2026-07-${String(index + 1).padStart(2, "0")}`,
            contributionCount,
          })),
        },
      ],
    },
  };
}
