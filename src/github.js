const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

const METADATA_QUERY = `
  query ProfileMetadata($login: String!) {
    user(login: $login) {
      login
      languageRepositories: repositories(
        first: 100
        ownerAffiliations: [OWNER]
        isFork: false
        privacy: PUBLIC
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes {
          name
          isArchived
          isFork
          languages(first: 100, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      contributionsCollection {
        contributionYears
      }
    }
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`;

const REPOSITORY_PAGE_QUERY = `
  query RepositoryLanguages($login: String!, $after: String!) {
    user(login: $login) {
      languageRepositories: repositories(
        first: 100
        after: $after
        ownerAffiliations: [OWNER]
        isFork: false
        privacy: PUBLIC
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes {
          name
          isArchived
          isFork
          languages(first: 100, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const COLLECTION_FIELDS = `
  contributionCalendar {
    totalContributions
    weeks {
      contributionDays {
        contributionCount
        date
      }
    }
  }
`;

/**
 * Fetch profile metadata, every owned public repository page, and GitHub
 * contribution calendars for every historical year. All displayed periods
 * are derived from these same daily counts.
 *
 * @param {{
 *   token: string,
 *   username: string,
 *   windows: ReturnType<import("./dates.js").createActivityWindows>,
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

  const metadata = await requestGraphQL({
    token,
    query: METADATA_QUERY,
    variables: { login: username },
    fetchImpl,
  });

  if (!metadata.user) {
    throw new Error(`GitHub user "${username}" was not found.`);
  }

  const repositories = [
    ...(metadata.user.languageRepositories?.nodes ?? []),
  ];
  let pageInfo = metadata.user.languageRepositories?.pageInfo;

  while (pageInfo?.hasNextPage && pageInfo.endCursor) {
    const page = await requestGraphQL({
      token,
      query: REPOSITORY_PAGE_QUERY,
      variables: {
        login: username,
        after: pageInfo.endCursor,
      },
      fetchImpl,
    });

    repositories.push(
      ...(page.user?.languageRepositories?.nodes ?? []),
    );
    pageInfo = page.user?.languageRepositories?.pageInfo;
  }

  const years = normalizeYears(
    metadata.user.contributionsCollection?.contributionYears,
    windows,
  );
  const periodRequest = buildPeriodQuery(years, windows);
  const periodData = await requestGraphQL({
    token,
    query: periodRequest.query,
    variables: {
      login: username,
      ...periodRequest.variables,
    },
    fetchImpl,
  });

  if (!periodData.user) {
    throw new Error(`Contribution data for "${username}" was not found.`);
  }

  for (const year of years) {
    if (!Array.isArray(periodData.user[`year${year}`]?.contributionCalendar?.weeks)) {
      throw new Error(`Contribution calendar for ${username} in ${year} is missing.`);
    }
  }

  return {
    user: {
      login: metadata.user.login,
      repositories: { nodes: repositories },
      periods: {
        yearly: Object.fromEntries(
          years.map((year) => [
            String(year),
            periodData.user[`year${year}`],
          ]),
        ),
      },
    },
    rateLimit: periodData.rateLimit ?? metadata.rateLimit ?? null,
  };
}

/**
 * @param {{
 *   token: string,
 *   query: string,
 *   variables: Record<string, unknown>,
 *   fetchImpl: typeof fetch
 * }} input
 */
async function requestGraphQL({ token, query, variables, fetchImpl }) {
  const response = await fetchImpl(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "profile-activity-tracker",
    },
    body: JSON.stringify({ query, variables }),
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

  return payload.data ?? {};
}

/**
 * @param {number[]} years
 * @param {ReturnType<import("./dates.js").createActivityWindows>} windows
 */
export function buildPeriodQuery(years, windows) {
  const declarations = ["$login: String!"];
  const variables = {};
  const yearFields = [];

  for (const year of years) {
    declarations.push(`$year${year}From: DateTime!`);
    declarations.push(`$year${year}To: DateTime!`);
    variables[`year${year}From`] = new Date(
      Date.UTC(year, 0, 1),
    ).toISOString();
    variables[`year${year}To`] =
      year === windows.year.to.getUTCFullYear()
        ? windows.year.to.toISOString()
        : new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString();
    yearFields.push(`
      year${year}: contributionsCollection(
        from: $year${year}From
        to: $year${year}To
      ) {
        ${COLLECTION_FIELDS}
      }
    `);
  }

  return {
    query: `
      query ActivityPeriods(${declarations.join(", ")}) {
        user(login: $login) {
          ${yearFields.join("\n")}
        }
        rateLimit {
          cost
          remaining
          resetAt
        }
      }
    `,
    variables,
  };
}

/**
 * Every calendar year the rolling windows can touch must be requested, even
 * when GitHub omits it from contributionYears because it holds no activity.
 * Otherwise the 365-day window would silently start mid-history.
 *
 * @param {unknown} values
 * @param {ReturnType<import("./dates.js").createActivityWindows>} windows
 */
function normalizeYears(values, windows) {
  const currentYear = windows.year.to.getUTCFullYear();
  const years = Array.isArray(values)
    ? values.filter(
        (year) =>
          Number.isInteger(year) && year >= 2008 && year <= currentYear,
      )
    : [];

  years.push(windows.year.from.getUTCFullYear(), currentYear);

  return [...new Set(years)].sort((left, right) => left - right);
}
