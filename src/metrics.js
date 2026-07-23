/**
 * @typedef {{date: string, contributionCount: number}} ContributionDay
 */

/**
 * Convert the GraphQL payload into a small, stable rendering model.
 *
 * @param {Record<string, any>} data
 * @param {import("./config.js").TrackerConfig} config
 * @param {Date} generatedAt
 */
export function buildMetrics(data, config, generatedAt) {
  const user = data.user;
  const current = user.current;
  const previous = user.previous;
  const activityDays = flattenDays(current?.contributionCalendar?.weeks);
  const repositories = user.repositories?.nodes ?? [];
  const excluded = new Set(
    config.excludedRepositories.map((name) => name.toLowerCase()),
  );

  const currentContributions =
    current?.contributionCalendar?.totalContributions ?? 0;
  const previousContributions =
    previous?.contributionCalendar?.totalContributions ?? 0;

  const contributedRepositories = (
    current?.commitContributionsByRepository ?? []
  ).filter(({ repository, contributions }) => {
    return (
      contributions?.totalCount > 0 &&
      !repository?.isFork &&
      !repository?.isArchived &&
      !isExcluded(repository?.name, excluded)
    );
  });

  return {
    schemaVersion: 1,
    username: config.username,
    displayName: config.displayName,
    generatedAt: generatedAt.toISOString(),
    periodDays: config.periodDays,
    contributions: currentContributions,
    previousContributions,
    momentumPercent: calculateTrend(
      currentContributions,
      previousContributions,
    ),
    activeDays: activityDays.filter((day) => day.contributionCount > 0).length,
    longestStreak: calculateLongestStreak(activityDays),
    commits: current?.totalCommitContributions ?? 0,
    issues: current?.totalIssueContributions ?? 0,
    pullRequestsOpened: current?.totalPullRequestContributions ?? 0,
    pullRequestsMerged: data.currentMerged?.issueCount ?? 0,
    reviews: current?.totalPullRequestReviewContributions ?? 0,
    restrictedContributions: current?.restrictedContributionsCount ?? 0,
    repositoriesContributedTo: contributedRepositories.length,
    weeklyTotals: calculateWeeklyTotals(
      current?.contributionCalendar?.weeks ?? [],
    ),
    activityDays,
    languages: aggregateLanguages(
      repositories,
      excluded,
      config.maxLanguages,
    ),
    featuredRepository: selectFeaturedRepository(repositories, excluded),
    rateLimit: data.rateLimit ?? null,
  };
}

/**
 * @param {Array<{contributionDays?: ContributionDay[]}> | undefined} weeks
 * @returns {ContributionDay[]}
 */
export function flattenDays(weeks = []) {
  return weeks
    .flatMap((week) => week.contributionDays ?? [])
    .filter(
      (day) =>
        typeof day.date === "string" &&
        Number.isFinite(day.contributionCount),
    )
    .sort((left, right) => left.date.localeCompare(right.date));
}

/**
 * @param {ContributionDay[]} days
 */
export function calculateLongestStreak(days) {
  let longest = 0;
  let current = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

/**
 * @param {number} current
 * @param {number} previous
 */
export function calculateTrend(current, previous) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  const trend = Math.round(((current - previous) / previous) * 100);
  return Math.max(-999, Math.min(999, trend));
}

/**
 * @param {Array<{contributionDays?: ContributionDay[]}>} weeks
 */
function calculateWeeklyTotals(weeks) {
  return weeks.map((week) =>
    (week.contributionDays ?? []).reduce(
      (total, day) => total + Math.max(0, day.contributionCount ?? 0),
      0,
    ),
  );
}

/**
 * @param {Array<Record<string, any>>} repositories
 * @param {Set<string>} excluded
 * @param {number} limit
 */
function aggregateLanguages(repositories, excluded, limit) {
  /** @type {Map<string, {name: string, color: string | null, size: number}>} */
  const totals = new Map();

  for (const repository of repositories) {
    if (
      repository?.isFork ||
      repository?.isArchived ||
      isExcluded(repository?.name, excluded)
    ) {
      continue;
    }

    for (const edge of repository?.languages?.edges ?? []) {
      const name = edge?.node?.name;
      const size = Number(edge?.size ?? 0);

      if (!name || size <= 0) {
        continue;
      }

      const previous = totals.get(name) ?? {
        name,
        color: edge.node.color ?? null,
        size: 0,
      };
      previous.size += size;
      totals.set(name, previous);
    }
  }

  const totalSize = [...totals.values()].reduce(
    (total, language) => total + language.size,
    0,
  );

  if (totalSize === 0) {
    return [];
  }

  return [...totals.values()]
    .sort((left, right) => right.size - left.size)
    .slice(0, limit)
    .map((language) => ({
      name: language.name,
      color: language.color,
      size: language.size,
      percentage: Math.round((language.size / totalSize) * 100),
    }));
}

/**
 * @param {Array<Record<string, any>>} repositories
 * @param {Set<string>} excluded
 */
function selectFeaturedRepository(repositories, excluded) {
  const repository = repositories.find(
    (candidate) =>
      !candidate?.isFork &&
      !candidate?.isArchived &&
      !isExcluded(candidate?.name, excluded),
  );

  if (!repository) {
    return null;
  }

  return {
    name: repository.name,
    nameWithOwner: repository.nameWithOwner,
    url: repository.url,
    description: repository.description ?? "",
    updatedAt: repository.updatedAt,
    stars: repository.stargazerCount ?? 0,
  };
}

/**
 * @param {unknown} repositoryName
 * @param {Set<string>} excluded
 */
function isExcluded(repositoryName, excluded) {
  return (
    typeof repositoryName === "string" &&
    excluded.has(repositoryName.toLowerCase())
  );
}
