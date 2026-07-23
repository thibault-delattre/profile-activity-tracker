/**
 * @typedef {{date: string, contributionCount: number}} ContributionDay
 */

/**
 * Convert the GraphQL payload into the rendering model.
 *
 * Commits are GitHub contribution commits: the same eligibility rules used by
 * the profile contribution graph. Active days include days with at least one
 * contribution in GitHub's contribution calendar.
 *
 * @param {Record<string, any>} data
 * @param {import("./config.js").TrackerConfig} config
 * @param {Date} generatedAt
 */
export function buildMetrics(data, config, generatedAt) {
  const periods = data.user?.periods ?? {};
  const yearly = Object.values(periods.yearly ?? {});
  const excluded = new Set(
    config.excludedRepositories.map((name) => name.toLowerCase()),
  );

  return {
    schemaVersion: 2,
    username: config.username,
    displayName: config.displayName,
    generatedAt: generatedAt.toISOString(),
    repositories: data.user?.totalRepositories?.totalCount ?? 0,
    activity: {
      week: summarizeCollection(periods.week),
      month: summarizeCollection(periods.month),
      year: summarizeCollection(periods.year),
      total: {
        commits: yearly.reduce(
          (total, collection) =>
            total + Number(collection?.totalCommitContributions ?? 0),
          0,
        ),
        activeDays: yearly.reduce(
          (total, collection) =>
            total + countActiveDays(collection),
          0,
        ),
      },
    },
    languages: aggregateLanguages(
      data.user?.repositories?.nodes ?? [],
      excluded,
    ),
    rateLimit: data.rateLimit ?? null,
  };
}

/**
 * @param {Record<string, any> | undefined} collection
 */
function summarizeCollection(collection) {
  return {
    commits: Number(collection?.totalCommitContributions ?? 0),
    activeDays: countActiveDays(collection),
  };
}

/**
 * @param {Record<string, any> | undefined} collection
 */
function countActiveDays(collection) {
  return flattenDays(collection?.contributionCalendar?.weeks).filter(
    (day) => day.contributionCount > 0,
  ).length;
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
 * @param {Array<Record<string, any>>} repositories
 * @param {Set<string>} excluded
 */
function aggregateLanguages(repositories, excluded) {
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

  return [...totals.values()]
    .sort((left, right) => right.size - left.size)
    .map((language) => ({
      name: language.name,
      color: language.color,
      size: language.size,
      percentage:
        totalSize === 0
          ? 0
          : Math.round((language.size / totalSize) * 1000) / 10,
    }));
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
