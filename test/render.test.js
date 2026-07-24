import assert from "node:assert/strict";
import test from "node:test";
import {
  layoutAbout,
  layoutLanguageItems,
  renderCard,
  wrapText,
} from "../src/render.js";

const config = {
  username: "example-user",
  introduction:
    "I design and build reliable software, thoughtful products, and maintainable developer experiences.",
  about:
    "I enjoy turning complex engineering problems into useful software. My goal is to keep learning and build products with a clear purpose.",
  excludedRepositories: [],
  brand: {
    accent: "#2f81f7",
  },
};

const metrics = {
  username: "example-user",
  sourceCount: 2,
  generatedAt: "2026-07-23T14:00:00.000Z",
  activity: {
    week: { contributions: 3, activeDays: 2 },
    month: { contributions: 14, activeDays: 6 },
    year: { contributions: 92, activeDays: 31 },
    total: { contributions: 430, activeDays: 140 },
  },
  languages: [
    { name: "TypeScript", color: "#3178c6" },
    { name: "<unsafe>", color: "javascript:alert(1)" },
  ],
};

test("renderCard creates a self-contained, escaped activity table", () => {
  const svg = renderCard(metrics, config, "dark");

  assert.match(svg, /^<svg /);
  assert.doesNotMatch(svg, />GITHUB ACTIVITY</);
  assert.doesNotMatch(svg, /COMBINED GITHUB ACTIVITY/);
  assert.doesNotMatch(svg, /Combined across/);
  assert.match(svg, /THIS WEEK/);
  assert.match(svg, /THIS MONTH/);
  assert.match(svg, /THIS YEAR/);
  assert.match(svg, /ALL TIME/);
  assert.match(svg, /CONTRIBUTIONS/);
  assert.match(
    svg,
    /I design and build reliable software, thoughtful products, and maintainable developer experiences\./,
  );
  assert.match(svg, /I enjoy turning complex engineering problems/);
  assert.match(
    svg,
    /<tspan x="32"[^>]*font-size="14px" word-spacing="[^"]+px"/,
  );
  assert.doesNotMatch(svg, /<tspan[^>]*textLength=/);
  assert.doesNotMatch(svg, /FAVORITE LANGUAGES/);
  assert.doesNotMatch(svg, /aria-label="TypeScript logo"/);
  assert.doesNotMatch(svg, /aria-label="&lt;unsafe&gt; code icon"/);
  assert.doesNotMatch(svg, /<path d="[^"]+" fill="#3178C6"\/>/);
  assert.match(svg, /<text x="32" y="38" class="introduction reveal"/);
  assert.doesNotMatch(svg, /class="eyebrow"/);
  assert.doesNotMatch(svg, /<line x1="32"/);
  assert.doesNotMatch(svg, /<line x1="560"/);
  assert.match(svg, /@keyframes fade-in/);
  assert.match(
    svg,
    /fade-in 950ms cubic-bezier\(0\.4, 0, 0\.2, 1\) both/,
  );
  assert.match(svg, /will-change: opacity/);
  assert.match(svg, /animation-delay:\d+ms/);
  assert.match(svg, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(svg, /textLength=/);
  assert.doesNotMatch(svg, /lengthAdjust=/);
  assert.doesNotMatch(svg, /UPDATED /);
  assert.doesNotMatch(svg, />COMMITS</);
  assert.match(svg, /linearGradient id="glass-border"/);
  assert.match(svg, /linearGradient id="glass-fill"/);
  assert.match(svg, /radialGradient id="glass-glow"/);
  assert.match(svg, /filter id="liquid-texture"/);
  assert.match(svg, /<feTurbulence/);
  assert.match(svg, /<feGaussianBlur/);
  assert.match(svg, /<feSpecularLighting/);
  assert.match(svg, /<feDisplacementMap/);
  assert.doesNotMatch(svg, /svg:hover \.glass-panel/);
  assert.match(svg, /clipPath id="glass-clip"/);
  assert.doesNotMatch(svg, /#58a6ff/);
  assert.doesNotMatch(svg, /#ff7b72/);
  assert.doesNotMatch(svg, /<animateTransform/);
  assert.doesNotMatch(svg, /REPOSITORIES/);
  assert.doesNotMatch(svg, /rx="12\.5"/);
  assert.doesNotMatch(svg, /&lt;unsafe&gt;/);
  assert.doesNotMatch(svg, /ENGINEERING PULSE/);
  assert.doesNotMatch(svg, /MOMENTUM/i);
  assert.doesNotMatch(svg, /MERGED PR/i);
  assert.doesNotMatch(svg, /CODE REVIEW/i);
  assert.doesNotMatch(svg, /<script/i);
  assert.doesNotMatch(svg, /<foreignObject/i);
  assert.doesNotMatch(svg, /javascript:/i);
  assert.doesNotMatch(svg, /(?:href|src)=["']https?:\/\//i);
});

test("wrapText keeps prose intact and wraps only at word boundaries", () => {
  const text =
    "I enjoy building thoughtful products and learning from difficult engineering problems.";
  const lines = wrapText(text, 32);

  assert.ok(lines.length > 1);
  assert.equal(lines.join(" "), text);
  assert.ok(lines.every((line) => line.length <= 32));
});

test("layoutAbout justifies paragraphs using word spacing only", () => {
  const text =
    "I enjoy building thoughtful software and useful products while continuing to learn from difficult engineering challenges across several different technical environments and product teams.\n\nI want to deepen my engineering skills and create tools with a clear purpose.";
  const layout = layoutAbout(text);

  assert.equal(
    layout.lines.map((line) => line.text).join(" "),
    text.replace(/\n+/g, " "),
  );
  assert.equal(layout.fontSize, 14);
  assert.ok(layout.lines.every((line) => Number(line.wordSpacing) >= 0));
  assert.equal(layout.lineHeight, 21);
  assert.equal(layout.paragraphGap, 12);
  assert.ok(layout.lines.some((line) => line.dy === 33));
  assert.ok(layout.lines.some((line) => Number(line.wordSpacing) > 0));
  assert.equal(layout.lines.at(-1).wordSpacing, "0");
  assert.equal(
    layout.height,
    layout.lines.length * layout.lineHeight + layout.paragraphGap,
  );
});

test("renderCard renders distinct light and dark palettes", () => {
  const light = renderCard(metrics, config, "light");
  const dark = renderCard(metrics, config, "dark");

  assert.match(light, /fill="#ffffff"/);
  assert.match(dark, /fill="#0d1117"/);
  assert.notEqual(light, dark);
});

test("renderCard leaves only a compact margin below the activity panel", () => {
  const svg = renderCard(metrics, config, "light");
  const svgHeight = Number(svg.match(/<svg[^>]* height="(\d+)"/)?.[1]);
  const panelMatch = svg.match(
    /<rect x="16" y="(\d+)" width="868" height="164" rx="18"\/>/,
  );
  const panelBottom = Number(panelMatch?.[1]) + 164;

  assert.equal(svgHeight - panelBottom, 16);
});

test("layoutLanguageItems left-aligns and wraps every language", () => {
  const languages = Array.from({ length: 15 }, (_, index) => ({
    name: `Language-${index}`,
    color: "#123456",
  }));
  const layout = layoutLanguageItems(languages, 32, 868, 342);

  assert.equal(layout.items.length, 15);
  assert.ok(new Set(layout.items.map((item) => item.y)).size > 1);
  assert.ok(layout.items.every((item) => item.y > 282));
  for (const y of new Set(layout.items.map((item) => item.y))) {
    assert.equal(layout.items.find((item) => item.y === y).x, 32);
  }
  assert.ok(
    layout.items.every((item) => item.x + item.width <= 868),
  );
});
