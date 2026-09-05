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
            login: "example-user",
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
          year2025: collection(25),
          year2026: collection(20),
        },
        rateLimit: { cost: 2, remaining: 4997 },
      },
    });
  };

  const result = await fetchGitHubActivity({
    token: "test-token",
    username: "example-user",
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
  assert.match(requests[1].body.query, /totalContributions/);
  assert.doesNotMatch(requests[1].body.query, /totalCommitContributions/);
  assert.equal(result.user.login, "example-user");
  assert.deepEqual(Object.keys(result.user.periods.yearly), ["2025", "2026"]);
});

test("fetchGitHubActivity requests the year the rolling window starts in", async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);
    requests.push(body);

    if (body.query.includes("ProfileMetadata")) {
      return jsonResponse({
        data: {
          user: {
            login: "example-user",
            languageRepositories: {
              nodes: [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
            // GitHub omits 2025 because that year holds no contributions.
            contributionsCollection: { contributionYears: [2026] },
          },
        },
      });
    }

    return jsonResponse({
      data: { user: { year2025: collection(0), year2026: collection(4) } },
    });
  };

  const result = await fetchGitHubActivity({
    token: "test-token",
    username: "example-user",
    windows: createActivityWindows(new Date("2026-07-23T14:00:00Z")),
    fetchImpl,
  });

  assert.deepEqual(Object.keys(result.user.periods.yearly), ["2025", "2026"]);
  assert.match(requests[1].query, /year2025/);
});

test("fetchGitHubActivity rejects a year whose calendar is missing", async () => {
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);

    if (body.query.includes("ProfileMetadata")) {
      return jsonResponse({
        data: {
          user: {
            login: "example-user",
            languageRepositories: {
              nodes: [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
            contributionsCollection: { contributionYears: [2026, 2025] },
          },
        },
      });
    }

    return jsonResponse({ data: { user: { year2026: collection(4) } } });
  };

  await assert.rejects(
    fetchGitHubActivity({
      token: "test-token",
      username: "example-user",
      windows: createActivityWindows(new Date("2026-07-23T14:00:00Z")),
      fetchImpl,
    }),
    /2025 is missing/,
  );
});

test("buildPeriodQuery fetches only canonical years with a shared cutoff", () => {
  const windows = createActivityWindows(new Date("2026-07-23T14:00:00Z"));
  const request = buildPeriodQuery([2025, 2026], windows);

  assert.equal(request.variables.year2026From, "2026-01-01T00:00:00.000Z");
  assert.equal(request.variables.year2026To, "2026-07-23T14:00:00.000Z");
  assert.doesNotMatch(request.query, /week:|month:|year:/);
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
      username: "example-user",
      windows: createActivityWindows(new Date("2026-07-23T14:00:00Z")),
      fetchImpl,
    }),
    /Something went wrong/,
  );
});

function collection(contributions) {
  return {
    contributionCalendar: {
      totalContributions: contributions,
      weeks: [],
    },
  };
}

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
