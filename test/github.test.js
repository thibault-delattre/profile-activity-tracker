import assert from "node:assert/strict";
import test from "node:test";
import { createActivityWindows } from "../src/dates.js";
import {
  buildPeriodQuery,
  fetchGitHubActivity,
} from "../src/github.js";

test("fetchGitHubActivity retrieves metadata and historical periods", async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);
    requests.push({ url, options, body });

    if (body.query.includes("ProfileMetadata")) {
      return jsonResponse({
        data: {
          user: {
            login: "thibault-delattre",
            languageRepositories: {
              nodes: [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
            contributionsCollection: {
              contributionYears: [2026, 2025],
            },
          },
          rateLimit: { cost: 1, remaining: 4999 },
        },
      });
    }

    return jsonResponse({
      data: {
        user: {
          week: collection(2),
          month: collection(5),
          year: collection(20),
          year2025: collection(25),
          year2026: collection(20),
        },
        rateLimit: { cost: 2, remaining: 4997 },
      },
    });
  };

  const result = await fetchGitHubActivity({
    token: "test-token",
    username: "thibault-delattre",
    windows: createActivityWindows(new Date("2026-07-23T14:00:00Z")),
    fetchImpl,
  });

  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, "https://api.github.com/graphql");
  assert.equal(
    requests[0].options.headers.Authorization,
    "Bearer test-token",
  );
  assert.match(requests[1].body.query, /year2025/);
  assert.match(requests[1].body.query, /year2026/);
  assert.equal(result.user.login, "thibault-delattre");
  assert.deepEqual(Object.keys(result.user.periods.yearly), ["2025", "2026"]);
});

test("buildPeriodQuery uses Monday, month, and year boundaries", () => {
  const windows = createActivityWindows(new Date("2026-07-23T14:00:00Z"));
  const request = buildPeriodQuery([2025, 2026], windows);

  assert.equal(request.variables.weekFrom, "2026-07-20T00:00:00.000Z");
  assert.equal(request.variables.monthFrom, "2026-07-01T00:00:00.000Z");
  assert.equal(request.variables.yearFrom, "2026-01-01T00:00:00.000Z");
  assert.equal(request.variables.year2025From, "2025-01-01T00:00:00.000Z");
  assert.equal(request.variables.year2025To, "2025-12-31T23:59:59.999Z");
});

test("fetchGitHubActivity reports GraphQL errors", async () => {
  const fetchImpl = async () =>
    jsonResponse({
      errors: [{ message: "Something went wrong" }],
    });

  await assert.rejects(
    fetchGitHubActivity({
      token: "test-token",
      username: "thibault-delattre",
      windows: createActivityWindows(new Date("2026-07-23T14:00:00Z")),
      fetchImpl,
    }),
    /Something went wrong/,
  );
});

function collection(commits) {
  return {
    totalCommitContributions: commits,
    contributionCalendar: { weeks: [] },
  };
}

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
