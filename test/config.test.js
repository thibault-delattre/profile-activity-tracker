import assert from "node:assert/strict";
import test from "node:test";
import { validateConfig } from "../src/config.js";

const validConfig = {
  username: "example-user",
  introduction: "I build reliable software and thoughtful products.",
  about: "I care about useful products and want to keep learning.",
  additionalUsernames: ["example-work"],
  excludedRepositories: ["profile"],
  brand: {
    accent: "#2f81f7",
  },
};

test("validateConfig accepts and normalizes a valid configuration", () => {
  const config = validateConfig(validConfig);

  assert.equal(config.username, "example-user");
  assert.equal(
    config.introduction,
    "I build reliable software and thoughtful products.",
  );
  assert.equal(
    config.about,
    "I care about useful products and want to keep learning.",
  );
  assert.deepEqual(config.additionalUsernames, ["example-work"]);
  assert.equal(config.brand.accent, "#2f81f7");
  assert.deepEqual(config.excludedRepositories, ["profile"]);
});

test("validateConfig rejects malformed GitHub usernames", () => {
  assert.throws(
    () => validateConfig({ ...validConfig, username: "-invalid-" }),
    /valid GitHub username/,
  );
});

test("validateConfig rejects duplicate account usernames", () => {
  assert.throws(
    () =>
      validateConfig({
        ...validConfig,
        additionalUsernames: ["EXAMPLE-USER"],
      }),
    /cannot contain the primary username/,
  );
});

test("validateConfig rejects an empty introduction", () => {
  assert.throws(
    () => validateConfig({ ...validConfig, introduction: " " }),
    /introduction must contain/,
  );
});

test("validateConfig rejects an empty about paragraph", () => {
  assert.throws(
    () => validateConfig({ ...validConfig, about: " " }),
    /about must contain/,
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
