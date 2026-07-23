import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadConfig } from "./config.js";
import { createActivityWindows } from "./dates.js";
import { fetchGitHubActivity } from "./github.js";
import { buildMetrics } from "./metrics.js";
import { createPlaceholderData } from "./placeholder.js";
import { renderCard } from "./render.js";

async function main() {
  const arguments_ = parseArguments(process.argv.slice(2));
  const configPath = resolve(arguments_.config ?? "config/profile.json");
  const outputDirectory = resolve(arguments_.output ?? "generated");
  const config = await loadConfig(configPath);
  const now = arguments_.now ? new Date(arguments_.now) : new Date();

  if (Number.isNaN(now.getTime())) {
    throw new Error("--now must contain a valid ISO-8601 date.");
  }

  const windows = createActivityWindows(now);
  let data;

  if (arguments_.fixture) {
    data = JSON.parse(await readFile(resolve(arguments_.fixture), "utf8"));
  } else if (arguments_.placeholder) {
    data = createPlaceholderData(config, now);
  } else {
    data = await fetchGitHubActivity({
      token: process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? "",
      username: config.username,
      windows,
    });
  }

  const metrics = buildMetrics(data, config, now);
  const outputs = {
    "activity-light.svg": renderCard(metrics, config, "light"),
    "activity-dark.svg": renderCard(metrics, config, "dark"),
    "stats.json": `${JSON.stringify(metrics, null, 2)}\n`,
  };

  await writeOutputsAtomically(outputDirectory, outputs);

  console.log(
    `Generated ${Object.keys(outputs).length} files for @${config.username}: ` +
      `${metrics.activity.total.contributions} contributions.`,
  );
}

/**
 * @param {string} directory
 * @param {Record<string, string>} outputs
 */
async function writeOutputsAtomically(directory, outputs) {
  await mkdir(directory, { recursive: true });

  for (const [name, contents] of Object.entries(outputs)) {
    const target = resolve(directory, name);
    const temporary = `${target}.tmp`;
    await writeFile(temporary, contents, "utf8");
    await rename(temporary, target);
  }
}

/**
 * @param {string[]} values
 */
function parseArguments(values) {
  /** @type {Record<string, string | boolean>} */
  const parsed = {};

  for (let index = 0; index < values.length; index += 1) {
    const argument = values[index];

    if (argument === "--placeholder") {
      parsed.placeholder = true;
      continue;
    }

    if (["--config", "--output", "--fixture", "--now"].includes(argument)) {
      const value = values[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a value.`);
      }
      parsed[argument.slice(2)] = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return parsed;
}

main().catch((error) => {
  console.error(`Profile generation failed: ${error.message}`);
  process.exitCode = 1;
});
