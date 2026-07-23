# Profile Activity Tracker

A distinctive, automatically updated GitHub activity card for
[@thibault-delattre](https://github.com/thibault-delattre).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./generated/activity-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./generated/activity-light.svg">
  <img alt="Thibault Delattre's automatically updated GitHub activity" src="./generated/activity-light.svg" width="100%">
</picture>

## What it tracks

The card presents a compact view of public GitHub work:

- contribution commits for this week, month, year, and all time;
- active days for the same four calendar periods;
- every language detected across owned, public, non-fork repositories.

It is generated as self-contained light and dark SVG files with a native,
continuously animated blue-white-red outline. There is no public server,
tracking script, analytics service, or runtime dependency.

## How it works

```text
Scheduled GitHub Action
        │
        ▼
GitHub GraphQL API
        │
        ▼
Calendar-period aggregation and repository exclusions
        │
        ▼
Pure, escaped SVG + transparent JSON summary
        │
        ▼
Commit only generated files that changed
```

The workflow runs every two hours at minute 17, can be launched manually, and
also runs when generator code or configuration changes. If GitHub's API is
unavailable, generation fails before replacing the last valid cards.

## Profile integration

Place this in the `README.md` of the
[`thibault-delattre/thibault-delattre`](https://github.com/thibault-delattre/thibault-delattre)
profile repository:

```html
<picture>
  <source
    media="(prefers-color-scheme: dark)"
    srcset="https://raw.githubusercontent.com/thibault-delattre/profile-activity-tracker/main/generated/activity-dark.svg"
  />
  <source
    media="(prefers-color-scheme: light)"
    srcset="https://raw.githubusercontent.com/thibault-delattre/profile-activity-tracker/main/generated/activity-light.svg"
  />
  <img
    alt="Thibault Delattre's automatically updated GitHub activity"
    src="https://raw.githubusercontent.com/thibault-delattre/profile-activity-tracker/main/generated/activity-light.svg"
    width="100%"
  />
</picture>
```

## Configuration

Edit [`config/profile.json`](./config/profile.json):

```json
{
  "username": "thibault-delattre",
  "excludedRepositories": ["thibault-delattre"],
  "brand": {
    "accent": "#2f81f7"
  }
}
```

Languages are ordered using the bytes reported by GitHub for eligible
repositories; this ordering is not a measure of proficiency. Add generated,
tutorial, archived, or otherwise unrepresentative repositories to
`excludedRepositories`.

Week means Monday through the current day in UTC. Month and year are calendar
periods. All-time commits and active days are calculated by collecting every
contribution year returned by GitHub. Commit totals follow GitHub's profile
contribution rules, so commits that do not qualify for the contribution graph
are not included.

## Local development

Node.js 22 or newer is required. There are no third-party packages to install.

```sh
npm test
npm run generate:placeholder
GH_TOKEN=your_token npm run generate
```

`GH_TOKEN` is required only for live generation. The committed workflow uses
GitHub's short-lived built-in token.

## Security and reliability

- Official Actions are pinned to immutable commit SHAs.
- Workflow permissions are limited to `contents: write`.
- API values are escaped before SVG rendering.
- SVGs contain no scripts, external resources, or remote fonts.
- Generation uses temporary files and atomic replacement.
- Tests cover configuration, date windows, calculations, escaping, and themes.

See [SECURITY.md](./SECURITY.md) for the token and disclosure policy.

## License

[MIT](./LICENSE)
