import { readFile } from "node:fs/promises";

const USERNAME_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/**
 * @typedef {object} TrackerConfig
 * @property {string} username
 * @property {string} displayName
 * @property {string[]} excludedRepositories
 * @property {{accent: string}} brand
 */

/**
 * @param {string} path
 * @returns {Promise<TrackerConfig>}
 */
export async function loadConfig(path) {
  let parsed;

  try {
    parsed = JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read configuration at ${path}: ${error.message}`);
  }

  return validateConfig(parsed);
}

/**
 * @param {unknown} value
 * @returns {TrackerConfig}
 */
export function validateConfig(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Configuration must be a JSON object.");
  }

  const config = /** @type {Record<string, unknown>} */ (value);

  if (
    typeof config.username !== "string" ||
    !USERNAME_PATTERN.test(config.username)
  ) {
    throw new Error("username must be a valid GitHub username.");
  }

  if (
    typeof config.displayName !== "string" ||
    config.displayName.trim().length < 1 ||
    config.displayName.length > 60
  ) {
    throw new Error("displayName must contain between 1 and 60 characters.");
  }

  if (
    !Array.isArray(config.excludedRepositories) ||
    config.excludedRepositories.some(
      (repository) => typeof repository !== "string" || repository.length < 1,
    )
  ) {
    throw new Error("excludedRepositories must be an array of repository names.");
  }

  if (
    !config.brand ||
    typeof config.brand !== "object" ||
    Array.isArray(config.brand)
  ) {
    throw new Error("brand must be an object.");
  }

  const brand = /** @type {Record<string, unknown>} */ (config.brand);

  if (
    typeof brand.accent !== "string" ||
    !HEX_COLOR_PATTERN.test(brand.accent)
  ) {
    throw new Error("brand.accent must be a six-digit hexadecimal color.");
  }

  return /** @type {TrackerConfig} */ ({
    username: config.username,
    displayName: config.displayName.trim(),
    excludedRepositories: [...new Set(config.excludedRepositories)],
    brand: {
      accent: brand.accent.toLowerCase(),
    },
  });
}
