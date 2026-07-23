const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * @typedef {object} DateWindow
 * @property {Date} from
 * @property {Date} to
 * @property {string} fromDate
 * @property {string} toDate
 */

/**
 * Build adjacent, non-overlapping UTC windows. The current window includes
 * today and exactly `periodDays` calendar dates.
 *
 * @param {Date} now
 * @param {number} periodDays
 * @returns {{current: DateWindow, previous: DateWindow}}
 */
export function createDateWindows(now, periodDays) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error("now must be a valid Date.");
  }

  if (!Number.isInteger(periodDays) || periodDays < 1) {
    throw new Error("periodDays must be a positive integer.");
  }

  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const currentFrom = new Date(
    todayStart.getTime() - (periodDays - 1) * DAY_IN_MS,
  );
  const previousTo = new Date(currentFrom.getTime() - 1);
  const previousFrom = new Date(
    currentFrom.getTime() - periodDays * DAY_IN_MS,
  );

  return {
    current: toWindow(currentFrom, now),
    previous: toWindow(previousFrom, previousTo),
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
