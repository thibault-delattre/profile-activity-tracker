const WIDTH = 900;

const THEMES = {
  light: {
    background: "#ffffff",
    surface: "#f6f8fa",
    border: "#d0d7de",
    primary: "#1f2328",
    secondary: "#59636e",
    muted: "#818b98",
    line: "#d8dee4",
    chip: "#f6f8fa",
  },
  dark: {
    background: "#0d1117",
    surface: "#161b22",
    border: "#30363d",
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
  const languageLayout = layoutLanguageChips(metrics.languages, 32, 868, 267);
  const height = Math.max(320, languageLayout.bottom + 22);
  const periods = [
    { label: "THIS WEEK", values: metrics.activity.week },
    { label: "THIS MONTH", values: metrics.activity.month },
    { label: "THIS YEAR", values: metrics.activity.year },
    { label: "ALL TIME", values: metrics.activity.total },
  ];
  const columnCenters = [270, 430, 590, 760];
  const date = formatDisplayDate(metrics.generatedAt);

  const title = `${metrics.displayName} GitHub activity`;
  const description = [
    `${metrics.activity.week.commits} commits this week`,
    `${metrics.activity.month.commits} this month`,
    `${metrics.activity.year.commits} this year`,
    `${metrics.activity.total.commits} total`,
    `${metrics.repositories} repositories`,
  ].join(", ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 1.4px; }
    .name { font-size: 24px; font-weight: 650; }
    .period { font-size: 10px; font-weight: 700; letter-spacing: 1.1px; }
    .row-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; }
    .value { font-size: 29px; font-weight: 650; }
    .language { font-size: 11px; font-weight: 600; }
  </style>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="14" fill="${theme.background}" stroke="${theme.border}"/>
  <text x="32" y="34" class="eyebrow" fill="${accent}">GITHUB ACTIVITY</text>
  <text x="32" y="66" class="name" fill="${theme.primary}">${escapeXml(metrics.displayName)}</text>
  <text x="868" y="34" text-anchor="end" class="eyebrow" fill="${theme.muted}">UPDATED ${date}</text>
  <text x="868" y="66" text-anchor="end" class="eyebrow" fill="${theme.primary}">${formatNumber(metrics.repositories)} REPOSITORIES</text>
  <line x1="32" y1="88" x2="868" y2="88" stroke="${theme.line}"/>
  <rect x="180" y="99" width="688" height="34" rx="7" fill="${theme.surface}"/>
  ${periods
    .map(
      (period, index) =>
        `<text x="${columnCenters[index]}" y="120" text-anchor="middle" class="period" fill="${theme.secondary}">${period.label}</text>`,
    )
    .join("")}
  <text x="32" y="158" class="row-label" fill="${theme.secondary}">COMMITS</text>
  ${periods
    .map(
      (period, index) =>
        `<text x="${columnCenters[index]}" y="163" text-anchor="middle" class="value" fill="${theme.primary}">${formatNumber(period.values.commits)}</text>`,
    )
    .join("")}
  <line x1="180" y1="178" x2="868" y2="178" stroke="${theme.line}"/>
  <text x="32" y="211" class="row-label" fill="${theme.secondary}">ACTIVE DAYS</text>
  ${periods
    .map(
      (period, index) =>
        `<text x="${columnCenters[index]}" y="216" text-anchor="middle" class="value" fill="${theme.primary}">${formatNumber(period.values.activeDays)}</text>`,
    )
    .join("")}
  <line x1="32" y1="236" x2="868" y2="236" stroke="${theme.line}"/>
  <text x="32" y="258" class="eyebrow" fill="${theme.secondary}">LANGUAGES</text>
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
