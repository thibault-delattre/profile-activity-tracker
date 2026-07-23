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

  const validSources = sources.filter((source) => source?.user);
  if (validSources.length === 0) {
    throw new Error("No valid GitHub activity sources were returned.");
  }

  const yearlyKeys = new Set(
    validSources.flatMap((source) =>
      Object.keys(source.user.periods?.yearly ?? {}),
    ),
  );

  return {
    user: {
      login: validSources[0].user.login,
      repositories: {
        nodes: validSources.flatMap(
          (source) => source.user.repositories?.nodes ?? [],
        ),
      },
      periods: {
        week: mergeCollections(
          validSources.map((source) => source.user.periods?.week),
        ),
        month: mergeCollections(
          validSources.map((source) => source.user.periods?.month),
        ),
        year: mergeCollections(
          validSources.map((source) => source.user.periods?.year),
        ),
        yearly: Object.fromEntries(
          [...yearlyKeys]
            .sort((left, right) => Number(left) - Number(right))
            .map((year) => [
              year,
              mergeCollections(
                validSources.map(
                  (source) => source.user.periods?.yearly?.[year],
                ),
              ),
            ]),
        ),
      },
    },
    rateLimit:
      validSources.findLast((source) => source.rateLimit)?.rateLimit ?? null,
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

    for (const week of collection?.contributionCalendar?.weeks ?? []) {
      for (const day of week?.contributionDays ?? []) {
        if (
          typeof day?.date !== "string" ||
          !Number.isFinite(day?.contributionCount)
        ) {
          continue;
        }

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
