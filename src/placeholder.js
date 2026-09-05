import { createActivityWindows } from "./dates.js";

/**
 * Produce an honest initial state. A live workflow replaces this with GitHub
 * data. One calendar per year keeps the shape identical to the GraphQL
 * payload, which the rolling 365-day window can span.
 *
 * @param {import("./config.js").TrackerConfig} config
 * @param {Date} now
 */
export function createPlaceholderData(config, now) {
  const windows = createActivityWindows(now);
  const firstYear = windows.year.from.getUTCFullYear();
  const lastYear = windows.year.to.getUTCFullYear();
  /** @type {Record<string, ReturnType<typeof createCollection>>} */
  const yearly = {};

  for (let year = firstYear; year <= lastYear; year += 1) {
    yearly[year] = createCollection(
      year === firstYear ? windows.year.from : new Date(Date.UTC(year, 0, 1)),
      year === lastYear ? windows.year.to : new Date(Date.UTC(year, 11, 31)),
    );
  }

  return {
    user: {
      login: config.username,
      url: `https://github.com/${config.username}`,
      repositories: { nodes: [] },
      periods: { yearly },
    },
    rateLimit: null,
  };
}

/**
 * @param {Date} from
 * @param {Date} to
 */
function createCollection(from, to) {
  const days = [];
  const cursor = new Date(from);
  cursor.setUTCHours(0, 0, 0, 0);
  const finalDate = new Date(to);
  finalDate.setUTCHours(0, 0, 0, 0);

  while (cursor <= finalDate) {
    days.push({
      date: cursor.toISOString().slice(0, 10),
      contributionCount: 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const weeks = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push({ contributionDays: days.slice(index, index + 7) });
  }

  return {
    contributionCalendar: {
      totalContributions: 0,
      weeks,
    },
  };
}
