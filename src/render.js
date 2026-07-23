const WIDTH = 900;
const PANEL = {
  x: 16,
  y: 72,
  width: 868,
  height: 210,
  radius: 18,
};

const THEMES = {
  light: {
    background: "#ffffff",
    surface: "#f6f8fa",
    glassStart: "#ffffff",
    glassEnd: "#eef3f8",
    glassStartOpacity: 0.72,
    glassMiddleOpacity: 0.6,
    glassEndOpacity: 0.68,
    highlightOpacity: 0.72,
    shadow: "#57606a",
    primary: "#1f2328",
    secondary: "#59636e",
    muted: "#818b98",
    line: "#d8dee4",
  },
  dark: {
    background: "#0d1117",
    surface: "#161b22",
    glassStart: "#263140",
    glassEnd: "#111820",
    glassStartOpacity: 0.78,
    glassMiddleOpacity: 0.66,
    glassEndOpacity: 0.74,
    highlightOpacity: 0.34,
    shadow: "#000000",
    primary: "#f0f6fc",
    secondary: "#8b949e",
    muted: "#6e7681",
    line: "#30363d",
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
  const languageLayout = layoutLanguageItems(
    metrics.languages,
    32,
    868,
    342,
  );
  const height = Math.max(390, languageLayout.bottom + 24);
  const periods = [
    { label: "THIS WEEK", values: metrics.activity.week },
    { label: "THIS MONTH", values: metrics.activity.month },
    { label: "THIS YEAR", values: metrics.activity.year },
    { label: "ALL TIME", values: metrics.activity.total },
  ];
  const columnCenters = [275, 435, 595, 760];
  const isCombined = Number(metrics.sourceCount) > 1;
  const introduction = config.introduction;

  const title = `${isCombined ? "Combined GitHub activity" : "GitHub activity"} for @${metrics.username}`;
  const description = `${introduction} ${
    isCombined
      ? `Combined across ${metrics.sourceCount} GitHub accounts. `
      : ""
  }${[
    `${metrics.activity.week.contributions} contributions this week`,
    `${metrics.activity.month.contributions} this month`,
    `${metrics.activity.year.contributions} this year`,
    `${metrics.activity.total.contributions} total`,
  ].join(", ")}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <defs>
    <clipPath id="glass-clip">
      <rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.width}" height="${PANEL.height}" rx="${PANEL.radius}"/>
    </clipPath>
    <linearGradient id="animated-border" x1="${PANEL.x}" y1="${PANEL.y}" x2="${PANEL.x + PANEL.width}" y2="${PANEL.y + PANEL.height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#58a6ff"/>
      <stop offset="25%" stop-color="#f7fbff"/>
      <stop offset="50%" stop-color="#ff7b72"/>
      <stop offset="75%" stop-color="#f7fbff"/>
      <stop offset="100%" stop-color="#58a6ff"/>
      <animateTransform
        attributeName="gradientTransform"
        type="rotate"
        from="0 ${WIDTH / 2} ${PANEL.y + PANEL.height / 2}"
        to="360 ${WIDTH / 2} ${PANEL.y + PANEL.height / 2}"
        dur="6s"
        repeatCount="indefinite"
      />
    </linearGradient>
    <linearGradient id="glass-fill" x1="${PANEL.x}" y1="${PANEL.y}" x2="${PANEL.x + PANEL.width}" y2="${PANEL.y + PANEL.height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.glassStart}" stop-opacity="${theme.glassStartOpacity}"/>
      <stop offset="48%" stop-color="${theme.glassEnd}" stop-opacity="${theme.glassMiddleOpacity}"/>
      <stop offset="100%" stop-color="${theme.glassStart}" stop-opacity="${theme.glassEndOpacity}"/>
    </linearGradient>
    <linearGradient id="glass-highlight" x1="${PANEL.x + 24}" y1="${PANEL.y + 4}" x2="${PANEL.x + PANEL.width - 80}" y2="${PANEL.y + 100}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${theme.highlightOpacity}"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="liquid-sheen" x1="-220" y1="${PANEL.y}" x2="-20" y2="${PANEL.y + PANEL.height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="48%" stop-color="#ffffff" stop-opacity="${mode === "light" ? 0.3 : 0.18}"/>
      <stop offset="54%" stop-color="#dbeafe" stop-opacity="${mode === "light" ? 0.2 : 0.12}"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      <animate attributeName="x1" values="-220;920;-220" dur="12s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="-20;1120;-20" dur="12s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="period-fill" x1="184" y1="132" x2="856" y2="164" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.surface}" stop-opacity="0.84"/>
      <stop offset="50%" stop-color="${theme.surface}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${theme.surface}" stop-opacity="0.76"/>
    </linearGradient>
    <filter id="panel-shadow" x="-12%" y="-32%" width="124%" height="174%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="${theme.shadow}" flood-opacity="0.22"/>
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#ffffff" flood-opacity="${mode === "light" ? 0.2 : 0.08}"/>
    </filter>
    <filter id="liquid-blur" x="-20%" y="-80%" width="140%" height="260%">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.025" numOctaves="2" seed="11" result="liquid-noise"/>
      <feDisplacementMap in="SourceGraphic" in2="liquid-noise" scale="16" xChannelSelector="R" yChannelSelector="B" result="refracted"/>
      <feGaussianBlur in="refracted" stdDeviation="26"/>
    </filter>
  </defs>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .introduction { font-size: 15px; font-weight: 500; }
    .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 1.4px; }
    .period { font-size: 10px; font-weight: 700; letter-spacing: 1.1px; }
    .row-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; }
    .value { font-size: 29px; font-weight: 650; }
    .language { font-size: 12px; font-weight: 600; }
    .glass-panel {
      transform-box: fill-box;
      transform-origin: center;
      transition: transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    svg:hover .glass-panel { transform: translateY(-3px) scale(1.004); }
    @media (prefers-reduced-motion: reduce) {
      .glass-panel { transition: none; }
    }
  </style>
  <rect width="${WIDTH}" height="${height}" fill="${theme.background}"/>
  <text x="32" y="35" textLength="836" lengthAdjust="spacingAndGlyphs" class="introduction" fill="${theme.primary}">${escapeXml(introduction)}</text>

  <g class="glass-panel">
    <rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.width}" height="${PANEL.height}" rx="${PANEL.radius}" fill="${theme.glassEnd}" opacity="0.74" filter="url(#panel-shadow)"/>
    <g clip-path="url(#glass-clip)" filter="url(#liquid-blur)" opacity="${mode === "light" ? 0.4 : 0.32}">
      <animateTransform attributeName="transform" type="translate" values="-12 0;12 0;-12 0" dur="16s" repeatCount="indefinite"/>
      <path d="M -20 246 C 188 128, 322 212, 514 98 S 814 84, 948 122" fill="none" stroke="#58a6ff" stroke-width="52"/>
      <path d="M -12 106 C 170 182, 318 82, 502 206 S 764 248, 930 178" fill="none" stroke="#ff7b72" stroke-width="44"/>
    </g>
    <rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.width}" height="${PANEL.height}" rx="${PANEL.radius}" fill="url(#glass-fill)"/>
    <rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.width}" height="${PANEL.height}" rx="${PANEL.radius}" fill="url(#liquid-sheen)" clip-path="url(#glass-clip)" pointer-events="none"/>
    <rect x="${PANEL.x + 3}" y="${PANEL.y + 3}" width="${PANEL.width - 6}" height="${PANEL.height - 6}" rx="${PANEL.radius - 3}" fill="none" stroke="#ffffff" stroke-opacity="${mode === "light" ? 0.36 : 0.12}"/>
    <path d="M ${PANEL.x + 24} ${PANEL.y + 1.5} H ${PANEL.x + PANEL.width - 120}" stroke="url(#glass-highlight)" stroke-width="1.5" stroke-linecap="round"/>

    <text x="${WIDTH / 2}" y="105" text-anchor="middle" class="eyebrow" fill="${accent}">${isCombined ? "COMBINED GITHUB ACTIVITY" : "GITHUB ACTIVITY"}</text>
    <line x1="44" y1="120" x2="856" y2="120" stroke="${theme.line}" stroke-opacity="0.82"/>
    <rect x="184" y="132" width="672" height="32" rx="6" fill="url(#period-fill)" stroke="#ffffff" stroke-opacity="${mode === "light" ? 0.5 : 0.09}"/>
    ${periods
      .map(
        (period, index) =>
          `<text x="${columnCenters[index]}" y="152" text-anchor="middle" class="period" fill="${theme.secondary}">${period.label}</text>`,
      )
      .join("")}
    <text x="44" y="190" class="row-label" fill="${theme.secondary}">CONTRIBUTIONS</text>
    ${periods
      .map(
        (period, index) =>
          `<text x="${columnCenters[index]}" y="195" text-anchor="middle" class="value" fill="${theme.primary}">${formatNumber(period.values.contributions)}</text>`,
      )
      .join("")}
    <line x1="184" y1="210" x2="856" y2="210" stroke="${theme.line}" stroke-opacity="0.84"/>
    <text x="44" y="243" class="row-label" fill="${theme.secondary}">ACTIVE DAYS</text>
    ${periods
      .map(
        (period, index) =>
          `<text x="${columnCenters[index]}" y="248" text-anchor="middle" class="value" fill="${theme.primary}">${formatNumber(period.values.activeDays)}</text>`,
      )
      .join("")}
    <rect x="${PANEL.x + 1.25}" y="${PANEL.y + 1.25}" width="${PANEL.width - 2.5}" height="${PANEL.height - 2.5}" rx="${PANEL.radius - 1}" fill="none" stroke="url(#animated-border)" stroke-width="2.5"/>
  </g>

  <line x1="32" y1="315" x2="340" y2="315" stroke="${theme.line}"/>
  <text x="${WIDTH / 2}" y="319" text-anchor="middle" class="eyebrow" fill="${theme.secondary}">FAVORITE LANGUAGES</text>
  <line x1="560" y1="315" x2="868" y2="315" stroke="${theme.line}"/>
  ${renderLanguageItems(languageLayout.items, theme)}
</svg>`;
}

/**
 * @param {Array<{name: string, color: string | null}>} languages
 * @param {number} startX
 * @param {number} maximumX
 * @param {number} startY
 */
export function layoutLanguageItems(languages, startX, maximumX, startY) {
  const source =
    languages.length > 0
      ? languages
      : [{ name: "No language data yet", color: null }];
  const availableWidth = maximumX - startX;
  const rows = [];
  let row = [];
  let rowWidth = 0;
  let y = startY;

  for (const language of source) {
    const width = 18 + language.name.length * 7;
    const nextWidth = row.length === 0 ? width : rowWidth + 26 + width;

    if (row.length > 0 && nextWidth > availableWidth) {
      rows.push({ items: row, width: rowWidth, y });
      row = [];
      rowWidth = 0;
      y += 29;
    }

    row.push({ ...language, width });
    rowWidth = rowWidth === 0 ? width : rowWidth + 26 + width;
  }

  rows.push({ items: row, width: rowWidth, y });

  const items = rows.flatMap((languageRow) => {
    let x = startX + (availableWidth - languageRow.width) / 2;
    return languageRow.items.map((language, index) => {
      const item = { ...language, x, y: languageRow.y };
      x += language.width + (index === languageRow.items.length - 1 ? 0 : 26);
      return item;
    });
  });

  return {
    items,
    bottom: y + 18,
  };
}

/**
 * @param {Array<{name: string, color: string | null, x: number, y: number, width: number}>} items
 * @param {typeof THEMES.light} theme
 */
function renderLanguageItems(items, theme) {
  return items
    .map((language) => {
      const color = safeColor(language.color, theme.muted);
      return `<g>
        <circle cx="${language.x + 4}" cy="${language.y + 5}" r="4" fill="${color}"/>
        <text x="${language.x + 16}" y="${language.y + 9}" class="language" fill="${theme.primary}">${escapeXml(language.name)}</text>
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
