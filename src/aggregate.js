/**
 * Merge contribution calendars from multiple GitHub accounts.
 *
 * Contribution totals are summed. Contribution days are merged by date, so
 * active-day counts remain naturally bounded by the calendar rather than being
 * inflated when multiple accounts are active on the same day.
 *
 * @param {Array<Record<string, any>>} sources
 */
export function mergeGitHubActivity(sources) {
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error("At least one GitHub activity source is required.");
  }

  if (sources.some((source) => !source?.user)) {
    throw new Error("A GitHub activity source is missing.");
  }

  const yearlyKeys = new Set(
    sources.flatMap((source) =>
      Object.keys(source.user.periods?.yearly ?? {}),
    ),
  );

  return {
    user: {
      login: sources[0].user.login,
      repositories: {
        nodes: sources.flatMap(
          (source) => source.user.repositories?.nodes ?? [],
        ),
      },
      periods: {
        yearly: Object.fromEntries(
          [...yearlyKeys]
            .sort((left, right) => Number(left) - Number(right))
            .map((year) => [
              year,
              mergeCollections(
                sources.map(
                  (source) => source.user.periods?.yearly?.[year],
                ),
              ),
            ]),
        ),
      },
    },
    rateLimit:
      sources.findLast((source) => source.rateLimit)?.rateLimit ?? null,
  };
}

/**
 * @param {Array<Record<string, any> | undefined>} collections
 */
export function mergeCollections(collections) {
  const contributionDays = new Map();
  let totalContributions = 0;

  for (const collection of collections) {
    totalContributions += Number(
      collection?.contributionCalendar?.totalContributions ?? 0,
    );

    const seen = new Set();
    for (const week of collection?.contributionCalendar?.weeks ?? []) {
      for (const day of week?.contributionDays ?? []) {
        if (
          typeof day?.date !== "string" ||
          !Number.isInteger(day?.contributionCount) || day.contributionCount < 0
        ) {
          throw new Error("Invalid contribution day.");
        }

        if (seen.has(day.date)) throw new Error(`Duplicate contribution date: ${day.date}`);
        seen.add(day.date);
        contributionDays.set(
          day.date,
          (contributionDays.get(day.date) ?? 0) + day.contributionCount,
        );
      }
    }
  }

  const days = [...contributionDays]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, contributionCount]) => ({ date, contributionCount }));
  const weeks = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push({ contributionDays: days.slice(index, index + 7) });
  }

  return {
    contributionCalendar: {
      totalContributions,
      weeks,
    },
  };
}
