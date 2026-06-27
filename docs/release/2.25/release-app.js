/* NSSM docs — Public Domain. */

(function () {
  const data = window.NSSM_RELEASE_225;

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderNav() {
    document.getElementById("nav-sections").innerHTML = data.nav
      .map((n) => `<a href="#${n.id}" class="nav-link" data-section="${n.id}">${esc(n.label)}</a>`)
      .join("");
  }

  function renderHero() {
    document.getElementById("hero-version").textContent = data.meta.version;
    document.getElementById("hero-date").textContent = `${data.meta.date} · ${data.meta.tagline}`;
    document.getElementById("hero-summary").textContent = data.meta.summary;
    document.getElementById("hero-stats").innerHTML = data.meta.stats
      .map((s) => `<div class="stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`)
      .join("");
    document.getElementById("component-cards").innerHTML = data.components
      .map(
        (c) => `<div class="svc" style="--c:${c.color}">
          <div class="svc-name">${esc(c.name)}</div>
          <div class="svc-port">${esc(c.file)}</div>
          <p class="svc-role">${esc(c.role)}</p>
        </div>`,
      )
      .join("");
  }

  function renderArchitecture() {
    document.getElementById("arch-diagram").innerHTML = `<svg class="flow-svg" viewBox="0 0 680 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Runtime architecture">
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--muted)"/></marker>
      </defs>
      <rect x="240" y="12" width="200" height="40" rx="8" fill="var(--bg-elevated)" stroke="var(--border-strong)"/>
      <text x="340" y="32" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600">Service Control Manager</text>
      <text x="340" y="46" text-anchor="middle" fill="var(--muted)" font-size="9">start / stop / control</text>
      <line x1="340" y1="52" x2="340" y2="92" stroke="var(--muted)" marker-end="url(#arr)"/>
      <rect x="200" y="92" width="280" height="56" rx="10" fill="color-mix(in srgb, var(--primary) 8%, var(--bg-elevated))" stroke="var(--primary)" stroke-width="1.6"/>
      <text x="340" y="116" text-anchor="middle" fill="var(--primary)" font-size="13" font-weight="700">nssm.exe — service host</text>
      <text x="340" y="134" text-anchor="middle" fill="var(--muted)" font-size="9">service_main · monitor · restart · I/O · hooks</text>
      <line x1="340" y1="148" x2="340" y2="186" stroke="var(--muted)" marker-end="url(#arr)"/>
      <rect x="220" y="186" width="240" height="40" rx="8" fill="var(--bg-elevated)" stroke="var(--ui)" stroke-width="1.5"/>
      <text x="340" y="206" text-anchor="middle" fill="var(--ui)" font-size="12" font-weight="700">Managed application</text>
      <text x="340" y="220" text-anchor="middle" fill="var(--muted)" font-size="9">Application + AppParameters</text>
      <rect x="20" y="92" width="150" height="56" rx="10" fill="var(--bg-elevated)" stroke="var(--api)" stroke-width="1.5"/>
      <text x="95" y="114" text-anchor="middle" fill="var(--api)" font-size="12" font-weight="700">CLI / GUI</text>
      <text x="95" y="132" text-anchor="middle" fill="var(--muted)" font-size="9">install · edit · get/set</text>
      <line x1="170" y1="120" x2="200" y2="120" stroke="var(--muted)" stroke-dasharray="4 3" marker-end="url(#arr)"/>
      <rect x="510" y="92" width="150" height="56" rx="10" fill="var(--bg-elevated)" stroke="var(--border-strong)"/>
      <text x="585" y="114" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600">Registry</text>
      <text x="585" y="132" text-anchor="middle" fill="var(--muted)" font-size="9">Parameters\\App*</text>
      <line x1="510" y1="120" x2="480" y2="120" stroke="var(--muted)" stroke-dasharray="4 3" marker-end="url(#arr)"/>
    </svg>`;

    document.getElementById("stop-diagram").innerHTML = `<svg class="flow-svg" viewBox="0 0 720 96" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stop sequence">
      <defs><marker id="arr2" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--muted)"/></marker></defs>
      ${["Control-C", "WM_CLOSE", "WM_QUIT", "TerminateProcess"].map((l, i) => {
        const x = 12 + i * 178;
        const w = i === 3 ? 160 : 150;
        return `<rect x="${x}" y="34" width="${w}" height="40" rx="8" fill="var(--bg-elevated)" stroke="${i === 3 ? "var(--released)" : "var(--border-strong)"}" stroke-width="1.5"/>
          <text x="${x + w / 2}" y="59" text-anchor="middle" fill="${i === 3 ? "var(--released)" : "var(--text)"}" font-size="11" font-weight="600">${l}</text>`;
      }).join("")}
      <line x1="162" y1="54" x2="190" y2="54" stroke="var(--muted)" marker-end="url(#arr2)"/>
      <line x1="340" y1="54" x2="368" y2="54" stroke="var(--muted)" marker-end="url(#arr2)"/>
      <line x1="518" y1="54" x2="546" y2="54" stroke="var(--muted)" marker-end="url(#arr2)"/>
      <text x="360" y="22" text-anchor="middle" fill="var(--muted)" font-size="10">Stop sequence — each step has a timeout; skip via AppStopMethodSkip</text>
    </svg>`;
  }

  function renderCommands() {
    document.getElementById("command-grid").innerHTML = data.commands
      .map(
        (c) => `<div class="route-card" data-search="${esc(c.cmd + " " + c.desc)}">
          <div class="route-path">${esc(c.cmd)}</div>
          <p class="route-desc">${esc(c.desc)}</p>
        </div>`,
      )
      .join("");
  }

  function renderRegistry() {
    document.getElementById("registry-content").innerHTML = data.registryGroups
      .map(
        (g) => `<div class="project-group">
          <h4>${esc(g.group)}</h4>
          <div class="rules-grid">
            ${g.params.map((p) => `<span class="rule-chip" data-search="${esc(p + " " + g.group)}">${esc(p)}</span>`).join("")}
          </div>
        </div>`,
      )
      .join("");
  }

  function renderFeatures() {
    document.getElementById("feature-list").innerHTML = data.features
      .map((f) => `<li data-search="${esc(f)}">${esc(f)}</li>`)
      .join("");
  }

  function renderModules() {
    document.getElementById("module-table").innerHTML = `
      <thead><tr><th>File</th><th>Role</th></tr></thead>
      <tbody>
        ${data.modules
          .map(
            (m) => `<tr data-search="${esc(m.name + " " + m.role)}">
              <td><strong>${esc(m.name)}</strong></td>
              <td>${esc(m.role)}</td>
            </tr>`,
          )
          .join("")}
      </tbody>`;
  }

  function renderBuild() {
    document.getElementById("build-steps").innerHTML = data.buildSteps
      .map(
        (b) => `<div class="test-row" data-search="${esc(b.step + " " + b.detail)}">
          <strong>${esc(b.step)}</strong>
          <span>${esc(b.detail)}</span>
        </div>`,
      )
      .join("");
    document.getElementById("platform-chips").innerHTML = data.platforms
      .map((p) => `<span class="stack-chip${p.status === "plan" ? " plan" : ""}">${esc(p.name)}</span>`)
      .join("");
    document.getElementById("stack-table").innerHTML = data.stack
      .map((s) => `<tr><th>${esc(s.name)}</th><td>${esc(s.version)}</td></tr>`)
      .join("");
  }

  function renderCredits() {
    document.getElementById("credits-list").innerHTML = data.credits
      .map((c) => `<li data-search="${esc(c)}">${esc(c)}</li>`)
      .join("");
  }

  function applySearch() {
    const q = document.getElementById("search").value.trim().toLowerCase();
    document.querySelectorAll("[data-search]").forEach((el) => {
      const hay = el.getAttribute("data-search").toLowerCase();
      el.classList.toggle("hidden", q.length > 0 && !hay.includes(q));
    });
    document.querySelectorAll(".section").forEach((sec) => {
      if (!q) {
        sec.classList.remove("hidden-by-search");
        return;
      }
      const text = sec.textContent.toLowerCase();
      sec.classList.toggle("hidden-by-search", !text.includes(q));
    });
  }

  function setupScrollSpy() {
    const links = document.querySelectorAll(".nav-link[data-section]");
    const sections = data.nav.map((n) => document.getElementById(n.id)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!vis) return;
        links.forEach((l) => l.classList.toggle("active", l.dataset.section === vis.target.id));
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.2] },
    );
    sections.forEach((s) => obs.observe(s));
  }

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
      "nssm-release-theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }

  function init() {
    if (localStorage.getItem("nssm-release-theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
    renderNav();
    renderHero();
    renderArchitecture();
    renderCommands();
    renderRegistry();
    renderFeatures();
    renderModules();
    renderBuild();
    renderCredits();
    setupScrollSpy();

    document.getElementById("search").addEventListener("input", applySearch);
    document.getElementById("btn-theme").addEventListener("click", toggleTheme);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
