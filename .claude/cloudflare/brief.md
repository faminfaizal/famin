# Cloudflare Platform Brief

**Last refreshed:** 2026-08-26
**Refresh command:** `/cloudflare-refresh` (or ask the `cloudflare` agent to "refresh the brief")

This file is the shared source of truth for the `cloudflare`, `frontend`, and `backend`
agents. Model training cutoffs lag reality; **this file wins over model memory.** If a fact
here conflicts with what an agent "remembers" about Cloudflare, the file is correct.

---

## Source access note

`www.cloudflare.com` and `www.threads.com/@cloudflare` are **blocked by this environment's
egress policy** — direct page fetches return `EGRESS_BLOCKED`. The facts below were
gathered via web search over `blog.cloudflare.com` and `developers.cloudflare.com`, which
remain reachable through search. Do not attempt to route around the block; if a refresh
needs the marketing site or Threads directly, report the blocked host instead.

---

## The one rule that changes the most decisions

**Build new things on Workers, not Pages.** Pages keeps working, but new features and
optimizations land on Workers only. A static site is a Worker with `assets.directory`
pointed at the build output and no script at all.

---

## Platform facts (verified 2026-08-26)

### Compatibility dates
- `compatibility_date` of **2026-08-04 or later** enables `nodejs_compat` **and**
  `nodejs_compat_v2` automatically. Do not add the flags — Wrangler, Miniflare, the Vite
  plugin, and the Workers Vitest plugin ignore them as redundant at that date or later.
- Older dates still need `nodejs_compat` spelled out for Node API support.

### Static assets
- `assets.directory` points at build output (e.g. `./dist/`). Purely static → no Worker
  script needed at all.
- `_headers` and `_redirects` are natively supported; put them in the asset directory.
- `.assetsignore` excludes files from upload (Workers does not auto-exclude `node_modules`
  / `.git` the way Pages did).
- Migrating an "advanced mode" `_worker.js` from Pages: move it out of the asset directory
  first, or it gets uploaded as an asset.

### Local development
- The **Cloudflare Vite plugin** needs zero config — it finds `wrangler.jsonc`,
  `wrangler.json`, or `wrangler.toml` at the project root.
- **Remote bindings are GA** in Wrangler, Vite, and Vitest (no experimental flag). Local
  code can hit deployed R2 buckets, D1 databases, and other real resources — test against
  real data without deploying each iteration.
- `wrangler dev` emits **structured traces for every local request**, so a failure can be
  pinpointed without deploying. Read these before guessing at a bug.

### Observability
- **Workers automatic tracing** is in open beta — export to any OpenTelemetry-compatible
  provider, no code changes.
- Setting `observability` with `traces` enabled in Wrangler config turns Workers Tracing on
  by default.

### Security
- **Access for Workers** (2026-08-14): attach an Access policy to the *Worker itself*, and
  it applies to every associated domain **and preview URL**, surviving route/domain
  changes. There is also an account-wide "all Workers private by default" mode with
  per-Worker bypass.
- Gateway can detect **MCP traffic** by protocol-level heuristics — finds shadow MCP, can
  enforce Portal-only access.
- Bot mitigation moved from point-in-time scoring to **continuous trust evaluation**.
- **Post-quantum authentication to origins** is supported.

### Networking
- Workers and Containers accept **inbound TCP** via Spectrum, with direct socket forwarding
  to Durable Objects and Containers.
- Full-duplex **gRPC** works in Workers, including automatic gRPC ↔ gRPC-web translation.
- **Direct TCP to databases** from a Worker, including PostgreSQL via the `pg` driver.
- Native integrations for **Neon, PlanetScale, and Supabase** auto-create the connection
  string and store it as a Worker Secret.

### Storage and state
- **Durable Objects** combine compute and storage in one addressable object — the right
  primitive for real-time chat, collaboration, coordination, and per-entity state.
- **Durable Object Facets** let Dynamic Workers give each generated app its own isolated
  SQLite database.
- **D1** is the serverless SQL database; query from a Worker or the API.

### AI
- **Agents Week ran 2026-08-04 to 2026-08-10.** Headline items:
  - **Cloudflare OS** — open-source platform for building apps and automating work — plus
    the **Agent Development Lifecycle**.
  - Preview of the **next edition of the Agents SDK**: the runtime supplies the `Agent`
    class, state, sessions, routing, WebSockets, scheduling, fibers, and observability;
    tools supply browser automation, sandboxed code execution, AI Search, MCP tools, and
    payments.
- **AI Gateway and Workers AI are unified into one control plane** — shared observability,
  billing, and dynamic routing across managed GPUs and external providers.
- **AI Search** — point it at your files/site, no primitives to stitch together.
- Workers AI supports **JSON mode** for structured output.
- `@cf/moonshotai/kimi-k2.6` — tool-calling and vision model for agentic and coding work.
- **Cloudflare Radar Researcher** — plain-language exploration of global Internet trends,
  itself built entirely on the Developer Platform.

---

## Sources

- https://blog.cloudflare.com/agents-week-review-august-2026/
- https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/
- https://blog.cloudflare.com/workers-tracing-now-in-open-beta/
- https://blog.cloudflare.com/grpc-workers/
- https://blog.cloudflare.com/durable-object-facets-dynamic-workers/
- https://blog.cloudflare.com/build-ai-agents-on-cloudflare/
- https://blog.cloudflare.com/post-quantum-authentication-to-origins/
- https://developers.cloudflare.com/changelog/post/2026-08-14-workers-access/
- https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/
- https://developers.cloudflare.com/workers/configuration/compatibility-flags/
- https://developers.cloudflare.com/workers/vite-plugin/get-started/
- https://developers.cloudflare.com/agents/
- https://developers.cloudflare.com/durable-objects/
