# Roadmap UI (interactive)

Interactive HTML page for the **Roadmap / Backlog** in [CHANGELOG.md](../../CHANGELOG.md#roadmap--backlog).

## Open

```powershell
start docs/roadmap/index.html
```

## Structure

| File | Description |
| --- | --- |
| `index.html` | Layout |
| `roadmap.css` | Styling (light/dark) |
| `roadmap-data.js` | **Data** — sync with CHANGELOG backlog (`window.NSSM_ROADMAP`) |
| `roadmap-app.js` | Timeline, ticks, search, export |

Completion ticks are stored in **localStorage** (browser only); not committed. Export JSON via the **Export** button.

## When updating the backlog

**Always edit both:**

1. `CHANGELOG.md` → `### Roadmap / Backlog`
2. `docs/roadmap/roadmap-data.js`

Cursor rule: [`.cursor/rules/roadmap-backlog-sync.mdc`](../../.cursor/rules/roadmap-backlog-sync.mdc).

### Add a new version

- Add `#### [x.y.z]` block in CHANGELOG.
- Add object in `NSSM_ROADMAP.versions` + update `meta.chain`.
- Extend `releaseChecklist` if there are new release validation criteria.

### Close a task

- Tick on the UI (local) or `- [x]` in CHANGELOG when reviewing.
- On release: move content to **Added** for that version; remove from backlog + `roadmap-data.js`.

### Shipped releases

- Update `NSSM_ROADMAP.shippedReleases` (newest first) + `released` / `meta.currentRelease`.
- `releaseNotes`: HTML path (e.g. `../release/2.25/index.html`); `null` → CHANGELOG link only.
- Sidebar **Shipped**, header pills, and footer render from `shippedReleases`.

## Themes

`build` · `ci` · `compat` · `service` · `quality` · `docs` — colors in `roadmap.css`, glyphs in `themeMeta`.
