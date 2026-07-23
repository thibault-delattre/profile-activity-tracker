import assert from "node:assert/strict";
import test from "node:test";
import { createDateWindows } from "../src/dates.js";
import { fetchGitHubActivity } from "../src/github.js";

test("fetchGitHubActivity sends an authenticated GraphQL request", async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return new Response(
      JSON.stringify({
        data: {
          user: { login: "thibault-delattre" },
          currentMerged: { issueCount: 2 },
          previousMerged: { issueCount: 1 },
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  };

  const result = await fetchGitHubActivity({
    token: "test-token",
    username: "thibault-delattre",
    windows: createDateWindows(new Date("2026-07-23T14:00:00Z"), 90),
    fetchImpl,
  });

  assert.equal(request.url, "https://api.github.com/graphql");
  assert.equal(request.options.headers.Authorization, "Bearer test-token");
  assert.equal(result.user.login, "thibault-delattre");

  const body = JSON.parse(request.options.body);
  assert.match(body.variables.currentMergedQuery, /author:thibault-delattre/);
  assert.match(body.variables.currentMergedQuery, /2026-04-25\.\.2026-07-23/);
});

test("fetchGitHubActivity reports GraphQL errors without writing output", async () => {
  const fetchImpl = async () =>
    new Response(
      JSON.stringify({
        errors: [{ message: "Something went wrong" }],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );

  await assert.rejects(
    fetchGitHubActivity({
      token: "test-token",
      username: "thibault-delattre",
      windows: createDateWindows(new Date("2026-07-23T14:00:00Z"), 90),
      fetchImpl,
    }),
    /Something went wrong/,
  );
});
