# Security

## Data and permissions

The scheduled workflow requests only `contents: write`, which it needs to
commit generated SVG and JSON files. The built-in, short-lived `GITHUB_TOKEN`
is sent only to GitHub's GraphQL endpoint.

The generator processes public GitHub data by default. Do not add a personal
access token unless private statistics are deliberately required. If one is
used, store it as an Actions secret, grant the minimum repository access, and
never place it in configuration or generated files.

Repository names and other values returned by the API are XML-escaped before
being included in SVG output. The cards contain no scripts, remote fonts,
external resources, or `foreignObject` elements.

## Reporting a vulnerability

Please report a vulnerability privately through GitHub's security advisory
interface. Do not include tokens, private repository names, or other sensitive
data in a public issue.
