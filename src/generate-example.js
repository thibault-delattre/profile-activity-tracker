import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderCard } from "./render.js";

const config = {
  username: "sample-developer",
  introduction: "Hello, I'm Alex — software developer",
  about:
    "I enjoy building thoughtful products, learning from challenging engineering problems, and turning useful ideas into polished digital experiences.",
};

const metrics = {
  username: config.username,
  sourceCount: 1,
  generatedAt: "2026-01-01T00:00:00.000Z",
  periods: {
    week: { from: "2025-12-26", to: "2026-01-01", days: 7 },
    month: { from: "2025-12-03", to: "2026-01-01", days: 30 },
    year: { from: "2025-01-02", to: "2026-01-01", days: 365 },
  },
  activity: {
    week: { contributions: 18, activeDays: 5 },
    month: { contributions: 72, activeDays: 19 },
    year: { contributions: 684, activeDays: 143 },
    total: { contributions: 2450, activeDays: 512 },
  },
  languages: [],
};

const outputDirectory = resolve("docs");

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    resolve(outputDirectory, "activity-example-light.svg"),
    renderCard(metrics, config, "light"),
    "utf8",
  ),
  writeFile(
    resolve(outputDirectory, "activity-example-dark.svg"),
    renderCard(metrics, config, "dark"),
    "utf8",
  ),
]);

console.log("Generated static documentation examples.");
