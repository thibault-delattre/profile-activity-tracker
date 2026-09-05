import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeCollections,
  mergeGitHubActivity,
} from "../src/aggregate.js";

test("mergeCollections sums contributions and unions active dates", () => {
  const merged = mergeCollections([
    collection(5, [
      ["2026-07-21", 2],
      ["2026-07-22", 0],
    ]),
    collection(7, [
      ["2026-07-21", 3],
      ["2026-07-23", 4],
    ]),
  ]);

  assert.equal(merged.contributionCalendar.totalContributions, 12);
  assert.deepEqual(
    merged.contributionCalendar.weeks[0].contributionDays,
    [
      { date: "2026-07-21", contributionCount: 5 },
      { date: "2026-07-22", contributionCount: 0 },
      { date: "2026-07-23", contributionCount: 4 },
    ],
  );
});

test("mergeGitHubActivity combines repositories and contribution years", () => {
  const merged = mergeGitHubActivity([
    source("primary", "primary-repository", {
      2025: collection(8, [["2025-01-04", 8]]),
      2026: collection(5, [["2026-07-21", 5]]),
    }),
    source("secondary", "secondary-repository", {
      2026: collection(7, [["2026-07-23", 7]]),
    }),
  ]);

  assert.equal(merged.user.login, "primary");
  assert.deepEqual(
    merged.user.repositories.nodes.map((repository) => repository.name),
    ["primary-repository", "secondary-repository"],
  );
  assert.deepEqual(Object.keys(merged.user.periods.yearly), ["2025", "2026"]);
  assert.equal(
    merged.user.periods.yearly["2026"].contributionCalendar
      .totalContributions,
    12,
  );
});

function source(login, repositoryName, yearly) {
  return {
    user: {
      login,
      repositories: { nodes: [{ name: repositoryName }] },
      periods: { yearly },
    },
    rateLimit: { remaining: 4_000 },
  };
}

function collection(totalContributions, days) {
  return {
    contributionCalendar: {
      totalContributions,
      weeks: [
        {
          contributionDays: days.map(([date, contributionCount]) => ({
            date,
            contributionCount,
          })),
        },
      ],
    },
  };
}
