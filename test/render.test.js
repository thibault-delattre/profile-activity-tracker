import assert from "node:assert/strict";
import test from "node:test";
import { layoutLanguageItems, renderCard } from "../src/render.js";

const config = {
  username: "example-user",
  introduction:
    "I design and build reliable software, thoughtful products, and maintainable developer experiences.",
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
  assert.match(svg, /GITHUB ACTIVITY/);
  assert.match(svg, /COMBINED GITHUB ACTIVITY/);
  assert.match(svg, /Combined across 2 GitHub accounts/);
  assert.match(svg, /THIS WEEK/);
  assert.match(svg, /THIS MONTH/);
  assert.match(svg, /THIS YEAR/);
  assert.match(svg, /ALL TIME/);
  assert.match(svg, /CONTRIBUTIONS/);
  assert.match(
    svg,
    /I design and build reliable software, thoughtful products, and maintainable developer experiences\./,
  );
  assert.match(svg, /FAVORITE LANGUAGES/);
  assert.match(svg, /textLength="836"/);
  assert.match(svg, /lengthAdjust="spacing"/);
  assert.doesNotMatch(svg, /UPDATED /);
  assert.doesNotMatch(svg, />COMMITS</);
  assert.match(svg, /linearGradient id="animated-border"/);
  assert.match(svg, /linearGradient id="glass-fill"/);
  assert.match(svg, /radialGradient id="ambient-blue"/);
  assert.match(svg, /radialGradient id="ambient-red"/);
  assert.doesNotMatch(svg, /liquid-sheen/);
  assert.doesNotMatch(svg, /<feDisplacementMap/);
  assert.doesNotMatch(svg, /svg:hover \.glass-panel/);
  assert.match(svg, /clipPath id="glass-clip"/);
  assert.match(svg, /#58a6ff/);
  assert.match(svg, /#f7fbff/);
  assert.match(svg, /#ff7b72/);
  assert.match(svg, /<animateTransform/);
  assert.match(svg, /repeatCount="indefinite"/);
  assert.doesNotMatch(svg, /REPOSITORIES/);
  assert.doesNotMatch(svg, /rx="12\.5"/);
  assert.match(svg, /&lt;unsafe&gt;/);
  assert.doesNotMatch(svg, /ENGINEERING PULSE/);
  assert.doesNotMatch(svg, /MOMENTUM/i);
  assert.doesNotMatch(svg, /MERGED PR/i);
  assert.doesNotMatch(svg, /CODE REVIEW/i);
  assert.doesNotMatch(svg, /<script/i);
  assert.doesNotMatch(svg, /<foreignObject/i);
  assert.doesNotMatch(svg, /javascript:/i);
  assert.doesNotMatch(svg, /(?:href|src)=["']https?:\/\//i);
});

test("renderCard renders distinct light and dark palettes", () => {
  const light = renderCard(metrics, config, "light");
  const dark = renderCard(metrics, config, "dark");

  assert.match(light, /fill="#ffffff"/);
  assert.match(dark, /fill="#0d1117"/);
  assert.notEqual(light, dark);
});

test("layoutLanguageItems centers and wraps every language", () => {
  const languages = Array.from({ length: 15 }, (_, index) => ({
    name: `Language-${index}`,
    color: "#123456",
  }));
  const layout = layoutLanguageItems(languages, 32, 868, 342);

  assert.equal(layout.items.length, 15);
  assert.ok(new Set(layout.items.map((item) => item.y)).size > 1);
  assert.ok(layout.items.every((item) => item.y > 282));
  assert.ok(
    layout.items.every((item) => item.x + item.width <= 868),
  );
});
