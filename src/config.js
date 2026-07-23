import { readFile } from "node:fs/promises";

const USERNAME_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/**
 * @typedef {object} TrackerConfig
 * @property {string} username
 * @property {string} displayName
 * @property {number} periodDays
 * @property {number} maxLanguages
 * @property {string[]} excludedRepositories
 * @property {{label: string, accent: string}} brand
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
    !Number.isInteger(config.periodDays) ||
    Number(config.periodDays) < 30 ||
    Number(config.periodDays) > 365
  ) {
    throw new Error("periodDays must be an integer between 30 and 365.");
  }

  if (
    !Number.isInteger(config.maxLanguages) ||
    Number(config.maxLanguages) < 1 ||
    Number(config.maxLanguages) > 5
  ) {
    throw new Error("maxLanguages must be an integer between 1 and 5.");
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
    typeof brand.label !== "string" ||
    brand.label.length < 1 ||
    brand.label.length > 40
  ) {
    throw new Error("brand.label must contain between 1 and 40 characters.");
  }

  if (
    typeof brand.accent !== "string" ||
    !HEX_COLOR_PATTERN.test(brand.accent)
  ) {
    throw new Error("brand.accent must be a six-digit hexadecimal color.");
  }

  return /** @type {TrackerConfig} */ ({
    username: config.username,
    displayName: config.displayName.trim(),
    periodDays: config.periodDays,
    maxLanguages: config.maxLanguages,
    excludedRepositories: [...new Set(config.excludedRepositories)],
    brand: {
      label: brand.label.trim(),
      accent: brand.accent.toLowerCase(),
    },
  });
}
