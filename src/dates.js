/**
 * @typedef {object} DateWindow
 * @property {Date} from
 * @property {Date} to
 * @property {string} fromDate
 * @property {string} toDate
 * @property {number} days
 */

/**
 * Build rolling UTC windows that all end today.
 *
 * Every window is a trailing span of whole days, so the shorter spans are
 * always contained in the longer ones and the rendered columns can only grow
 * from left to right. Calendar-to-date periods cannot promise that: a week
 * starting on Monday reaches into the previous month or year, which made a
 * fresh month look smaller than the week that spilled into it.
 *
 * @param {Date} now
 * @returns {{week: DateWindow, month: DateWindow, year: DateWindow}}
 */
export function createActivityWindows(now) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error("now must be a valid Date.");
  }

  return {
    week: toWindow(now, 7),
    month: toWindow(now, 30),
    year: toWindow(now, 365),
  };
}

/**
 * @param {Date} now
 * @param {number} days
 * @returns {DateWindow}
 */
function toWindow(now, days) {
  const from = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - (days - 1),
    ),
  );

  return {
    from,
    to: now,
    fromDate: formatDate(from),
    toDate: formatDate(now),
    days,
  };
}

/**
 * @param {Date} date
 */
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
