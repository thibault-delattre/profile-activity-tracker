const WIDTH = 900;

const THEMES = {
  light: {
    background: "#ffffff",
    surface: "#f6f8fa",
    primary: "#1f2328",
    secondary: "#59636e",
    muted: "#818b98",
    line: "#d8dee4",
    chip: "#f6f8fa",
  },
  dark: {
    background: "#0d1117",
    surface: "#161b22",
    primary: "#f0f6fc",
    secondary: "#8b949e",
    muted: "#6e7681",
    line: "#30363d",
    chip: "#161b22",
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
  const languageLayout = layoutLanguageChips(metrics.languages, 32, 868, 237);
  const height = Math.max(290, languageLayout.bottom + 22);
  const periods = [
    { label: "THIS WEEK", values: metrics.activity.week },
    { label: "THIS MONTH", values: metrics.activity.month },
    { label: "THIS YEAR", values: metrics.activity.year },
    { label: "ALL TIME", values: metrics.activity.total },
  ];
  const columnCenters = [270, 430, 590, 760];
  const date = formatDisplayDate(metrics.generatedAt);

  const title = `GitHub activity for @${metrics.username}`;
  const description = [
    `${metrics.activity.week.commits} commits this week`,
    `${metrics.activity.month.commits} this month`,
    `${metrics.activity.year.commits} this year`,
    `${metrics.activity.total.commits} total`,
  ].join(", ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <defs>
    <linearGradient id="animated-border" x1="0" y1="0" x2="${WIDTH}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#58a6ff"/>
      <stop offset="25%" stop-color="#f7fbff"/>
      <stop offset="50%" stop-color="#ff7b72"/>
      <stop offset="75%" stop-color="#f7fbff"/>
      <stop offset="100%" stop-color="#58a6ff"/>
      <animateTransform
        attributeName="gradientTransform"
        type="rotate"
        from="0 ${WIDTH / 2} ${height / 2}"
        to="360 ${WIDTH / 2} ${height / 2}"
        dur="6s"
        repeatCount="indefinite"
      />
    </linearGradient>
  </defs>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 1.4px; }
    .period { font-size: 10px; font-weight: 700; letter-spacing: 1.1px; }
    .row-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; }
    .value { font-size: 29px; font-weight: 650; }
    .language { font-size: 11px; font-weight: 600; }
  </style>
  <rect x="1.25" y="1.25" width="${WIDTH - 2.5}" height="${height - 2.5}" rx="14" fill="${theme.background}" stroke="url(#animated-border)" stroke-width="2.5"/>
  <text x="32" y="37" class="eyebrow" fill="${accent}">GITHUB ACTIVITY</text>
  <text x="868" y="37" text-anchor="end" class="eyebrow" fill="${theme.muted}">UPDATED ${date}</text>
  <line x1="32" y1="58" x2="868" y2="58" stroke="${theme.line}"/>
  <rect x="180" y="70" width="688" height="34" rx="7" fill="${theme.surface}"/>
  ${periods
    .map(
      (period, index) =>
        `<text x="${columnCenters[index]}" y="91" text-anchor="middle" class="period" fill="${theme.secondary}">${period.label}</text>`,
    )
    .join("")}
  <text x="32" y="129" class="row-label" fill="${theme.secondary}">COMMITS</text>
  ${periods
    .map(
      (period, index) =>
        `<text x="${columnCenters[index]}" y="134" text-anchor="middle" class="value" fill="${theme.primary}">${formatNumber(period.values.commits)}</text>`,
    )
    .join("")}
  <line x1="180" y1="149" x2="868" y2="149" stroke="${theme.line}"/>
  <text x="32" y="182" class="row-label" fill="${theme.secondary}">ACTIVE DAYS</text>
  ${periods
    .map(
      (period, index) =>
        `<text x="${columnCenters[index]}" y="187" text-anchor="middle" class="value" fill="${theme.primary}">${formatNumber(period.values.activeDays)}</text>`,
    )
    .join("")}
  <line x1="32" y1="207" x2="868" y2="207" stroke="${theme.line}"/>
  <text x="32" y="228" class="eyebrow" fill="${theme.secondary}">LANGUAGES</text>
  ${renderLanguageChips(languageLayout.items, theme)}
</svg>`;
}

/**
 * @param {Array<{name: string, color: string | null}>} languages
 * @param {number} startX
 * @param {number} maximumX
 * @param {number} startY
 */
export function layoutLanguageChips(languages, startX, maximumX, startY) {
  const source =
    languages.length > 0
      ? languages
      : [{ name: "No language data yet", color: null }];
  const items = [];
  let x = startX;
  let y = startY;

  for (const language of source) {
    const width = Math.max(92, 40 + language.name.length * 6.8);

    if (x > startX && x + width > maximumX) {
      x = startX;
      y += 34;
    }

    items.push({
      ...language,
      x,
      y,
      width,
    });
    x += width + 9;
  }

  return {
    items,
    bottom: y + 26,
  };
}

/**
 * @param {Array<{name: string, color: string | null, x: number, y: number, width: number}>} items
 * @param {typeof THEMES.light} theme
 */
function renderLanguageChips(items, theme) {
  return items
    .map((language) => {
      const color = safeColor(language.color, theme.muted);
      return `<g>
        <rect x="${language.x}" y="${language.y}" width="${language.width.toFixed(1)}" height="25" rx="12.5" fill="${theme.chip}" stroke="${theme.line}"/>
        <circle cx="${language.x + 14}" cy="${language.y + 12.5}" r="4" fill="${color}"/>
        <text x="${language.x + 26}" y="${language.y + 16.5}" class="language" fill="${theme.primary}">${escapeXml(language.name)}</text>
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
