const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

const PROFILE_ACTIVITY_QUERY = `
  query ProfileActivity(
    $login: String!
    $currentFrom: DateTime!
    $currentTo: DateTime!
    $previousFrom: DateTime!
    $previousTo: DateTime!
    $currentMergedQuery: String!
    $previousMergedQuery: String!
  ) {
    user(login: $login) {
      login
      name
      url
      repositories(
        first: 100
        ownerAffiliations: [OWNER]
        isFork: false
        privacy: PUBLIC
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes {
          name
          nameWithOwner
          url
          description
          isArchived
          isFork
          updatedAt
          stargazerCount
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
      current: contributionsCollection(from: $currentFrom, to: $currentTo) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        restrictedContributionsCount
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            name
            nameWithOwner
            url
            isArchived
            isFork
          }
          contributions {
            totalCount
          }
        }
      }
      previous: contributionsCollection(from: $previousFrom, to: $previousTo) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        restrictedContributionsCount
      }
    }
    currentMerged: search(
      query: $currentMergedQuery
      type: ISSUE
      first: 1
    ) {
      issueCount
    }
    previousMerged: search(
      query: $previousMergedQuery
      type: ISSUE
      first: 1
    ) {
      issueCount
    }
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`;

/**
 * @param {{
 *   token: string,
 *   username: string,
 *   windows: import("./dates.js").createDateWindows extends (...args: any[]) => infer R ? R : never,
 *   fetchImpl?: typeof fetch
 * }} input
 */
export async function fetchGitHubActivity({
  token,
  username,
  windows,
  fetchImpl = fetch,
}) {
  if (!token) {
    throw new Error(
      "A GitHub token is required. Set GH_TOKEN or GITHUB_TOKEN.",
    );
  }

  const variables = {
    login: username,
    currentFrom: windows.current.from.toISOString(),
    currentTo: windows.current.to.toISOString(),
    previousFrom: windows.previous.from.toISOString(),
    previousTo: windows.previous.to.toISOString(),
    currentMergedQuery: mergedPullRequestQuery(username, windows.current),
    previousMergedQuery: mergedPullRequestQuery(username, windows.previous),
  };

  const response = await fetchImpl(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "profile-activity-tracker",
    },
    body: JSON.stringify({
      query: PROFILE_ACTIVITY_QUERY,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub GraphQL request failed with ${response.status} ${response.statusText}.`,
    );
  }

  const payload = await response.json();

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const messages = payload.errors
      .map((error) => error.message)
      .filter(Boolean)
      .join("; ");
    throw new Error(`GitHub GraphQL returned errors: ${messages}`);
  }

  if (!payload.data?.user) {
    throw new Error(`GitHub user "${username}" was not found.`);
  }

  return payload.data;
}

/**
 * @param {string} username
 * @param {{fromDate: string, toDate: string}} window
 */
function mergedPullRequestQuery(username, window) {
  return [
    `author:${username}`,
    "is:pr",
    "is:merged",
    `merged:${window.fromDate}..${window.toDate}`,
  ].join(" ");
}
