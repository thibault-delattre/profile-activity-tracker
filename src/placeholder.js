import { createActivityWindows } from "./dates.js";

/**
 * Produce an honest initial state. A live workflow replaces this with GitHub
 * data.
 *
 * @param {import("./config.js").TrackerConfig} config
 * @param {Date} now
 */
export function createPlaceholderData(config, now) {
  const windows = createActivityWindows(now);
  const currentYear = now.getUTCFullYear();

  return {
    user: {
      login: config.username,
      name: config.displayName,
      url: `https://github.com/${config.username}`,
      totalRepositories: { totalCount: 0 },
      repositories: { nodes: [] },
      periods: {
        week: createCollection(windows.week.from, windows.week.to),
        month: createCollection(windows.month.from, windows.month.to),
        year: createCollection(windows.year.from, windows.year.to),
        yearly: {
          [currentYear]: createCollection(
            windows.year.from,
            windows.year.to,
          ),
        },
      },
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
    totalCommitContributions: 0,
    contributionCalendar: { weeks },
  };
}
