const WIDTH = 900;
const HEIGHT = 320;

const THEMES = {
  light: {
    background: "#ffffff",
    border: "#d0d7de",
    primary: "#1f2328",
    secondary: "#59636e",
    muted: "#818b98",
    line: "#d8dee4",
    track: "#eaeef2",
    positive: "#1a7f37",
    negative: "#cf222e",
  },
  dark: {
    background: "#0d1117",
    border: "#30363d",
    primary: "#f0f6fc",
    secondary: "#8b949e",
    muted: "#6e7681",
    line: "#30363d",
    track: "#21262d",
    positive: "#3fb950",
    negative: "#f85149",
  },
};

/**
 * @param {Record<string, any>} metrics
 * @param {import("./config.js").TrackerConfig} config
 * @param {"light" | "dark"} mode
 */
export function renderCard(metrics, config, mode) {
  const theme = THEMES[mode];
  const accent = safeColor(config.brand.accent, "#2f81f7");
  const date = formatDisplayDate(metrics.generatedAt);
  const trendColor =
    metrics.momentumPercent >= 0 ? theme.positive : theme.negative;
  const trendText = formatTrend(metrics.momentumPercent);
  const sparkline = renderSparkline(
    metrics.weeklyTotals,
    32,
    222,
    470,
    48,
    accent,
    theme.track,
  );
  const languages = renderLanguages(metrics.languages, theme, 555, 222);
  const featured = metrics.featuredRepository?.name
    ? `Most recently active · ${metrics.featuredRepository.name}`
    : "Public GitHub activity";

  const title = `${metrics.displayName} GitHub engineering activity`;
  const description = [
    `${metrics.contributions} contributions across ${metrics.activeDays} active days`,
    `${metrics.pullRequestsMerged} merged pull requests`,
    `${metrics.reviews} code reviews`,
    `during the last ${metrics.periodDays} days`,
  ].join(", ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 1.4px; }
    .name { font-size: 24px; font-weight: 650; }
    .metric-label { font-size: 10px; font-weight: 700; letter-spacing: 1.1px; }
    .metric-value { font-size: 30px; font-weight: 650; }
    .metric-note { font-size: 11px; }
    .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.1px; }
    .footer { font-size: 11px; }
    .language { font-size: 11px; font-weight: 600; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="14" fill="${theme.background}" stroke="${theme.border}"/>
  <text x="32" y="34" class="eyebrow" fill="${accent}">${escapeXml(config.brand.label)}</text>
  <text x="32" y="66" class="name" fill="${theme.primary}">${escapeXml(metrics.displayName)}</text>
  <circle cx="661" cy="43" r="4" fill="${theme.positive}"/>
  <text x="673" y="47" class="eyebrow" fill="${theme.secondary}">PUBLIC DATA · UPDATED ${date}</text>
  <line x1="32" y1="88" x2="868" y2="88" stroke="${theme.line}"/>
  ${renderMetric(32, "CONTRIBUTIONS", metrics.contributions, `LAST ${metrics.periodDays} DAYS`, theme)}
  ${renderMetric(247, "ACTIVE DAYS", metrics.activeDays, `${metrics.longestStreak}-DAY BEST STREAK`, theme)}
  ${renderMetric(462, "MERGED PRS", metrics.pullRequestsMerged, `${metrics.pullRequestsOpened} OPENED`, theme)}
  ${renderMetric(677, "CODE REVIEWS", metrics.reviews, `${metrics.repositoriesContributedTo} REPOS TOUCHED`, theme)}
  <line x1="32" y1="178" x2="868" y2="178" stroke="${theme.line}"/>
  <text x="32" y="205" class="section-label" fill="${theme.secondary}">WEEKLY CONTRIBUTION SIGNAL</text>
  ${sparkline}
  <text x="555" y="205" class="section-label" fill="${theme.secondary}">LANGUAGE FOOTPRINT</text>
  ${languages}
  <line x1="32" y1="288" x2="868" y2="288" stroke="${theme.line}"/>
  <text x="32" y="308" class="footer" fill="${trendColor}">Momentum ${escapeXml(trendText)} vs previous ${metrics.periodDays} days</text>
  <text x="868" y="308" text-anchor="end" class="footer" fill="${theme.secondary}">${escapeXml(featured)}</text>
</svg>`;
}

/**
 * @param {number} x
 * @param {string} label
 * @param {number} value
 * @param {string} note
 * @param {typeof THEMES.light} theme
 */
function renderMetric(x, label, value, note, theme) {
  return `<g transform="translate(${x} 0)">
    <text x="0" y="111" class="metric-label" fill="${theme.secondary}">${escapeXml(label)}</text>
    <text x="0" y="148" class="metric-value" fill="${theme.primary}">${formatNumber(value)}</text>
    <text x="0" y="165" class="metric-note" fill="${theme.muted}">${escapeXml(note)}</text>
  </g>`;
}

/**
 * @param {number[]} values
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} color
 * @param {string} track
 */
function renderSparkline(values, x, y, width, height, color, track) {
  const safeValues = values.length > 1 ? values : [0, 0];
  const maximum = Math.max(1, ...safeValues);
  const step = width / (safeValues.length - 1);
  const points = safeValues
    .map((value, index) => {
      const pointX = x + index * step;
      const pointY = y + height - (Math.max(0, value) / maximum) * height;
      return `${pointX.toFixed(1)},${pointY.toFixed(1)}`;
    })
    .join(" ");

  const circles = safeValues
    .map((value, index) => {
      const pointX = x + index * step;
      const pointY = y + height - (Math.max(0, value) / maximum) * height;
      return `<circle cx="${pointX.toFixed(1)}" cy="${pointY.toFixed(1)}" r="2.4" fill="${color}"/>`;
    })
    .join("");

  return `<line x1="${x}" y1="${y + height}" x2="${x + width}" y2="${y + height}" stroke="${track}"/>
  <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  ${circles}`;
}

/**
 * @param {Array<{name: string, percentage: number, color: string | null}>} languages
 * @param {typeof THEMES.light} theme
 * @param {number} x
 * @param {number} y
 */
function renderLanguages(languages, theme, x, y) {
  if (languages.length === 0) {
    return `<text x="${x}" y="${y + 21}" class="footer" fill="${theme.muted}">No language data available yet</text>`;
  }

  return languages
    .map((language, index) => {
      const rowY = y + index * 22;
      const percentage = Math.max(0, Math.min(100, language.percentage));
      const color = safeColor(language.color, "#8b949e");
      const barWidth = Math.max(2, (percentage / 100) * 112);

      return `<g transform="translate(0 ${rowY})">
        <circle cx="${x + 4}" cy="4" r="4" fill="${color}"/>
        <text x="${x + 16}" y="8" class="language" fill="${theme.primary}">${escapeXml(language.name)}</text>
        <rect x="${x + 145}" y="-1" width="112" height="7" rx="3.5" fill="${theme.track}"/>
        <rect x="${x + 145}" y="-1" width="${barWidth.toFixed(1)}" height="7" rx="3.5" fill="${color}"/>
        <text x="${x + 313}" y="8" text-anchor="end" class="footer" fill="${theme.secondary}">${percentage}%</text>
      </g>`;
    })
    .join("");
}

/**
 * @param {number} value
 */
function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * @param {number} value
 */
function formatTrend(value) {
  if (value === 0) {
    return "0%";
  }

  return `${value > 0 ? "+" : ""}${value}%`;
}

/**
 * @param {string} isoDate
 */
function formatDisplayDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "UNKNOWN";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replace(",", "")
    .toUpperCase();
}

/**
 * @param {unknown} color
 * @param {string} fallback
 */
function safeColor(color, fallback) {
  return typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)
    ? color
    : fallback;
}

/**
 * @param {unknown} value
 */
export function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
