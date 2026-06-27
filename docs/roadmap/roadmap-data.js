/* NSSM docs — Public Domain. */
/** Roadmap data — sync with CHANGELOG.md § Roadmap / Backlog */

window.NSSM_ROADMAP = {
  meta: {
    product: "NSSM",
    maintainer: "Tuyn Doan",
    currentRelease: "2.25",
    currentDate: "2026-06-26",
    chain:
      "2.26 Build → 2.27 CI → 2.28 Compat → 2.29 Service engine → 2.30 Quality → 2.31 Docs & packaging",
  },

  themeMeta: {
    build: { label: "Build", glyph: "⚒", desc: "MSBuild / VS 2026" },
    ci: { label: "CI/CD", glyph: "⟳", desc: "GitHub Actions" },
    compat: { label: "Compat", glyph: "⊞", desc: "Windows & toolset" },
    service: { label: "Service", glyph: "⚙", desc: "Monitoring engine" },
    quality: { label: "Quality", glyph: "✦", desc: "Warnings & tests" },
    docs: { label: "Docs", glyph: "▤", desc: "Packaging & docs" },
  },

  architecture: {
    title: "NSSM runtime components",
    rows: [
      {
        component: "CLI / Dispatcher",
        when: "Parse commands, manage services",
        example: "install · edit · get/set · start/stop · dump",
        icon: "cli",
      },
      {
        component: "Service host",
        when: "service_main monitors child process",
        example: "Restart + throttle · AppExit · I/O redirect · hooks",
        icon: "host",
      },
      {
        component: "GUI installer",
        when: "Install/edit service via dialog",
        example: "nssm install <name> · nssm edit <name>",
        icon: "gui",
      },
    ],
  },

  released: {
    version: "2.25",
    date: "2026-06-26",
    summary:
      "First release after upstream 2.24 — built & tested with Visual Studio 2026 (toolset v145); layout src/ · build/ · docs/.",
    highlights: [
      "build.cmd (vswhere → vcvarsall, /MT) win32 + x64",
      "Standardized layout: src/ · build/ · docs/",
      "nssm.exe runs: nssm version OK",
    ],
  },

  /** Shipped releases — newest first; sync CHANGELOG version headers */
  shippedReleases: [
    {
      version: "2.25",
      date: "2026-06-26",
      label: "Modernized release after 2.24",
      summary:
        "Continues NSSM 2.24 — built & tested with Visual Studio 2026 (toolset v145), standardized repository layout.",
      highlights: [
        "build.cmd + Visual Studio 2026 (v145)",
        "Layout src/ · build/ · docs/",
        "nssm version OK on modern Windows",
      ],
      releaseNotes: "../release/2.25/index.html",
      changelog: "../../CHANGELOG.md#225--2026-06-26",
      current: true,
    },
  ],

  versions: [
    {
      id: "2.26",
      title: "Modern build",
      subtitle: "MSBuild & Visual Studio 2026",
      theme: "build",
      icon: "⚒",
      depends: "2.25",
      goal: "Build with MSBuild/VS without manual steps; win32 + x64.",
      tracks: [
        {
          name: "Project & toolchain",
          items: [
            {
              id: "226-b1",
              title: "Migrate nssm.vcproj → nssm.vcxproj",
              detail: "VS 2026 project + solution (toolset v145); keep .vcproj for reference.",
              validate: "msbuild nssm.sln /p:Configuration=Release /p:Platform=Win32 green, no manual build.",
            },
            {
              id: "226-b2",
              title: "x64 build configuration",
              detail: "Platform x64, toolset v145, correct TargetMachine.",
              validate: "msbuild ... /p:Platform=x64 produces nssm.exe; nssm version reports 64-bit.",
            },
            {
              id: "226-b3",
              title: "Custom build step for messages.mc",
              detail: "Integrate mc.exe (pre-build) to generate messages.h / messages.rc automatically.",
              validate: "Clean build generates message files, no missing headers.",
            },
            {
              id: "226-b4",
              title: "Version from git",
              detail: "version.cmd uses git describe; document git in PATH requirement.",
              validate: "nssm version shows real tag (e.g. 2.25-...), not 0.0.",
            },
            {
              id: "226-b5",
              title: "Declare all link libraries",
              detail: "advapi32 user32 shell32 comdlg32 ole32 psapi shlwapi in project.",
              validate: "No LNK2019 unresolved externals.",
            },
            {
              id: "226-b6",
              title: "Update Build documentation",
              detail: "README Build section for VS 2026.",
              validate: "New dev can build from docs in ≤ 10 minutes.",
            },
          ],
        },
      ],
    },
    {
      id: "2.27",
      title: "CI & artifacts",
      subtitle: "GitHub Actions",
      theme: "ci",
      icon: "⟳",
      depends: "2.26",
      goal: "Automated GitHub Actions build; win32 + x64 artifacts.",
      tracks: [
        {
          name: "Pipeline",
          items: [
            {
              id: "227-c1",
              title: "Workflow on windows-latest",
              detail: "Build win32 + x64 via build.cmd (landed in 2.25).",
              validate: "PR runs build matrix; fails on compile errors.",
              done: true,
            },
            {
              id: "227-c2",
              title: "Upload nssm.exe artifacts",
              detail: "Attach win32 and x64 to the run (landed in 2.25).",
              validate: "Artifacts download successfully.",
              done: true,
            },
            {
              id: "227-c3",
              title: "Cache toolset / build deps",
              detail: "Speed up repeat builds.",
              validate: "Second build noticeably faster.",
            },
            {
              id: "227-c4",
              title: "Format check (clang-format, optional)",
              detail: "Style check; optional non-blocking.",
              validate: "PR warns on format drift.",
            },
            {
              id: "227-c5",
              title: "Tag-driven release workflow",
              detail: "Push tag v2.x (or manual tick) → GitHub Release with zip (landed in 2.25).",
              validate: "Tag push creates draft release with binaries.",
              done: true,
            },
            {
              id: "227-c6",
              title: "Build badge in README",
              detail: "Workflow status badge (landed in 2.25).",
              validate: "Badge reflects branch status.",
              done: true,
            },
          ],
        },
      ],
    },
    {
      id: "2.28",
      title: "Platform compatibility",
      subtitle: "Modern Windows & toolset",
      theme: "compat",
      icon: "⊞",
      depends: "2.26",
      goal: "Verify on modern Windows; review toolset & Unicode.",
      tracks: [
        {
          name: "Compatibility",
          items: [
            {
              id: "228-x1",
              title: "Toolset v145 + current Windows SDK",
              detail: "Update platform toolset & SDK.",
              validate: "Clean build, no deprecated API errors.",
            },
            {
              id: "228-x2",
              title: "Test Windows 11 / Server 2022",
              detail: "install / start / stop / remove a real service.",
              validate: "Full service lifecycle OK.",
            },
            {
              id: "228-x3",
              title: "Regression Windows 10 x64",
              detail: "Ensure no breakage on Win10.",
              validate: "Binary runs on Win10.",
            },
            {
              id: "228-x4",
              title: "ARM64 survey (optional)",
              detail: "Try arm64 build configuration.",
              validate: "arm64 build or documented blockers.",
            },
            {
              id: "228-x5",
              title: "Unicode / UTF-8 paths",
              detail: "Exercise utf8.cpp with accented paths and spaces.",
              validate: "Install with non-ASCII paths OK.",
            },
            {
              id: "228-x6",
              title: "Review static runtime (/MT)",
              detail: "Static CRT linkage.",
              validate: "Exe runs on clean machine without VC++ redistributable.",
            },
          ],
        },
      ],
    },
    {
      id: "2.29",
      title: "Service engine",
      subtitle: "Service monitoring features",
      theme: "service",
      icon: "⚙",
      depends: "2.26",
      goal: "Harden inherited upstream service monitoring features.",
      tracks: [
        {
          name: "Engine",
          items: [
            {
              id: "229-s1",
              title: "AppKillProcessTree skip",
              detail: "Skip killing child process tree when configured.",
              validate: "Set 0 → kill root process only, skip child tree.",
            },
            {
              id: "229-s2",
              title: "AppRotateDelay sleep after rotate",
              detail: "Pause after output rotation.",
              validate: "Rotate → pause for configured milliseconds.",
            },
            {
              id: "229-s3",
              title: "Copy/truncate rotation",
              detail: "CopyFile + SetEndOfFile for files held open.",
              validate: "Rotation works while file is locked by another process.",
            },
            {
              id: "229-s4",
              title: "Set environment before reading registry",
              detail: "Apply AppEnvironment before parsing parameters.",
              validate: "Application / AppDirectory can reference AppEnvironment variables.",
            },
            {
              id: "229-s5",
              title: "Complete event hooks",
              detail: "Start/Stop/Exit/Rotate/Power with NSSM_* variables.",
              validate: "Hooks receive documented environment variables.",
            },
            {
              id: "229-s6",
              title: "TerminateProcess() correctness (2.23 regression)",
              detail: "Ensure clean kill on stop.",
              validate: "Stop service kills process tree cleanly.",
            },
          ],
        },
      ],
    },
    {
      id: "2.30",
      title: "Quality & hardening",
      subtitle: "Warnings, static analysis, smoke",
      theme: "quality",
      icon: "✦",
      depends: "2.26, 2.29",
      goal: "Clear warnings, static analysis, service lifecycle smoke tests.",
      tracks: [
        {
          name: "Hardening",
          items: [
            {
              id: "230-q1",
              title: "Enable /W4, fix warnings",
              detail: "Raise warning level and address issues.",
              validate: "/W4 build introduces no new warnings.",
            },
            {
              id: "230-q2",
              title: "Static analysis (/analyze or clang-tidy)",
              detail: "Static analysis for C++ code.",
              validate: "No high-severity findings.",
            },
            {
              id: "230-q3",
              title: "Smoke test script",
              detail: "install → start → status → stop → remove dummy service.",
              validate: "Script passes locally + in CI.",
            },
            {
              id: "230-q4",
              title: "Application Verifier / leak check",
              detail: "Check handle leaks on main paths.",
              validate: "No handle leaks on main paths.",
            },
            {
              id: "230-q5",
              title: "Buffer overflow audit",
              detail: "Per Connor Reynolds credit (upstream).",
              validate: "String copy paths reviewed.",
            },
            {
              id: "230-q6",
              title: "64-core affinity test",
              detail: "Per foi credit (hang with 64 cores).",
              validate: "AppAffinity with ≥ 64 CPUs does not hang.",
            },
          ],
        },
      ],
    },
    {
      id: "2.31",
      title: "Docs & packaging",
      subtitle: "Packaging, signing, documentation",
      theme: "docs",
      icon: "▤",
      depends: "2.27, 2.30",
      goal: "Package, sign binaries, complete documentation.",
      tracks: [
        {
          name: "Release",
          items: [
            {
              id: "231-d1",
              title: "HTML docs from manual.txt",
              detail: "Convert usage manual to HTML pages.",
              validate: "Docs page covers full usage.",
            },
            {
              id: "231-d2",
              title: "Code signing for nssm.exe",
              detail: "Sign with certificate.",
              validate: "Valid signature; fewer SmartScreen warnings.",
            },
            {
              id: "231-d3",
              title: "Zip release win32 + x64 + checksum",
              detail: "Package with SHA256.",
              validate: "SHA256 matches published binaries.",
            },
            {
              id: "231-d4",
              title: "Polish dump / list / processes",
              detail: "Improve management commands.",
              validate: "nssm dump <svc> reproduces service config.",
            },
            {
              id: "231-d5",
              title: "Generate CHANGELOG from git",
              detail: "Automate release notes.",
              validate: "Release notes match commit history.",
            },
            {
              id: "231-d6",
              title: "Migration guide from srvany / upstream",
              detail: "Document migration steps.",
              validate: "Documented migration steps.",
            },
          ],
        },
      ],
    },
  ],

  releaseChecklist: [
    { label: "Build Release win32 + x64 green", versions: ["2.26", "2.27", "2.28", "2.29", "2.30", "2.31"] },
    { label: "Build from nssm.sln (no manual build)", versions: ["2.26", "2.27", "2.28", "2.29", "2.30", "2.31"] },
    { label: "CI build matrix green", versions: ["2.27", "2.28", "2.29", "2.30", "2.31"] },
    { label: "Smoke install/start/stop/remove pass", versions: ["2.28", "2.29", "2.30", "2.31"] },
    { label: "No new /W4 warnings", versions: ["2.30", "2.31"] },
    { label: "CHANGELOG Added complete", versions: ["2.26", "2.27", "2.28", "2.29", "2.30", "2.31"] },
    { label: "Artifact / zip with checksum", versions: ["2.27", "2.31"] },
  ],
};
