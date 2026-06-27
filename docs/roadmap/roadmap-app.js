/* NSSM docs — Public Domain. */

(function () {
  const STORAGE_KEY = "nssm-roadmap-checks-v1";
  const RING_C = 326.7;
  const data = window.NSSM_ROADMAP;

  const archIcons = { cli: "⌗", host: "⚙", gui: "▤" };

  let checks = loadChecks();
  // Seed tasks marked done in data so the published roadmap reflects shipped
  // work without relying on each viewer's local ticks (not persisted).
  for (const v of data.versions)
    for (const tr of v.tracks)
      for (const it of tr.items)
        if (it.done && checks[it.id] === undefined) checks[it.id] = true;

  let versionFilter = "all";
  let themeFilter = "all";
  let searchQuery = "";
  let pendingOnly = false;

  function loadChecks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveChecks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  }

  function allTasks() {
    const tasks = [];
    for (const v of data.versions) {
      for (const t of v.tracks) {
        for (const item of t.items) {
          tasks.push({ ...item, versionId: v.id, theme: v.theme });
        }
      }
    }
    return tasks;
  }

  function countProgress(versionId) {
    const tasks = allTasks().filter((t) => t.versionId === versionId);
    const done = tasks.filter((t) => checks[t.id]).length;
    return { done, total: tasks.length };
  }

  function totalProgress() {
    const tasks = allTasks();
    const done = tasks.filter((t) => checks[t.id]).length;
    return { done, total: tasks.length };
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function pct(done, total) {
    return total ? Math.round((done / total) * 100) : 0;
  }

  function primaryReleaseLink(r) {
    return r.releaseNotes || r.changelog;
  }

  function isShippedVersion(id) {
    return data.shippedReleases.some((r) => r.version === id);
  }

  function matchesSearch(item) {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const hay = [item.title, item.detail, item.validate, item.tag || ""].join(" ").toLowerCase();
    return hay.includes(q);
  }

  function taskVisible(item, versionId) {
    if (!matchesSearch(item)) return false;
    if (pendingOnly && checks[item.id]) return false;
    if (versionFilter !== "all" && versionFilter !== versionId) return false;
    if (themeFilter !== "all") {
      const v = data.versions.find((x) => x.id === versionId);
      if (!v || v.theme !== themeFilter) return false;
    }
    return true;
  }

  function renderPipeline() {
    const el = document.getElementById("pipeline");
    const rows = [];
    const shippedNodes = [...data.shippedReleases].reverse().map((r) => ({
      id: r.version,
      ver: r.version,
      lbl: r.current ? "Latest" : "Shipped",
      shipped: true,
      href: primaryReleaseLink(r),
    }));
    const nodes = [
      ...shippedNodes,
      ...data.versions.map((v) => ({
        id: v.id,
        ver: v.id,
        lbl: v.subtitle.split(" ")[0],
        theme: v.theme,
      })),
    ];

    for (let i = 0; i < nodes.length; i += 4) {
      const chunk = nodes.slice(i, i + 4);
      const row = chunk
        .map((n, j) => {
          const arrow = j < chunk.length - 1 ? '<span class="pipe-arrow">→</span>' : "";
          const cls = [
            "pipe-node",
            n.shipped ? "shipped" : `theme-${n.theme}`,
            versionFilter === n.id ? "active" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const inner = `<span class="pipe-ver">${esc(n.ver)}</span><span class="pipe-lbl">${esc(n.lbl)}</span>`;
          const node = n.href
            ? `<a href="${esc(n.href)}" class="${cls}">${inner}</a>`
            : `<button type="button" class="${cls}" data-filter="${esc(n.id)}">${inner}</button>`;
          return `${node}${arrow}`;
        })
        .join("");
      rows.push(`<div class="pipe-row">${row}</div>`);
    }
    el.innerHTML = rows.join("");
    el.querySelectorAll(".pipe-node[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => setVersionFilter(btn.dataset.filter));
    });
  }

  function renderVersionGrid() {
    const el = document.getElementById("version-grid");
    el.innerHTML = data.versions
      .map((v) => {
        const p = countProgress(v.id);
        const pc = pct(p.done, p.total);
        return `<a href="#v-${v.id}" class="v-preview theme-${v.theme}" data-version="${v.id}">
          <div class="v-preview-top">
            <span class="v-preview-ver">${esc(v.id)}</span>
            <span class="v-preview-pct">${p.done}/${p.total}</span>
          </div>
          <div class="v-preview-title">${esc(v.title)}</div>
          <div class="v-preview-bar"><span style="width:${pc}%"></span></div>
        </a>`;
      })
      .join("");
    el.querySelectorAll(".v-preview").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        setVersionFilter(a.dataset.version);
        document.getElementById(`v-${a.dataset.version}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function renderThemeChips() {
    const el = document.getElementById("theme-chips");
    const chips = [
      `<button type="button" class="chip-filter${themeFilter === "all" ? " active" : ""}" data-theme="all">All</button>`,
    ];
    for (const [key, meta] of Object.entries(data.themeMeta)) {
      chips.push(
        `<button type="button" class="chip-filter theme-${key}${themeFilter === key ? " active" : ""}" data-theme="${key}" style="--v:var(--${key})">${esc(meta.glyph)} ${esc(meta.label)}</button>`,
      );
    }
    el.innerHTML = chips.join("");
    el.querySelectorAll(".chip-filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        themeFilter = btn.dataset.theme;
        renderThemeChips();
        applyFilters();
      });
    });
  }

  function renderNav() {
    const el = document.getElementById("nav-versions");
    el.innerHTML = data.versions
      .map((v) => {
        const p = countProgress(v.id);
        const pc = pct(p.done, p.total);
        const meta = data.themeMeta[v.theme] || {};
        return `<a href="#v-${v.id}" class="nav-link theme-${v.theme}" data-version="${v.id}">
          <div class="nav-link-row">
            <span class="nav-glyph">${esc(meta.glyph || "•")}</span>
            <span>${esc(v.id)}</span>
            <span class="nav-progress">${p.done}/${p.total}</span>
          </div>
          <div class="mini-bar"><span style="width:${pc}%"></span></div>
        </a>`;
      })
      .join("");
  }

  function renderFlowCanvas() {
    const el = document.getElementById("flow-canvas");
    el.innerHTML = `<svg class="flow-svg" viewBox="0 0 880 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Service lifecycle diagram">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--muted)" />
        </marker>
      </defs>

      <text x="20" y="26" fill="var(--muted)" font-size="11" font-weight="700">STOP SEQUENCE (2.29)</text>
      <rect x="20" y="38" width="120" height="44" rx="8" fill="var(--bg-elevated)" stroke="var(--service)" stroke-width="1.5"/>
      <text x="80" y="58" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600">App running</text>
      <text x="80" y="72" text-anchor="middle" fill="var(--muted)" font-size="9">monitored</text>
      <line x1="140" y1="60" x2="180" y2="60" stroke="var(--muted)" marker-end="url(#arrow)"/>
      <rect x="180" y="38" width="120" height="44" rx="8" fill="var(--bg-elevated)" stroke="var(--service)" stroke-width="1.5"/>
      <text x="240" y="58" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600">Control-C</text>
      <text x="240" y="72" text-anchor="middle" fill="var(--muted)" font-size="9">console event</text>
      <line x1="300" y1="60" x2="340" y2="60" stroke="var(--muted)" marker-end="url(#arrow)"/>
      <rect x="340" y="38" width="120" height="44" rx="8" fill="var(--bg-elevated)" stroke="var(--service)" stroke-width="1.5"/>
      <text x="400" y="58" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600">WM_CLOSE</text>
      <text x="400" y="72" text-anchor="middle" fill="var(--muted)" font-size="9">→ WM_QUIT</text>
      <line x1="460" y1="60" x2="500" y2="60" stroke="var(--muted)" marker-end="url(#arrow)"/>
      <rect x="500" y="38" width="150" height="44" rx="8" fill="color-mix(in srgb, var(--quality) 12%, var(--bg-elevated))" stroke="var(--quality)" stroke-width="1.5"/>
      <text x="575" y="58" text-anchor="middle" fill="var(--quality)" font-size="11" font-weight="700">TerminateProcess</text>
      <text x="575" y="72" text-anchor="middle" fill="var(--muted)" font-size="9">process tree</text>

      <text x="20" y="130" fill="var(--muted)" font-size="11" font-weight="700">EXIT HANDLING (AppExit)</text>
      <rect x="20" y="142" width="120" height="44" rx="8" fill="var(--bg-elevated)" stroke="var(--build)" stroke-width="1.5"/>
      <text x="80" y="162" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600">App exits</text>
      <text x="80" y="176" text-anchor="middle" fill="var(--muted)" font-size="9">exit code n</text>
      <line x1="140" y1="164" x2="180" y2="164" stroke="var(--muted)" marker-end="url(#arrow)"/>
      <rect x="180" y="142" width="130" height="44" rx="8" fill="var(--bg-elevated)" stroke="var(--build)" stroke-width="1.5"/>
      <text x="245" y="162" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600">AppExit lookup</text>
      <text x="245" y="176" text-anchor="middle" fill="var(--muted)" font-size="9">+ throttle</text>
      <line x1="310" y1="164" x2="350" y2="164" stroke="var(--muted)" marker-end="url(#arrow)"/>
      <rect x="350" y="142" width="300" height="44" rx="8" fill="color-mix(in srgb, var(--build) 8%, var(--bg-elevated))" stroke="var(--build)" stroke-width="1.5"/>
      <text x="500" y="162" text-anchor="middle" fill="var(--build)" font-size="11" font-weight="700">Restart · Ignore · Exit · Suicide</text>
      <text x="500" y="176" text-anchor="middle" fill="var(--muted)" font-size="9">per registry AppExit\\&lt;n&gt;</text>

      <rect x="680" y="92" width="180" height="84" rx="10" fill="var(--bg)" stroke="var(--border-strong)" stroke-width="1" stroke-dasharray="4 3"/>
      <text x="770" y="118" text-anchor="middle" fill="var(--muted)" font-size="10" font-weight="700">FOUNDATION</text>
      <text x="770" y="140" text-anchor="middle" fill="var(--text-secondary)" font-size="10">Build 2.26 · CI 2.27</text>
      <text x="770" y="158" text-anchor="middle" fill="var(--text-secondary)" font-size="10">Compat 2.28 · Docs 2.31</text>
    </svg>`;
  }

  function renderArchitecture() {
    document.getElementById("arch-grid").innerHTML = data.architecture.rows
      .map(
        (r) => `<div class="arch-card ${r.icon === "host" ? "host" : ""}">
        <div class="arch-icon">${archIcons[r.icon] || "◆"}</div>
        <h3>${esc(r.component)}</h3>
        <p>${esc(r.when)}</p>
        <p class="ex">${esc(r.example)}</p>
      </div>`,
      )
      .join("");
  }

  function renderShippedNav() {
    document.getElementById("nav-shipped").innerHTML = data.shippedReleases
      .map(
        (r) => `<a href="${esc(primaryReleaseLink(r))}" class="nav-link nav-shipped${r.current ? " current" : ""}">
          <div class="nav-link-row">
            <span class="nav-glyph">✓</span>
            <span>${esc(r.version)}</span>
            ${r.current ? '<span class="nav-badge">latest</span>' : ""}
          </div>
        </a>`,
      )
      .join("");
  }

  function renderHeaderShipped() {
    document.getElementById("header-shipped").innerHTML = data.shippedReleases
      .map(
        (r) =>
          `<a href="${esc(primaryReleaseLink(r))}" class="shipped-pill${r.current ? " current" : ""}" title="${esc(r.summary)}">${esc(r.version)}</a>`,
      )
      .join("");
  }

  function renderFooterShipped() {
    document.getElementById("footer-shipped").innerHTML = data.shippedReleases
      .map((r) => `<a href="${esc(primaryReleaseLink(r))}">${esc(r.version)}</a>`)
      .join('<span>·</span>');
  }

  function renderShippedGrid() {
    document.getElementById("released-grid").innerHTML = data.shippedReleases
      .map(
        (r) => `<article class="released-card${r.current ? " latest" : ""}" id="shipped-${esc(r.version)}">
          <h2>✓ ${esc(r.version)}${r.current ? ' <span class="latest-badge">latest</span>' : ""}</h2>
          <p class="date">${esc(r.date)} · ${esc(r.label)}</p>
          <p class="released-summary">${esc(r.summary)}</p>
          <ul>${r.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
          <div class="released-actions">
            ${r.releaseNotes ? `<a class="btn btn-released" href="${esc(r.releaseNotes)}">Release notes</a>` : ""}
            <a class="btn btn-ghost-released" href="${esc(r.changelog)}">CHANGELOG</a>
          </div>
        </article>`,
      )
      .join("");
  }

  function renderReleased() {
    renderShippedGrid();
    renderShippedNav();
    renderHeaderShipped();
    renderFooterShipped();
  }

  function renderTask(item, versionId) {
    const done = !!checks[item.id];
    const hidden = !taskVisible(item, versionId) ? " hidden" : "";
    const hl = item.highlight ? " highlight" : "";
    const tagCls = item.tag ? ` tag-${item.tag}` : "";
    const tagHtml = item.tag
      ? `<div class="task-tags"><span class="task-tag">${esc(item.tag)}</span></div>`
      : "";
    return `
      <li class="task${done ? " done" : ""}${hidden}${hl}${tagCls}" data-id="${esc(item.id)}" data-version="${versionId}">
        <div class="task-head">
          <input type="checkbox" class="task-check" data-id="${esc(item.id)}" ${done ? "checked" : ""} aria-label="Done: ${esc(item.title)}" />
          <div class="task-body">
            ${tagHtml}
            <p class="task-title">${esc(item.title)}</p>
            <p class="task-detail">${esc(item.detail)}</p>
            <div class="task-validate">
              <span class="task-validate-icon">✓</span>
              <div><strong>Validate</strong>${esc(item.validate)}</div>
            </div>
          </div>
        </div>
      </li>`;
  }

  function renderVersions() {
    const container = document.getElementById("versions");
    container.innerHTML = data.versions
      .map((v) => {
        const p = countProgress(v.id);
        const pc = pct(p.done, p.total);
        const tracksHtml = v.tracks
          .map((track) => {
            const visible = track.items.filter((item) => taskVisible(item, v.id)).length;
            return `
          <div class="track" data-track>
            <div class="track-head" role="button" tabindex="0" aria-expanded="true">
              <h4>${esc(track.name)}</h4>
              <span class="track-count">${visible}/${track.items.length}</span>
            </div>
            <ul class="task-list">
              ${track.items.map((item) => renderTask(item, v.id)).join("")}
            </ul>
          </div>`;
          })
          .join("");

        return `
        <section class="version-block theme-${v.theme}" id="v-${v.id}" data-version="${v.id}">
          <div class="version-head">
            <span class="version-badge">${esc(v.id)}</span>
            <h3>${esc(v.title)}</h3>
            <p class="goal">${esc(v.goal)}</p>
            <div class="version-meta">
              <span class="meta-chip">depends: ${esc(v.depends)}</span>
              <span class="meta-chip">${esc(v.icon)} ${esc(v.subtitle)}</span>
            </div>
          </div>
          ${v.principle ? `<p class="principle">${esc(v.principle)}</p>` : ""}
          <div class="progress-wrap">
            <div class="progress-header">
              <span>Version progress</span>
              <span>${p.done} / ${p.total} (${pc}%)</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${pc}%"></div></div>
          </div>
          ${tracksHtml}
        </section>`;
      })
      .join("");

    container.querySelectorAll(".task-check").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        checks[e.target.dataset.id] = e.target.checked;
        saveChecks();
        e.target.closest(".task")?.classList.toggle("done", e.target.checked);
        refreshAll();
      });
    });

    container.querySelectorAll(".track-head").forEach((head) => {
      const toggle = () => head.closest(".track").classList.toggle("collapsed");
      head.addEventListener("click", toggle);
      head.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  function renderChecklist() {
    const vers = data.versions.map((v) => v.id);
    const head = `<tr><th>Step</th>${vers.map((v) => `<th>${esc(v)}</th>`).join("")}</tr>`;
    const body = data.releaseChecklist
      .map(
        (row) => `<tr>
        <td>${esc(row.label)}</td>
        ${vers.map((v) => `<td>${row.versions.includes(v) ? '<span class="check-yes">✓</span>' : "—"}</td>`).join("")}
      </tr>`,
      )
      .join("");
    document.getElementById("check-table").innerHTML = head + body;
  }

  function updateRing(done, total) {
    const pc = pct(done, total);
    document.getElementById("ring-pct").textContent = `${pc}%`;
    const fill = document.getElementById("ring-fill");
    fill.style.strokeDashoffset = String(RING_C - (RING_C * pc) / 100);
  }

  function setVersionFilter(filter) {
    versionFilter = filter;
    renderPipeline();
    document.querySelectorAll(".version-block").forEach((block) => {
      const vid = block.dataset.version;
      const show = filter === "all" || filter === vid;
      block.classList.toggle("hidden", !show);
    });
    const releasedWrap = document.querySelector(".released-wrap");
    if (releasedWrap) {
      releasedWrap.style.display = filter === "all" || isShippedVersion(filter) ? "" : "none";
    }
    applyFilters();
    if (filter !== "all" && !isShippedVersion(filter)) {
      document.getElementById(`v-${filter}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function applyFilters() {
    searchQuery = document.getElementById("search").value.trim();
    pendingOnly = document.getElementById("pending-only").checked;
    document.querySelectorAll(".task").forEach((task) => {
      const item = allTasks().find((t) => t.id === task.dataset.id);
      if (item) task.classList.toggle("hidden", !taskVisible(item, task.dataset.version));
    });
    document.querySelectorAll(".version-block").forEach((block) => {
      if (versionFilter !== "all" && block.dataset.version !== versionFilter) return;
      const tasks = block.querySelectorAll(".task:not(.hidden)");
      block.classList.toggle("hidden", tasks.length === 0 && (searchQuery || pendingOnly || themeFilter !== "all"));
    });
    document.querySelectorAll(".track").forEach((track) => {
      const visible = track.querySelectorAll(".task:not(.hidden)").length;
      const total = track.querySelectorAll(".task").length;
      const count = track.querySelector(".track-count");
      if (count) count.textContent = `${visible}/${total}`;
    });
  }

  function refreshStats() {
    const t = totalProgress();
    document.getElementById("stat-done").textContent = t.done;
    document.getElementById("stat-total").textContent = t.total;
    document.getElementById("stat-versions").textContent = data.versions.length;
    updateRing(t.done, t.total);
    renderNav();
    document.querySelectorAll(".version-block").forEach((block) => {
      const p = countProgress(block.dataset.version);
      const pc = pct(p.done, p.total);
      const fill = block.querySelector(".progress-fill");
      const header = block.querySelector(".progress-header span:last-child");
      if (fill) fill.style.width = `${pc}%`;
      if (header) header.textContent = `${p.done} / ${p.total} (${pc}%)`;
    });
    renderVersionGrid();
  }

  function refreshAll() {
    refreshStats();
    applyFilters();
  }

  function setupScrollSpy() {
    const links = document.querySelectorAll(".nav-link[data-version]");
    const blocks = data.versions.map((v) => document.getElementById(`v-${v.id}`)).filter(Boolean);
    if (!blocks.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.dataset.version;
        links.forEach((l) => l.classList.toggle("active", l.dataset.version === id));
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    blocks.forEach((b) => obs.observe(b));
  }

  function exportState() {
    const blob = new Blob(
      [JSON.stringify({ checks, exportedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nssm-roadmap-progress.json";
    a.click();
  }

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
      "nssm-theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }

  function init() {
    // Initial theme is applied by a blocking <head> script (no flash); shared key "nssm-theme".
    document.getElementById("chain-text").textContent = data.meta.chain;
    renderReleased();
    renderPipeline();
    renderVersionGrid();
    renderThemeChips();
    renderNav();
    renderArchitecture();
    renderFlowCanvas();
    renderVersions();
    renderChecklist();
    refreshStats();
    setupScrollSpy();

    document.getElementById("search").addEventListener("input", applyFilters);
    document.getElementById("pending-only").addEventListener("change", applyFilters);
    document.getElementById("btn-theme").addEventListener("click", toggleTheme);
    document.getElementById("btn-export").addEventListener("click", exportState);
    document.getElementById("btn-all").addEventListener("click", () => setVersionFilter("all"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
