# Health Hub

A minimal **peer agent site** for the [Open Agentic Web](https://worldwideagenticweb.org/) protocol. It publishes a single agent definition — `who_benchmark_advisor` — so that any compliant browser agent runtime can discover it from a second origin and delegate to it locally.

**English is the primary documentation.** [中文版 README](README-zh.md) · [MIT License](LICENSE)

## What this site actually is

- **Three static files**: an agent manifest, a network definition, and a landing page.
- **No backend, no LLM, no database.** The agent is a JSON object (instructions + parameter schema). The calling site's runtime executes it in the *user's own browser*, with the *user's own API key*.
- **No data collection.** Statistics sent in a delegation request are used for that one response and are never stored.

The `server.js` kept in this repo is only for **local development** (a tiny static server with CORS headers). On GitHub Pages it is unnecessary — Pages serves static files with `Access-Control-Allow-Origin: *` and HTTPS out of the box.

## The agent: `who_benchmark_advisor`

Receives statistics produced by another site's data analyst and compares them against authoritative health guidelines.

| Input | Type | Description |
|---|---|---|
| `metric` | enum | `sleep` / `steps` / `energy` / `walking_speed` / `headphone_db` |
| `summary` | string | Analyst's conclusion, including the data window and units |
| `stats` | object | `{ "avg": 7.2, "max": 8.5, "min": 5.1 }` (English keys are a cross-site contract) |

| Guideline | Benchmark |
|---|---|
| Sleep | 7–9 hours per night for adults |
| Headphone volume | ≤ 80 dB for long-term exposure (WHO) |
| Steps | ~7,000–10,000 per day |
| Active energy | 150–300 kcal/day (rough reference for ≥150 min/week moderate activity; varies widely by person) |
| Walking speed | 1.2–1.4 m/s for healthy adults; < 1.0 m/s suggests weaker mobility |

Output is a single JSON object: `{"verdict": "达标|需注意|超标", "advice": "2–3 specific, actionable sentences"}`.

The agent is explicitly instructed to treat `stats` as a **window summary** (not a single day), to prefer the units stated in `summary` when they conflict with defaults, and to admit when a metric cannot be evaluated instead of inventing a benchmark.

## Protocol files

| Path | Purpose |
|---|---|
| `.well-known/agent-manifest.json` | Site entry point: name, entry agent, and a **relative** `hocon` pointer |
| `.well-known/agents.network.json` | Agent definitions (schema + instructions) |
| `index.html` | Human-readable landing page |

Both files are public GET with CORS. `hocon` is deliberately relative to the manifest's directory so the site works under any subpath (e.g. `https://<user>.github.io/health-hub/.well-known/...`).

## Deployment

Any static host with HTTPS works. The simplest path is GitHub Pages:

1. Create a repository (e.g. `health-hub`) and push this directory's contents to `main` — including the hidden `.well-known/` folder.
2. In the repository, open **Settings → Pages → Build and deployment → Source → Deploy from a branch → main / root**. Pages serves it at `https://<user>.github.io/health-hub/`.
3. Verify both JSON files return HTTP 200 and carry `Access-Control-Allow-Origin: *`.
4. In a compatible runtime (e.g. [LifeLens](https://github.com/heminhua-pro/LifeLens)), add `https://<user>.github.io/health-hub/.well-known/agent-manifest.json` as a peer site and approve it. The advisor will then appear as a delegable agent.

No build step, no environment variables, no secrets.

## Local development

```bash
node server.js          # http://localhost:5188, with CORS headers
# or
python -m http.server 5188
```

Point a peer link at `http://localhost:5188/.well-known/agent-manifest.json` to test delegation locally. Browsers treat localhost as a secure context, so HTTPS is not required here.

## License

MIT — see [LICENSE](LICENSE).
