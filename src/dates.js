/**
 * @typedef {object} DateWindow
 * @property {Date} from
 * @property {Date} to
 * @property {string} fromDate
 * @property {string} toDate
 */

/**
 * Build calendar-to-date windows in UTC. Weeks begin on Monday.
 *
 * @param {Date} now
 * @returns {{week: DateWindow, month: DateWindow, year: DateWindow}}
 */
export function createActivityWindows(now) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error("now must be a valid Date.");
  }

  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const mondayOffset = (todayStart.getUTCDay() + 6) % 7;
  const weekStart = new Date(
    Date.UTC(
      todayStart.getUTCFullYear(),
      todayStart.getUTCMonth(),
      todayStart.getUTCDate() - mondayOffset,
    ),
  );
  const monthStart = new Date(
    Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1),
  );
  const yearStart = new Date(
    Date.UTC(todayStart.getUTCFullYear(), 0, 1),
  );

  return {
    week: toWindow(weekStart, now),
    month: toWindow(monthStart, now),
    year: toWindow(yearStart, now),
  };
}

/**
 * @param {Date} from
 * @param {Date} to
 * @returns {DateWindow}
 */
function toWindow(from, to) {
  return {
    from,
    to,
    fromDate: formatDate(from),
    toDate: formatDate(to),
  };
}

/**
 * @param {Date} date
 */
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
