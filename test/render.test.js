import assert from "node:assert/strict";
import test from "node:test";
import { renderCard } from "../src/render.js";

const config = {
  username: "thibault-delattre",
  displayName: "Thibault & Delattre",
  periodDays: 90,
  maxLanguages: 3,
  excludedRepositories: [],
  brand: {
    label: "ENGINEERING <PULSE>",
    accent: "#2f81f7",
  },
};

const metrics = {
  displayName: "Thibault & Delattre",
  generatedAt: "2026-07-23T14:00:00.000Z",
  periodDays: 90,
  contributions: 123,
  momentumPercent: 20,
  activeDays: 42,
  longestStreak: 7,
  pullRequestsMerged: 5,
  pullRequestsOpened: 6,
  reviews: 9,
  repositoriesContributedTo: 4,
  weeklyTotals: [1, 4, 2, 8, 3],
  languages: [
    { name: "TypeScript", percentage: 75, color: "#3178c6" },
    { name: "<unsafe>", percentage: 25, color: "javascript:alert(1)" },
  ],
  featuredRepository: { name: "project & work" },
};

test("renderCard creates a self-contained and escaped SVG", () => {
  const svg = renderCard(metrics, config, "dark");

  assert.match(svg, /^<svg /);
  assert.match(svg, /Thibault &amp; Delattre/);
  assert.match(svg, /ENGINEERING &lt;PULSE&gt;/);
  assert.match(svg, /&lt;unsafe&gt;/);
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
