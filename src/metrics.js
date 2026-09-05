import { createActivityWindows } from "./dates.js";

/**
 * @typedef {{date: string, contributionCount: number}} ContributionDay
 */

/**
 * Convert the GraphQL payload into the rendering model.
 *
 * Every displayed period is summed from one map of daily counts, so the
 * columns can never disagree with each other. Contributions and active days
 * come from GitHub's public contribution calendar. When the profile owner
 * enables private contribution visibility, GitHub includes that activity
 * anonymously without exposing repositories.
 *
 * @param {Record<string, any>} data
 * @param {import("./config.js").TrackerConfig} config
 * @param {Date} generatedAt
 */
export function buildMetrics(data, config, generatedAt) {
  const periods = data.user?.periods ?? {};
  const windows = createActivityWindows(generatedAt);
  const yearly = periods.yearly;
  if (!yearly || !yearly[generatedAt.getUTCFullYear()]) {
    throw new Error("Current-year contribution history is missing.");
  }
  const today = windows.year.toDate;
  const days = new Map();
  for (const [year, collection] of Object.entries(yearly)) {
    if (!Array.isArray(collection?.contributionCalendar?.weeks)) {
      throw new Error(`Contribution calendar for ${year} is missing.`);
    }
    for (const week of collection.contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
            !Number.isInteger(day.contributionCount) || day.contributionCount < 0) {
          throw new Error("Invalid contribution day.");
        }
        // Calendars can include padding dates outside their requested year.
        if (!day.date.startsWith(`${year}-`) || day.date > today) continue;
        if (days.has(day.date)) throw new Error(`Duplicate contribution date: ${day.date}`);
        days.set(day.date, day.contributionCount);
      }
    }
  }
  const summarize = (fromDate = "") => {
    const counts = [...days].filter(([date]) => date >= fromDate).map(([, count]) => count);
    return {
      contributions: counts.reduce((total, count) => total + count, 0),
      activeDays: counts.filter((count) => count > 0).length,
    };
  };
  const excluded = new Set(
    config.excludedRepositories.map((name) => name.toLowerCase()),
  );

  return {
    schemaVersion: 6,
    username: config.username,
    sourceCount: 1 + (config.additionalUsernames?.length ?? 0),
    generatedAt: generatedAt.toISOString(),
    periods: Object.fromEntries(Object.entries(windows).map(([name, window]) => [
      name, { from: window.fromDate, to: window.toDate, days: window.days },
    ])),
    activity: {
      week: summarize(windows.week.fromDate),
      month: summarize(windows.month.fromDate),
      year: summarize(windows.year.fromDate),
      total: summarize(),
    },
    languages: aggregateLanguages(
      data.user?.repositories?.nodes ?? [],
      excluded,
    ),
    rateLimit: data.rateLimit ?? null,
  };
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
