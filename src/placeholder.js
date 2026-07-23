/**
 * Produce an honest initial state. The first push-triggered workflow replaces
 * this with live GitHub data.
 *
 * @param {import("./config.js").TrackerConfig} config
 * @param {Date} now
 */
export function createPlaceholderData(config, now) {
  const days = [];
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
      (config.periodDays - 1) * 86_400_000,
  );

  for (let index = 0; index < config.periodDays; index += 1) {
    const date = new Date(start.getTime() + index * 86_400_000);
    days.push({
      date: date.toISOString().slice(0, 10),
      contributionCount: 0,
    });
  }

  const weeks = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push({ contributionDays: days.slice(index, index + 7) });
  }

  const collection = {
    contributionCalendar: {
      totalContributions: 0,
      weeks,
    },
    totalCommitContributions: 0,
    totalIssueContributions: 0,
    totalPullRequestContributions: 0,
    totalPullRequestReviewContributions: 0,
    restrictedContributionsCount: 0,
    commitContributionsByRepository: [],
  };

  return {
    user: {
      login: config.username,
      name: config.displayName,
      url: `https://github.com/${config.username}`,
      repositories: { nodes: [] },
      current: collection,
      previous: collection,
    },
    currentMerged: { issueCount: 0 },
    previousMerged: { issueCount: 0 },
    rateLimit: null,
  };
}
