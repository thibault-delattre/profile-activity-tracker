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
  height: 164,
  radius: 18,
};

const THEMES = {
  light: {
    background: "#ffffff",
    surface: "#ffffff",
    glassStart: "#ffffff",
    glassEnd: "#e8edf3",
    glassStartOpacity: 0.94,
    glassMiddleOpacity: 0.7,
    glassEndOpacity: 0.88,
    highlightOpacity: 0.82,
    textureOpacity: 0.18,
    shadow: "#687482",
    primary: "#1f2328",
    secondary: "#46515e",
    muted: "#818b98",
    line: "#cfd7e1",
  },
  dark: {
    background: "#0d1117",
    surface: "#ffffff",
    glassStart: "#ffffff",
    glassEnd: "#dce3eb",
    glassStartOpacity: 0.12,
    glassMiddleOpacity: 0.07,
    glassEndOpacity: 0.1,
    highlightOpacity: 0.52,
    textureOpacity: 0.07,
    shadow: "#000000",
    primary: "#f7f9fc",
    secondary: "#d8e0ea",
    muted: "#b7c0ca",
    line: "#ffffff",
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
  const height = panel.y + panel.height + 16;
  const periodBoxY = panel.y + 16;
  const periodTextY = periodBoxY + 20;
  const contributionsY = panel.y + 78;
  const contributionValueY = panel.y + 83;
  const dividerY = panel.y + 98;
  const activeDaysY = panel.y + 137;
  const activeDaysValueY = panel.y + 142;
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
  const periodsRevealDelay = panelRevealDelay + 130;
  const contributionsRevealDelay = periodsRevealDelay + revealStep;
  const activeDaysRevealDelay = contributionsRevealDelay + revealStep;

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
    <linearGradient id="glass-border" x1="${panel.x}" y1="${panel.y}" x2="${panel.x + panel.width}" y2="${panel.y + panel.height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${mode === "light" ? 0.98 : 0.82}"/>
      <stop offset="35%" stop-color="#ffffff" stop-opacity="${mode === "light" ? 0.5 : 0.28}"/>
      <stop offset="68%" stop-color="#dfe6ee" stop-opacity="${mode === "light" ? 0.8 : 0.38}"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="${mode === "light" ? 0.96 : 0.7}"/>
    </linearGradient>
    <linearGradient id="glass-fill" x1="0" y1="${panel.y}" x2="0" y2="${panel.y + panel.height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.glassStart}" stop-opacity="${theme.glassStartOpacity}"/>
      <stop offset="48%" stop-color="${theme.glassEnd}" stop-opacity="${theme.glassMiddleOpacity}"/>
      <stop offset="100%" stop-color="${theme.glassStart}" stop-opacity="${theme.glassEndOpacity}"/>
    </linearGradient>
    <radialGradient id="glass-glow" cx="18%" cy="0%" r="105%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${mode === "light" ? 0.9 : 0.3}"/>
      <stop offset="48%" stop-color="#ffffff" stop-opacity="${mode === "light" ? 0.2 : 0.08}"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glass-highlight" x1="${panel.x + 24}" y1="${panel.y + 4}" x2="${panel.x + panel.width - 80}" y2="${panel.y + 100}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${theme.highlightOpacity}"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="period-fill" x1="184" y1="${periodBoxY}" x2="856" y2="${periodBoxY + 32}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.surface}" stop-opacity="${mode === "light" ? 0.82 : 0.1}"/>
      <stop offset="50%" stop-color="${theme.surface}" stop-opacity="${mode === "light" ? 0.42 : 0.055}"/>
      <stop offset="100%" stop-color="${theme.surface}" stop-opacity="${mode === "light" ? 0.72 : 0.085}"/>
    </linearGradient>
    <filter id="panel-shadow" x="-12%" y="-48%" width="124%" height="196%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="${theme.shadow}" flood-opacity="${mode === "light" ? 0.16 : 0.42}"/>
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${theme.shadow}" flood-opacity="${mode === "light" ? 0.09 : 0.28}"/>
    </filter>
    <filter id="liquid-texture" x="-8%" y="-28%" width="116%" height="156%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.009 0.035" numOctaves="2" seed="5" result="turbulence"/>
      <feGaussianBlur in="turbulence" stdDeviation="2.6" result="soft-map"/>
      <feSpecularLighting in="soft-map" surfaceScale="3" specularConstant="0.45" specularExponent="32" lighting-color="#ffffff" result="specular">
        <fePointLight x="-120" y="-180" z="260"/>
      </feSpecularLighting>
      <feComposite in="specular" in2="SourceGraphic" operator="in" result="clipped-specular"/>
      <feDisplacementMap in="SourceGraphic" in2="soft-map" scale="16" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
      <feBlend in="displaced" in2="clipped-specular" mode="screen"/>
    </filter>
    <filter id="soft-glow" x="-20%" y="-80%" width="140%" height="260%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .introduction { font-size: 22px; font-weight: 600; }
    .about { font-weight: 400; }
    .period { font-size: 10.5px; font-weight: 750; letter-spacing: 1.1px; }
    .row-label { font-size: 11px; font-weight: 750; letter-spacing: 1px; }
    .value { font-size: 29px; font-weight: 650; }
    .language { font-size: 12px; font-weight: 600; }
    .liquid-blob {
      transform-box: fill-box;
      transform-origin: center;
      animation: liquid-drift-one 15s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
      will-change: transform, opacity;
    }
    .liquid-blob.secondary {
      animation-name: liquid-drift-two;
      animation-duration: 19s;
    }
    .liquid-texture-layer {
      transform-box: fill-box;
      transform-origin: center;
      animation: liquid-texture-flow 24s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
      will-change: transform;
    }
    .reveal {
      opacity: 0;
      transform-box: fill-box;
      transform-origin: center;
      animation: smooth-appear 1050ms cubic-bezier(0.16, 1, 0.3, 1) both;
      will-change: opacity, transform;
    }
    @keyframes smooth-appear {
      0% { opacity: 0; transform: translateY(7px) scale(0.92); }
      68% { opacity: 1; transform: translateY(-1px) scale(1.018); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes liquid-drift-one {
      0% { transform: translate(-120px, -8px) scale(0.94); opacity: ${mode === "light" ? 0.18 : 0.08}; }
      48% { transform: translate(170px, 18px) scale(1.08); opacity: ${mode === "light" ? 0.34 : 0.16}; }
      100% { transform: translate(410px, -2px) scale(0.98); opacity: ${mode === "light" ? 0.22 : 0.1}; }
    }
    @keyframes liquid-drift-two {
      0% { transform: translate(150px, 14px) scale(1.04); opacity: ${mode === "light" ? 0.14 : 0.07}; }
      52% { transform: translate(-130px, -10px) scale(0.92); opacity: ${mode === "light" ? 0.28 : 0.13}; }
      100% { transform: translate(-380px, 12px) scale(1.1); opacity: ${mode === "light" ? 0.16 : 0.08}; }
    }
    @keyframes liquid-texture-flow {
      0% { transform: translate(-18px, -6px) scale(1.02); }
      50% { transform: translate(8px, 7px) scale(1.055); }
      100% { transform: translate(20px, -3px) scale(1.025); }
    }
    @media (prefers-reduced-motion: reduce) {
      .reveal { opacity: 1; animation: none; }
      .liquid-blob, .liquid-texture-layer { animation: none; }
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
      <rect x="${panel.x}" y="${panel.y}" width="${panel.width}" height="${panel.height}" rx="${panel.radius}" fill="${theme.glassEnd}" opacity="${mode === "light" ? 0.78 : 0.12}" filter="url(#panel-shadow)"/>
      <rect x="${panel.x}" y="${panel.y}" width="${panel.width}" height="${panel.height}" rx="${panel.radius}" fill="url(#glass-fill)"/>
      <g clip-path="url(#glass-clip)" pointer-events="none">
        <rect x="${panel.x}" y="${panel.y}" width="${panel.width}" height="${panel.height}" fill="url(#glass-glow)"/>
        <ellipse class="liquid-blob" cx="${panel.x + 160}" cy="${panel.y + 24}" rx="300" ry="58" fill="#ffffff" filter="url(#soft-glow)"/>
        <ellipse class="liquid-blob secondary" cx="${panel.x + 700}" cy="${panel.y + 132}" rx="260" ry="64" fill="#ffffff" filter="url(#soft-glow)"/>
        <rect class="liquid-texture-layer" x="${panel.x - 20}" y="${panel.y - 20}" width="${panel.width + 40}" height="${panel.height + 40}" rx="${panel.radius + 20}" fill="#ffffff" fill-opacity="${theme.textureOpacity}" filter="url(#liquid-texture)"/>
      </g>
      <rect x="${panel.x + 3}" y="${panel.y + 3}" width="${panel.width - 6}" height="${panel.height - 6}" rx="${panel.radius - 3}" fill="none" stroke="#ffffff" stroke-opacity="${mode === "light" ? 0.66 : 0.2}"/>
      <path d="M ${panel.x + 30} ${panel.y + 2} H ${panel.x + panel.width - 160}" stroke="url(#glass-highlight)" stroke-width="2" stroke-linecap="round"/>
      <rect x="${panel.x + 1.25}" y="${panel.y + 1.25}" width="${panel.width - 2.5}" height="${panel.height - 2.5}" rx="${panel.radius - 1}" fill="none" stroke="url(#glass-border)" stroke-width="2.5"/>
    </g>
    <g class="reveal" style="animation-delay:${periodsRevealDelay}ms">
      <rect x="184" y="${periodBoxY}" width="672" height="32" rx="9" fill="url(#period-fill)" stroke="#ffffff" stroke-opacity="${mode === "light" ? 0.72 : 0.13}"/>
      ${periods
        .map(
          (period, index) =>
            `<text x="${columnCenters[index]}" y="${periodTextY}" text-anchor="middle" class="period" fill="${theme.secondary}">${period.label}</text>`,
        )
        .join("")}
    </g>
    <g class="reveal" style="animation-delay:${contributionsRevealDelay}ms">
      <text x="44" y="${contributionsY}" class="row-label" fill="${theme.secondary}">CONTRIBUTIONS</text>
      ${periods
        .map(
          (period, index) =>
            `<text x="${columnCenters[index]}" y="${contributionValueY}" text-anchor="middle" class="value" fill="${theme.primary}">${formatNumber(period.values.contributions)}</text>`,
        )
        .join("")}
    </g>
    <g class="reveal" style="animation-delay:${activeDaysRevealDelay}ms">
      <line x1="184" y1="${dividerY}" x2="856" y2="${dividerY}" stroke="${theme.line}" stroke-opacity="${mode === "light" ? 0.72 : 0.18}"/>
      <text x="44" y="${activeDaysY}" class="row-label" fill="${theme.secondary}">ACTIVE DAYS</text>
      ${periods
        .map(
          (period, index) =>
            `<text x="${columnCenters[index]}" y="${activeDaysValueY}" text-anchor="middle" class="value" fill="${theme.primary}">${formatNumber(period.values.activeDays)}</text>`,
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
