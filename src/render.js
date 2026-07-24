import {
  siCss,
  siDocker,
  siEjs,
  siGnubash,
  siGo,
  siHtml5,
  siJavascript,
  siPhp,
  siPython,
  siSass,
  siTypescript,
  siVuedotjs,
} from "simple-icons";

const WIDTH = 900;
const PANEL = {
  x: 16,
  width: 868,
  height: 210,
  radius: 12,
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

const LANGUAGE_ICONS = {
  css: siCss,
  dockerfile: siDocker,
  ejs: siEjs,
  go: siGo,
  html: siHtml5,
  javascript: siJavascript,
  php: siPhp,
  python: siPython,
  scss: siSass,
  shell: siGnubash,
  typescript: siTypescript,
  vue: siVuedotjs,
};

/**
 * @param {Record<string, any>} metrics
 * @param {import("./config.js").TrackerConfig} config
 * @param {"light" | "dark"} mode
 */
export function renderCard(metrics, config, mode) {
  const theme = THEMES[mode];
  const introduction = config.introduction;
  const aboutLayout = layoutAbout(config.about);
  const panel = {
    ...PANEL,
    y: 80 + aboutLayout.height,
  };
  const verticalOffset = panel.y - 72;
  const height = panel.y + panel.height + 16;
  const periods = [
    { label: "THIS WEEK", values: metrics.activity.week },
    { label: "THIS MONTH", values: metrics.activity.month },
    { label: "THIS YEAR", values: metrics.activity.year },
    { label: "ALL TIME", values: metrics.activity.total },
  ];
  const columnCenters = [275, 435, 595, 760];
  const revealStep = 90;
  const aboutRevealStart = revealStep;
  const panelRevealDelay =
    aboutRevealStart + aboutLayout.lines.length * revealStep + 140;
  const activityRevealDelay = panelRevealDelay + 130;
  const periodsRevealDelay = activityRevealDelay + revealStep;
  const contributionsRevealDelay = periodsRevealDelay + revealStep;
  const activeDaysRevealDelay = contributionsRevealDelay + revealStep;
  const languagesRevealDelay = activeDaysRevealDelay + 150;
  const languageItemsRevealDelay = languagesRevealDelay + revealStep;

  const title = `GitHub activity for @${metrics.username}`;
  const description = `${introduction} ${config.about} ${[
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
      <rect x="${panel.x}" y="${panel.y}" width="${panel.width}" height="${panel.height}" rx="${panel.radius}"/>
    </clipPath>
    <linearGradient id="animated-border" x1="${panel.x}" y1="${panel.y}" x2="${panel.x + panel.width}" y2="${panel.y + panel.height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#58a6ff"/>
      <stop offset="25%" stop-color="#f7fbff"/>
      <stop offset="50%" stop-color="#ff7b72"/>
      <stop offset="75%" stop-color="#f7fbff"/>
      <stop offset="100%" stop-color="#58a6ff"/>
      <animateTransform
        attributeName="gradientTransform"
        type="rotate"
        from="0 ${WIDTH / 2} ${panel.y + panel.height / 2}"
        to="360 ${WIDTH / 2} ${panel.y + panel.height / 2}"
        dur="6s"
        repeatCount="indefinite"
      />
    </linearGradient>
    <linearGradient id="glass-fill" x1="0" y1="${panel.y}" x2="0" y2="${panel.y + panel.height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.glassStart}" stop-opacity="${theme.glassStartOpacity}"/>
      <stop offset="48%" stop-color="${theme.glassEnd}" stop-opacity="${theme.glassMiddleOpacity}"/>
      <stop offset="100%" stop-color="${theme.glassStart}" stop-opacity="${theme.glassEndOpacity}"/>
    </linearGradient>
    <radialGradient id="ambient-blue" cx="0%" cy="0%" r="105%">
      <stop offset="0%" stop-color="#58a6ff" stop-opacity="${mode === "light" ? 0.16 : 0.13}"/>
      <stop offset="48%" stop-color="#58a6ff" stop-opacity="0.035"/>
      <stop offset="100%" stop-color="#58a6ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ambient-red" cx="100%" cy="100%" r="110%">
      <stop offset="0%" stop-color="#ff7b72" stop-opacity="${mode === "light" ? 0.12 : 0.09}"/>
      <stop offset="52%" stop-color="#ff7b72" stop-opacity="0.025"/>
      <stop offset="100%" stop-color="#ff7b72" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glass-highlight" x1="${panel.x + 24}" y1="${panel.y + 4}" x2="${panel.x + panel.width - 80}" y2="${panel.y + 100}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${theme.highlightOpacity}"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="period-fill" x1="184" y1="${132 + verticalOffset}" x2="856" y2="${164 + verticalOffset}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.surface}" stop-opacity="0.84"/>
      <stop offset="50%" stop-color="${theme.surface}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${theme.surface}" stop-opacity="0.76"/>
    </linearGradient>
    <filter id="panel-shadow" x="-12%" y="-32%" width="124%" height="174%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="${theme.shadow}" flood-opacity="0.15"/>
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${theme.shadow}" flood-opacity="0.08"/>
    </filter>
    <filter id="activity-title-shadow" x="-8%" y="-45%" width="116%" height="190%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000000" flood-opacity="${mode === "light" ? 0.42 : 0.55}"/>
    </filter>
  </defs>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .introduction { font-size: 22px; font-weight: 600; }
    .about { font-weight: 400; }
    .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 1.4px; }
    .period { font-size: 10px; font-weight: 700; letter-spacing: 1.1px; }
    .row-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; }
    .value { font-size: 29px; font-weight: 650; }
    .language { font-size: 12px; font-weight: 600; }
    .reveal {
      opacity: 0;
      animation: fade-in 950ms cubic-bezier(0.4, 0, 0.2, 1) both;
      will-change: opacity;
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .reveal { opacity: 1; animation: none; }
    }
  </style>
  <rect width="${WIDTH}" height="${height}" fill="${theme.background}"/>
  <text x="32" y="38" class="introduction reveal" style="animation-delay:0ms" fill="${theme.primary}">${escapeXml(introduction)}</text>
  <text x="32" y="65" class="about" fill="${theme.secondary}">${aboutLayout.lines
    .map(
      (line, index) =>
        `<tspan x="32" dy="${index === 0 ? 0 : line.dy}" class="reveal" style="animation-delay:${aboutRevealStart + index * revealStep}ms" font-size="${aboutLayout.fontSize}px" word-spacing="${line.wordSpacing}px">${escapeXml(line.text)}</tspan>`,
    )
    .join("")}</text>

  <g class="glass-panel">
    <g class="reveal" style="animation-delay:${panelRevealDelay}ms">
      <rect x="${panel.x}" y="${panel.y}" width="${panel.width}" height="${panel.height}" rx="${panel.radius}" fill="${theme.glassEnd}" opacity="0.74" filter="url(#panel-shadow)"/>
      <rect x="${panel.x}" y="${panel.y}" width="${panel.width}" height="${panel.height}" rx="${panel.radius}" fill="url(#glass-fill)"/>
      <g clip-path="url(#glass-clip)" pointer-events="none">
        <rect x="${panel.x}" y="${panel.y}" width="${panel.width}" height="${panel.height}" fill="url(#ambient-blue)"/>
        <rect x="${panel.x}" y="${panel.y}" width="${panel.width}" height="${panel.height}" fill="url(#ambient-red)"/>
      </g>
      <rect x="${panel.x + 3}" y="${panel.y + 3}" width="${panel.width - 6}" height="${panel.height - 6}" rx="${panel.radius - 3}" fill="none" stroke="#ffffff" stroke-opacity="${mode === "light" ? 0.36 : 0.12}"/>
      <path d="M ${panel.x + 24} ${panel.y + 1.5} H ${panel.x + panel.width - 120}" stroke="url(#glass-highlight)" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="${panel.x + 1.25}" y="${panel.y + 1.25}" width="${panel.width - 2.5}" height="${panel.height - 2.5}" rx="${panel.radius - 1}" fill="none" stroke="url(#animated-border)" stroke-width="2.5"/>
    </g>
    <g class="reveal" style="animation-delay:${activityRevealDelay}ms">
      <text x="44" y="${105 + verticalOffset}" class="eyebrow" fill="#ffffff" filter="url(#activity-title-shadow)">GITHUB ACTIVITY</text>
      <line x1="44" y1="${120 + verticalOffset}" x2="856" y2="${120 + verticalOffset}" stroke="${theme.line}" stroke-opacity="0.82"/>
    </g>
    <g class="reveal" style="animation-delay:${periodsRevealDelay}ms">
      <rect x="184" y="${132 + verticalOffset}" width="672" height="32" rx="6" fill="url(#period-fill)" stroke="#ffffff" stroke-opacity="${mode === "light" ? 0.5 : 0.09}"/>
      ${periods
        .map(
          (period, index) =>
            `<text x="${columnCenters[index]}" y="${152 + verticalOffset}" text-anchor="middle" class="period" fill="${theme.secondary}">${period.label}</text>`,
        )
        .join("")}
    </g>
    <g class="reveal" style="animation-delay:${contributionsRevealDelay}ms">
      <text x="44" y="${190 + verticalOffset}" class="row-label" fill="${theme.secondary}">CONTRIBUTIONS</text>
      ${periods
        .map(
          (period, index) =>
            `<text x="${columnCenters[index]}" y="${195 + verticalOffset}" text-anchor="middle" class="value" fill="${theme.primary}">${formatNumber(period.values.contributions)}</text>`,
        )
        .join("")}
    </g>
    <g class="reveal" style="animation-delay:${activeDaysRevealDelay}ms">
      <line x1="184" y1="${210 + verticalOffset}" x2="856" y2="${210 + verticalOffset}" stroke="${theme.line}" stroke-opacity="0.84"/>
      <text x="44" y="${243 + verticalOffset}" class="row-label" fill="${theme.secondary}">ACTIVE DAYS</text>
      ${periods
        .map(
          (period, index) =>
            `<text x="${columnCenters[index]}" y="${248 + verticalOffset}" text-anchor="middle" class="value" fill="${theme.primary}">${formatNumber(period.values.activeDays)}</text>`,
        )
        .join("")}
    </g>
  </g>

</svg>`;
}

/**
 * Wrap prose at word boundaries for SVG, where automatic text wrapping is not
 * available. The character limit is conservative for the configured font.
 *
 * @param {string} value
 * @param {number} maximumCharacters
 */
export function wrapText(value, maximumCharacters) {
  const words = String(value).trim().split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > maximumCharacters) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

/**
 * Keep glyph shapes and natural letter spacing intact while sizing each
 * balanced line to use as much of the available width as possible.
 *
 * @param {string} value
 */
export function layoutAbout(value) {
  const maximumWidth = 836;
  const fontSize = 14;
  const lineHeight = 21;
  const paragraphGap = 12;
  const paragraphs = String(value).trim().split(/\n\s*\n/);
  const lines = paragraphs.flatMap((paragraph, paragraphIndex) =>
    wrapTextByWidth(paragraph, maximumWidth, fontSize).map(
      (text, lineIndex, paragraphLines) => {
        const spaces = Math.max(text.trim().split(/\s+/).length - 1, 0);
        const naturalWidth = estimateTextWidth(text) * fontSize;
        const isLastLine = lineIndex === paragraphLines.length - 1;

        return {
          text,
          dy:
            paragraphIndex > 0 && lineIndex === 0
              ? lineHeight + paragraphGap
              : lineHeight,
          wordSpacing:
            !isLastLine && spaces > 0
              ? formatSvgDecimal(
                  Math.max((maximumWidth - naturalWidth) / spaces, 0),
                )
              : "0",
        };
      },
    ),
  );

  return {
    lines,
    fontSize,
    lineHeight,
    paragraphGap,
    height:
      lines.length * lineHeight +
      Math.max(paragraphs.length - 1, 0) * paragraphGap,
  };
}

/**
 * Wrap text using the same proportional-width estimate used to calculate
 * justification spacing.
 *
 * @param {string} value
 * @param {number} maximumWidth
 * @param {number} fontSize
 */
function wrapTextByWidth(value, maximumWidth, fontSize) {
  const words = String(value).trim().split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (
      line &&
      estimateTextWidth(candidate) * fontSize > maximumWidth
    ) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

/**
 * Approximate proportional system-font metrics without introducing a font or
 * canvas dependency. The correction factor leaves a small safety margin for
 * platform differences between macOS, Windows, and Linux.
 *
 * @param {string} value
 */
function estimateTextWidth(value) {
  let width = 0;

  for (const character of value) {
    if (character === " ") {
      width += 0.278;
    } else if (/[ilj]/.test(character)) {
      width += 0.222;
    } else if (/[ftr]/.test(character)) {
      width += 0.3;
    } else if (character === "m") {
      width += 0.833;
    } else if (character === "w") {
      width += 0.722;
    } else if (character === "I") {
      width += 0.278;
    } else if (character === "M") {
      width += 0.833;
    } else if (character === "W") {
      width += 0.944;
    } else if (/[A-Z]/.test(character)) {
      width += 0.667;
    } else if (/[a-z0-9]/.test(character)) {
      width += 0.52;
    } else {
      width += 0.278;
    }
  }

  return width * 1.07;
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
    const width = 24 + language.name.length * 7;
    const nextWidth = row.length === 0 ? width : rowWidth + 22 + width;

    if (row.length > 0 && nextWidth > availableWidth) {
      rows.push({ items: row, width: rowWidth, y });
      row = [];
      rowWidth = 0;
      y += 29;
    }

    row.push({ ...language, width });
    rowWidth = rowWidth === 0 ? width : rowWidth + 22 + width;
  }

  rows.push({ items: row, width: rowWidth, y });

  const items = rows.flatMap((languageRow) => {
    let x = startX;
    return languageRow.items.map((language, index) => {
      const item = { ...language, x, y: languageRow.y };
      x += language.width + (index === languageRow.items.length - 1 ? 0 : 22);
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
      const icon = LANGUAGE_ICONS[language.name.toLowerCase()];
      const fallbackColor = safeColor(language.color, theme.muted);
      const iconMarkup = icon
        ? `<svg x="${language.x}" y="${language.y - 4}" width="18" height="18" viewBox="0 0 24 24" role="img" aria-label="${escapeXml(language.name)} logo">
          <title>${escapeXml(language.name)} logo</title>
          <path d="${icon.path}" fill="#${icon.hex}"/>
        </svg>`
        : `<svg x="${language.x}" y="${language.y - 4}" width="18" height="18" viewBox="0 0 18 18" role="img" aria-label="${escapeXml(language.name)} code icon">
          <title>${escapeXml(language.name)} code icon</title>
          <rect x="0.75" y="0.75" width="16.5" height="16.5" rx="4" fill="${fallbackColor}" fill-opacity="0.16" stroke="${fallbackColor}" stroke-opacity="0.62"/>
          <path d="M7 5.5 3.5 9 7 12.5M11 5.5 14.5 9 11 12.5" fill="none" stroke="${fallbackColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      return `<g>
        ${iconMarkup}
        <text x="${language.x + 24}" y="${language.y + 9}" class="language" fill="${theme.primary}">${escapeXml(language.name)}</text>
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
function formatSvgDecimal(value) {
  return value.toFixed(1).replace(/\.0$/, "");
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
