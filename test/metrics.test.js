import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMetrics,
  calculateLongestStreak,
  calculateTrend,
} from "../src/metrics.js";

const config = {
  username: "thibault-delattre",
  displayName: "Thibault Delattre",
  periodDays: 90,
  maxLanguages: 2,
  excludedRepositories: ["profile"],
  brand: {
    label: "ENGINEERING PULSE",
    accent: "#2f81f7",
  },
};

test("calculateLongestStreak finds the longest consecutive active run", () => {
  const days = [1, 2, 0, 4, 3, 1, 0, 2].map((contributionCount, index) => ({
    date: `2026-07-${String(index + 1).padStart(2, "0")}`,
    contributionCount,
  }));

  assert.equal(calculateLongestStreak(days), 3);
});

test("calculateTrend handles growth, decline, and a zero baseline", () => {
  assert.equal(calculateTrend(120, 100), 20);
  assert.equal(calculateTrend(75, 100), -25);
  assert.equal(calculateTrend(10, 0), 100);
  assert.equal(calculateTrend(0, 0), 0);
});

test("buildMetrics filters excluded repositories and aggregates languages", () => {
  const data = createPayload();
  const metrics = buildMetrics(data, config, new Date("2026-07-23T14:00:00Z"));

  assert.equal(metrics.contributions, 8);
  assert.equal(metrics.activeDays, 4);
  assert.equal(metrics.longestStreak, 3);
  assert.equal(metrics.momentumPercent, 100);
  assert.equal(metrics.pullRequestsMerged, 3);
  assert.equal(metrics.repositoriesContributedTo, 1);
  assert.deepEqual(
    metrics.languages.map(({ name, percentage }) => ({ name, percentage })),
    [
      { name: "TypeScript", percentage: 75 },
      { name: "Python", percentage: 25 },
    ],
  );
  assert.equal(metrics.featuredRepository.name, "tracker");
});

function createPayload() {
  return {
    user: {
      repositories: {
        nodes: [
          {
            name: "tracker",
            nameWithOwner: "thibault-delattre/tracker",
            url: "https://github.com/thibault-delattre/tracker",
            description: "Tracker",
            updatedAt: "2026-07-23T12:00:00Z",
            stargazerCount: 2,
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
            nameWithOwner: "thibault-delattre/profile",
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
      current: {
        contributionCalendar: {
          totalContributions: 8,
          weeks: [
            {
              contributionDays: [1, 2, 1, 0, 0, 4, 0].map(
                (contributionCount, index) => ({
                  date: `2026-07-${String(index + 1).padStart(2, "0")}`,
                  contributionCount,
                }),
              ),
            },
          ],
        },
        totalCommitContributions: 5,
        totalIssueContributions: 1,
        totalPullRequestContributions: 2,
        totalPullRequestReviewContributions: 4,
        restrictedContributionsCount: 0,
        commitContributionsByRepository: [
          {
            repository: {
              name: "tracker",
              isFork: false,
              isArchived: false,
            },
            contributions: { totalCount: 5 },
          },
          {
            repository: {
              name: "profile",
              isFork: false,
              isArchived: false,
            },
            contributions: { totalCount: 3 },
          },
        ],
      },
      previous: {
        contributionCalendar: {
          totalContributions: 4,
          weeks: [],
        },
        totalCommitContributions: 4,
        totalIssueContributions: 0,
        totalPullRequestContributions: 0,
        totalPullRequestReviewContributions: 0,
        restrictedContributionsCount: 0,
      },
    },
    currentMerged: { issueCount: 3 },
    previousMerged: { issueCount: 1 },
    rateLimit: { cost: 1, remaining: 999 },
  };
}
