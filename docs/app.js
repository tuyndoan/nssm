/* NSSM docs -- Public Domain. Single-page hub: tab routing + inline rendering. */

(function () {
  "use strict";

  var REPO = "tuyndoan/nssm";
  var REL = window.NSSM_RELEASE_225 || null;
  var RM = window.NSSM_ROADMAP || null;
  var TABS = ["overview", "release", "roadmap", "download"];
  var rendered = {};

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }
  function el(id) { return document.getElementById(id); }

  /* ---------------- Tab routing ---------------- */
  function showTab(name, push) {
    if (TABS.indexOf(name) === -1) name = "overview";
    document.querySelectorAll(".tab").forEach(function (b) {
      b.classList.toggle("active", b.dataset.tab === name);
    });
    document.querySelectorAll(".tabpane").forEach(function (p) {
      p.classList.toggle("active", p.id === "pane-" + name);
    });
    var sel = el("tabs-select");
    if (sel) sel.value = name;
    if (push && location.hash !== "#" + name) {
      history.pushState(null, "", "#" + name);
    }
    if (name === "release") renderRelease();
    if (name === "roadmap") renderRoadmap();
    if (name === "download") renderDownload();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initRouting() {
    document.querySelectorAll(".tab").forEach(function (b) {
      b.addEventListener("click", function () { showTab(b.dataset.tab, true); });
    });
    document.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () { showTab(b.dataset.go, true); });
    });
    var sel = el("tabs-select");
    if (sel) sel.addEventListener("change", function () { showTab(sel.value, true); });
    var brand = document.querySelector(".brand");
    if (brand) brand.addEventListener("click", function (e) { e.preventDefault(); showTab("overview", true); });
    window.addEventListener("hashchange", function () {
      showTab((location.hash || "#overview").slice(1), false);
    });
  }

  /* ---------------- Release tab ---------------- */
  function renderRelease() {
    if (rendered.release) return;
    var pane = el("pane-release");
    if (!REL) { pane.innerHTML = stateMsg("Release data unavailable."); return; }
    var m = REL.meta;

    var html = "";
    html += '<div class="panel rel-hero">' +
      "<div>" +
        '<span class="rel-badge">' + esc(m.version) + "</span>" +
        '<p class="rel-date">' + esc(m.date) + " &middot; " + esc(m.tagline) + "</p>" +
        '<p class="rel-summary">' + esc(m.summary) + "</p>" +
      "</div>" +
      '<div class="stat-row">' + m.stats.map(function (s) {
        return '<div class="stat"><strong>' + esc(s.value) + "</strong><span>" + esc(s.label) + "</span></div>";
      }).join("") + "</div>" +
    "</div>";

    html += section("Runtime components", "Three roles cooperate to keep your app alive",
      '<div class="svc-grid">' + REL.components.map(function (c) {
        return '<div class="svc" style="--c:' + esc(c.color) + '">' +
          '<div class="svc-name">' + esc(c.name) + "</div>" +
          '<div class="svc-file">' + esc(c.file) + "</div>" +
          '<p class="svc-role">' + esc(c.role) + "</p></div>";
      }).join("") + "</div>");

    html += section("CLI commands", "Full functionality without the GUI",
      '<div class="route-grid" data-searchgroup>' + REL.commands.map(function (c) {
        return '<div class="route-card" data-search="' + esc(c.cmd + " " + c.desc) + '">' +
          '<div class="route-path">' + esc(c.cmd) + "</div>" +
          '<p class="route-desc">' + esc(c.desc) + "</p></div>";
      }).join("") + "</div>");

    html += section("Parameters (registry / get&middot;set)", "Under HKLM\\SYSTEM\\CurrentControlSet\\Services\\&lt;svc&gt;\\Parameters",
      '<div class="param-grid">' + REL.registryGroups.map(function (g) {
        return '<div class="group"><h4>' + esc(g.group) + "</h4>" +
          '<div class="chips">' + g.params.map(function (p) {
            return '<span class="chip" data-search="' + esc(p + " " + g.group) + '">' + esc(p) + "</span>";
          }).join("") + "</div></div>";
      }).join("") + "</div>");

    html += section("Features", "Service monitoring &amp; management inherited from upstream 2.24",
      '<ul class="feat-list">' + REL.features.map(function (f) {
        return '<li class="feat" data-search="' + esc(f) + '">' + esc(f) + "</li>";
      }).join("") + "</ul>");

    html += section("Source files", "14 .cpp files (with matching headers)",
      '<div class="table-wrap"><table class="mini-table"><thead><tr><th>File</th><th>Role</th></tr></thead><tbody>' +
      REL.modules.map(function (md) {
        return '<tr data-search="' + esc(md.name + " " + md.role) + '"><td><strong>' + esc(md.name) +
          "</strong></td><td>" + esc(md.role) + "</td></tr>";
      }).join("") + "</tbody></table></div>");

    html += section("Build", "Release win32 + x64 with Visual Studio 2026 (MSVC v145)",
      '<div class="step-list">' + REL.buildSteps.map(function (b) {
        return '<div class="step"><strong>' + esc(b.step) + "</strong><span>" + esc(b.detail) + "</span></div>";
      }).join("") + "</div>" +
      '<div class="chip-row">' + REL.platforms.map(function (p) {
        return '<span class="pill' + (p.status === "plan" ? " plan" : "") + '">' + esc(p.name) + "</span>";
      }).join("") + "</div>" +
      '<table class="mini-table" style="margin-top:1rem"><tbody>' + REL.stack.map(function (s) {
        return "<tr><td><strong>" + esc(s.name) + '</strong></td><td class="num">' + esc(s.version) + "</td></tr>";
      }).join("") + "</tbody></table>");

    html += section("Credits &amp; licence", "NSSM is public domain software",
      '<ul class="credit-list">' + REL.credits.map(function (c) {
        return "<li>" + esc(c) + "</li>";
      }).join("") + "</ul>" +
      '<p style="margin-top:1rem"><a class="btn" href="https://github.com/tuyndoan/nssm/blob/main/CHANGELOG.md#225--2026-06-26" target="_blank" rel="noopener">Full changelog on GitHub &rarr;</a></p>');

    pane.innerHTML =
      '<div class="section-head"><h3>Release notes &middot; ' + esc(m.version) + "</h3>" +
        '<p>Search commands, parameters, modules&hellip;</p>' +
        '<div style="margin-top:1rem"><input id="rel-search" class="btn" style="width:min(360px,100%);cursor:text;font-weight:400" type="search" placeholder="Filter commands, parameters, files&hellip;" autocomplete="off" /></div>' +
      "</div>" + html;

    var search = el("rel-search");
    if (search) search.addEventListener("input", function () { filterRelease(search.value.trim().toLowerCase()); });
    rendered.release = true;
  }

  function filterRelease(q) {
    document.querySelectorAll("#pane-release [data-search]").forEach(function (node) {
      var hay = node.getAttribute("data-search").toLowerCase();
      node.classList.toggle("hidden", q.length > 0 && hay.indexOf(q) === -1);
    });
  }

  function section(title, sub, body) {
    return '<section class="section"><div class="section-head"><h3>' + title + "</h3>" +
      (sub ? "<p>" + sub + "</p>" : "") + "</div>" + body + "</section>";
  }

  /* ---------------- Roadmap tab ---------------- */
  function taskStats() {
    var done = 0, total = 0;
    RM.versions.forEach(function (v) {
      v.tracks.forEach(function (t) {
        t.items.forEach(function (it) { total++; if (it.done) done++; });
      });
    });
    return { done: done, total: total };
  }
  function verStats(v) {
    var done = 0, total = 0;
    v.tracks.forEach(function (t) { t.items.forEach(function (it) { total++; if (it.done) done++; }); });
    return { done: done, total: total };
  }
  function pct(d, t) { return t ? Math.round((d / t) * 100) : 0; }

  function renderRoadmap() {
    if (rendered.roadmap) return;
    var pane = el("pane-roadmap");
    if (!RM) { pane.innerHTML = stateMsg("Roadmap data unavailable."); return; }

    var st = taskStats();
    var p = pct(st.done, st.total);
    var off = 295.3 - (295.3 * p) / 100;

    var shipped = RM.shippedReleases.map(function (r) {
      return '<a class="pipe-node shipped" href="https://github.com/tuyndoan/nssm/releases/tag/v' + esc(r.version) +
        '" target="_blank" rel="noopener"><span class="pipe-ver">' + esc(r.version) +
        '</span><span class="pipe-lbl">' + (r.current ? "Latest" : "Shipped") + "</span></a>";
    }).join("");
    var planned = RM.versions.map(function (v) {
      return '<span class="pipe-node theme-' + esc(v.theme) + '"><span class="pipe-ver">' + esc(v.id) +
        '</span><span class="pipe-lbl">' + esc(v.subtitle.split(" ")[0]) + "</span></span>";
    }).join("");

    var top = '<div class="panel rm-top">' +
      "<div>" +
        '<div class="section-head" style="margin:0"><h3>Development roadmap</h3>' +
        '<p class="rm-chain">' + esc(RM.meta.chain) + "</p></div>" +
        '<div class="pipeline">' + shipped + planned + "</div>" +
      "</div>" +
      '<div class="rm-progress">' +
        '<svg class="ring" viewBox="0 0 110 110"><circle class="ring-bg" cx="55" cy="55" r="47"/>' +
        '<circle class="ring-fill" cx="55" cy="55" r="47" style="stroke-dashoffset:' + off + '"/></svg>' +
        '<div class="ring-meta"><strong>' + p + '%</strong><span>' + st.done + " / " + st.total + " tasks</span></div>" +
      "</div>" +
    "</div>";

    var cards = '<section class="section"><div class="section-head"><h3>Version backlog</h3>' +
      "<p>Each task has a <strong>Validate</strong> criterion before it ships</p></div>" +
      '<div class="ver-grid">' + RM.versions.map(function (v) {
        var vs = verStats(v);
        var vp = pct(vs.done, vs.total);
        var tasks = [];
        v.tracks.forEach(function (t) { t.items.forEach(function (it) { tasks.push(it); }); });
        return '<article class="ver-card theme-' + esc(v.theme) + '">' +
          '<div class="ver-head">' +
            '<div class="ver-badge-row"><span class="ver-badge">' + esc(v.id) + "</span>" +
            '<span class="ver-prog">' + vs.done + "/" + vs.total + "</span></div>" +
            '<h4 class="ver-title">' + esc(v.icon) + " " + esc(v.title) + "</h4>" +
            '<p class="ver-goal">' + esc(v.goal) + "</p>" +
            '<div class="ver-meta"><span class="ver-chip">depends: ' + esc(v.depends) +
            '</span><span class="ver-chip">' + esc(v.subtitle) + "</span></div>" +
          "</div>" +
          '<div class="bar"><span style="width:' + vp + '%"></span></div>' +
          '<ul class="task-list">' + tasks.map(function (it) {
            return '<li class="task' + (it.done ? " done" : "") + '">' +
              '<p class="task-title">' + (it.done
                ? '<span class="tick">&#10003;</span>'
                : '<span class="box">&#9675;</span>') + esc(it.title) + "</p>" +
              '<p class="task-detail">' + esc(it.detail) + "</p>" +
              '<p class="task-validate"><b>Validate</b> ' + esc(it.validate) + "</p></li>";
          }).join("") + "</ul></article>";
      }).join("") + "</div></section>";

    pane.innerHTML = top + cards;
    rendered.roadmap = true;
  }

  /* ---------------- Download tab ---------------- */
  function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch (e) { return iso || ""; }
  }
  function assetIcon(name) {
    var sha = /\.(sha256|txt|asc|sig)$/i.test(name);
    var icon = sha
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>';
    return '<div class="asset-ico' + (sha ? " sha" : "") + '">' + icon + "</div>";
  }

  var DL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>';

  function dlData() {
    return (REL && REL.download) || {
      tag: "v2.25", zip: "nssm-2.25.zip", zipSize: "",
      sha256: "", base: "https://github.com/tuyndoan/nssm/releases/latest",
    };
  }
  function verNum() { return (REL && REL.meta && REL.meta.version) || "2.25"; }

  function assetRow(name, url, meta) {
    return '<div class="asset-row">' + assetIcon(name) +
      '<div class="asset-info"><div class="asset-name">' + esc(name) + "</div>" +
      '<div class="asset-meta">' + (meta || "") + "</div></div>" +
      '<a class="btn btn-primary asset-dl" href="' + esc(url) + '">' + DL_SVG + "Get</a>" +
      "</div>";
  }

  function copyBtn(text, label) {
    return '<button type="button" class="copy-btn" data-copy="' + esc(text) + '" aria-label="Copy ' + esc(label) + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
      "<span>Copy</span></button>";
  }

  function shaBox() {
    var d = dlData();
    if (!d.sha256) return "";
    return '<div class="sha-box"><div class="sha-head"><span class="sha-label">SHA-256</span>' +
      '<code class="sha-file">' + esc(d.zip) + "</code></div>" +
      '<div class="sha-row"><code class="sha-val">' + esc(d.sha256) + "</code>" +
      copyBtn(d.sha256, "SHA-256 checksum") + "</div></div>";
  }

  function downloadSidebar() {
    var v = verNum();
    return '<div class="dl-side">' +
      '<div class="panel"><h4>What\'s included</h4><ul>' +
        "<li><code>win32/nssm.exe</code> -- 32-bit binary</li>" +
        "<li><code>win64/nssm.exe</code> -- 64-bit binary</li>" +
        "<li><code>README.txt</code> -- usage manual</li>" +
        "<li><code>.sha256</code> -- checksum for the archive</li>" +
      "</ul></div>" +
      '<div class="panel"><h4>Quick install</h4>' +
        '<pre class="verify-pre">Expand-Archive nssm-' + v + ".zip -DestinationPath nssm\n" +
        ".\\nssm\\win64\\nssm.exe install \\\n  MyService C:\\path\\to\\app.exe</pre>" +
      "</div>" +
      '<div class="panel"><h4>Verify checksum</h4>' +
        '<pre class="verify-pre">(Get-FileHash nssm-' + v + ".zip `\n  -Algorithm SHA256).Hash\ntype nssm-" + v + ".zip.sha256</pre>" +
      "</div>" +
      '<div class="panel"><h4>Need details?</h4>' +
        '<p class="dl-note" style="margin:0 0 0.75rem">Older versions, full notes and source archives live on GitHub.</p>' +
        '<a class="btn" href="https://github.com/tuyndoan/nssm/releases" target="_blank" rel="noopener">All releases on GitHub &rarr;</a>' +
      "</div></div>";
  }

  function wireCopy() {
    document.querySelectorAll("#pane-download .copy-btn").forEach(function (b) {
      if (b._wired) return; b._wired = true;
      b.addEventListener("click", function () {
        var text = b.getAttribute("data-copy");
        var span = b.querySelector("span");
        var done = function () {
          var prev = span ? span.textContent : "";
          if (span) span.textContent = "Copied";
          b.classList.add("ok");
          setTimeout(function () { if (span) span.textContent = prev; b.classList.remove("ok"); }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {});
        } else {
          var ta = document.createElement("textarea");
          ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
    });
  }

  function renderDownload() {
    var pane = el("pane-download");
    if (rendered.download) return;
    pane.innerHTML =
      '<div class="section-head"><h3>Download</h3><p>Latest prebuilt binaries, pulled live from GitHub Releases</p></div>' +
      '<div class="dl-grid"><div class="panel" id="dl-main">' +
        '<div class="state"><div class="spinner"></div>Fetching latest release&hellip;</div>' +
      "</div>" + downloadSidebar() + "</div>";
    wireCopy();

    fetch("https://api.github.com/repos/" + REPO + "/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rel) { renderReleaseAssets(rel); rendered.download = true; })
      .catch(function () { renderDownloadFallback(); });
  }

  function renderReleaseAssets(rel) {
    var box = el("dl-main");
    if (!box) return;
    var tag = rel.tag_name || dlData().tag;
    var assets = (rel.assets || []).slice().sort(function (a, b) {
      var az = /\.(sha256|txt|asc|sig)$/i.test(a.name) ? 1 : 0;
      var bz = /\.(sha256|txt|asc|sig)$/i.test(b.name) ? 1 : 0;
      return az - bz;
    });

    var rows;
    if (assets.length) {
      rows = assets.map(function (a) {
        var meta = fmtSize(a.size) + (a.download_count ? " &middot; " + a.download_count + " downloads" : "");
        return assetRow(a.name, a.browser_download_url, meta);
      }).join("");
    } else {
      rows = '<p class="dl-note">This release has no attached binaries yet. Build from source with <code>build.cmd</code>, or check back after CI finishes packaging.</p>';
    }

    box.innerHTML =
      '<div class="dl-head"><span class="dl-tag">' + esc(rel.name || tag) + "</span>" +
        '<span class="dl-latest">Latest</span></div>' +
      '<p class="dl-date">Published ' + fmtDate(rel.published_at) + "</p>" +
      rows + shaBox() +
      '<p style="margin-top:1.25rem"><a class="btn" href="' + esc(rel.html_url) +
        '" target="_blank" rel="noopener">Full release notes on GitHub &rarr;</a></p>';
    wireCopy();
  }

  function renderDownloadFallback() {
    var box = el("dl-main");
    if (!box) return;
    var d = dlData();
    var rows = assetRow(d.zip, d.base + d.zip, d.zipSize || "ZIP archive") +
      assetRow(d.zip + ".sha256", d.base + d.zip + ".sha256", "SHA-256 checksum");
    box.innerHTML =
      '<div class="dl-head"><span class="dl-tag">NSSM ' + esc(verNum()) + "</span>" +
        '<span class="dl-latest">Latest</span></div>' +
      '<p class="dl-date">Direct links (live GitHub data unavailable -- API limit or offline).</p>' +
      rows + shaBox() +
      '<p style="margin-top:1.25rem"><a class="btn" href="https://github.com/tuyndoan/nssm/releases/latest" target="_blank" rel="noopener">All releases on GitHub &rarr;</a></p>';
    wireCopy();
    rendered.download = true;
  }

  function stateMsg(msg) { return '<div class="state">' + esc(msg) + "</div>"; }

  /* ---------------- Theme + boot ---------------- */
  function initTheme() {
    var root = document.documentElement;
    var btn = el("btn-theme");
    if (btn) btn.addEventListener("click", function () {
      root.classList.toggle("dark");
      localStorage.setItem("nssm-theme", root.classList.contains("dark") ? "dark" : "light");
    });
  }

  function init() {
    if (REL && REL.meta) { var ov = el("ov-version"); if (ov) ov.textContent = REL.meta.version; }
    initRouting();
    initTheme();
    showTab((location.hash || "#overview").slice(1), false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
