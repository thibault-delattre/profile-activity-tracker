import assert from "node:assert/strict";
import test from "node:test";
import { validateConfig } from "../src/config.js";

const validConfig = {
  username: "thibault-delattre",
  displayName: "Thibault Delattre",
  excludedRepositories: ["profile"],
  brand: {
    accent: "#2f81f7",
  },
};

test("validateConfig accepts and normalizes a valid configuration", () => {
  const config = validateConfig(validConfig);

  assert.equal(config.username, "thibault-delattre");
  assert.equal(config.brand.accent, "#2f81f7");
  assert.deepEqual(config.excludedRepositories, ["profile"]);
});

test("validateConfig rejects malformed GitHub usernames", () => {
  assert.throws(
    () => validateConfig({ ...validConfig, username: "-invalid-" }),
    /valid GitHub username/,
  );
});

test("validateConfig rejects unsafe color values", () => {
  assert.throws(
    () =>
      validateConfig({
        ...validConfig,
        brand: { ...validConfig.brand, accent: "url(javascript:alert(1))" },
      }),
    /hexadecimal color/,
  );
});
