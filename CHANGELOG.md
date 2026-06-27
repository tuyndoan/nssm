# Changelog

All notable changes to **NSSM** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This tree continues upstream **NSSM 2.24** (Iain Patterson, 2003–2014, public domain).
The first post-upstream release is **2.25** (2026). Upstream history is preserved at the end.

**Maintainer:** Tuyn Doan

## [2.25] — 2026-06-26

> **Interactive UI:** open [`docs/release/2.25/index.html`](docs/release/2.25/index.html) (architecture, CLI commands, registry parameters, build, dark mode).

**NSSM 2.25** is the first modernized release after upstream **2.24** (2014-08-31): built and
tested with **Visual Studio 2026 Build Tools** (toolset **v145**, MSVC 14.5x) on current
Windows, preserving Non-Sucking Service Manager behavior — wrap any application as a Windows
Service and monitor/restart it on exit. Repository layout is standardized.

---

### Added

- **Standardized layout:** sources under `src/` grouped by responsibility (`cli/`, `service/`, `config/`, `io/`, `gui/`, `platform/`, `include/`); build inputs in `src/resources/`; generated files in `src/gen/` (git-ignored). `nssm.sln` / `nssm.vcproj` at **repo root** (standard VS layout). Build output under `build/`; documentation under `docs/`.
  - `src/include/nssm.h` (umbrella header) includes module headers via explicit subpaths; `build.cmd` generates into `src/gen/`, compiles with `src/`, `src/include/`, and `src/gen/` on the include path.
- **`build.cmd`** — Release build script: finds Visual Studio via `vswhere`, loads MSVC, generates `version.h`, compiles `messages.mc` + `nssm.rc` + 14 `*.cpp`, links `psapi shlwapi advapi32 user32 shell32 comdlg32 ole32`. Supports `build.cmd x86` and `build.cmd x64`. Static runtime (`/MT`).
- **`VERSION`** file at repo root: single source for the version string (currently `2.25`). Edit + rebuild to bump; `git describe --tags` still overrides when git/tags are present. `build.cmd` passes it to `version.cmd` (no git required for a versioned build).
- **`pack.cmd`** — packaging script: builds win32 + win64, then writes `dist/nssm-<version>.zip` (upstream layout: `win32/nssm.exe`, `win64/nssm.exe`, `README.txt`) plus a `.sha256` checksum. `dist/` is git-ignored; artifacts are meant for GitHub Releases, not commits.
- **GitHub Actions** (`.github/workflows/build.yml`): build + smoke test (win32 + win64) on every push/PR with per-platform artifacts; auto-create a GitHub Release (zip + SHA256) on `v*` tags or via manual run with the `create_release` box ticked. (Advances **2.27**; runners use v143 until images ship VS 2026.)
- **`README.md`** at repo root: overview, layout, build instructions, doc links.
- Interactive release notes at `docs/release/2.25/`.
- Interactive roadmap / backlog at `docs/roadmap/` (planned **2.26 → 2.31**).
- Cursor rules: `roadmap-backlog-sync.mdc` and `docs-update-on-change.mdc` (every change must update `README.md`, `CHANGELOG.md`, and `docs/`).

### Changed

- Continues from upstream NSSM **2.24**; version **2.25** is the next semver step (not a major fork bump).
- **Toolchain:** build & test with **Visual Studio 2026** (toolset **v145**, MSVC 14.5x).
- Upstream usage manual (`README.txt`) moved to [`docs/manual.txt`](docs/manual.txt).
- `.gitignore` ignores `build/`, `dist/`, generated files in `src/gen/`, compiler/linker intermediates, VS user files, and OS/editor cruft.
- `.gitattributes` normalizes line endings (`text=auto`), forces CRLF for Windows tooling (`.cmd`/`.bat`/`.sln`/`.vcproj`), and marks binary assets (`.ico`/`.bin`/`.exe`/`.pdb`/images). `messages.mc` and `nssm.rc` are `-text` (UTF-16LE; must not be CRLF-normalized).

### Fixed

- **CI `mc` failure:** GitHub Actions checkout no longer corrupts `messages.mc` / `nssm.rc` encoding; `mc.exe` compiles the message catalog again.
- **CI artifacts** now include the version in their name (`nssm-<version>-x86` / `nssm-<version>-x64`); on `v*` tag builds the version comes from the tag.
- **Release notes:** the release job uses `docs/release/<version>/RELEASE.md` as the GitHub Release body when present (falls back to an auto-generated note otherwise).

### Removed

- Generated files at repo root (`messages.h`, `messages.rc`, `MSG*.bin`, `version.h`) and legacy build dirs (`out/`, `tmp/`) — regenerated on build.
- `ChangeLog.txt` — content merged into this file (see *Upstream history*).

### Known issues

- `nssm version` derives from the `VERSION` file when `git` is absent; only falls back to `0.0` if `VERSION` is also missing. Full `git describe` integration (real tag in builds) is planned for **2.26**.
- Project is still `nssm.vcproj` (VS 2008) at the **repo root** — **MSBuild cannot build directly**; use `build.cmd`. `.vcxproj` migration planned for **2.26**.
- **x64** build emits pointer truncation warnings (`C4311/C4302/C4312` in `settings.cpp`) — upstream code is not fully 64-bit-clean. Planned for **2.28** (Compatibility).

---

### Roadmap / Backlog

> Planned releases **2.26 → 2.31**. Each item has **Validate** — criteria to mark done before moving to **Added** of that version.
>
> **Interactive UI:** [`docs/roadmap/index.html`](docs/roadmap/index.html) (timeline, local ticks, search, dark mode).
>
> **Sync rule:** backlog changes **must** update both `CHANGELOG.md` and `docs/roadmap/roadmap-data.js` — see [`docs/roadmap/README.md`](docs/roadmap/README.md) and `.cursor/rules/roadmap-backlog-sync.mdc`.
>
> Priority: **build/CI first, features later** — **2.26 Build** → **2.27 CI** → **2.28 Compat** → **2.29 Service engine** → **2.30 Quality** → **2.31 Docs & packaging**.

#### NSSM runtime components

| Component | When | Examples |
| --- | --- | --- |
| **CLI / Dispatcher** (`nssm.cpp`) | Parse commands, manage services | `install`, `edit`, `get`/`set`, `start`/`stop`, `dump` |
| **Service host** (`service.cpp`, `process.cpp`) | `service_main` monitors child process | Restart + throttle, `AppExit`, I/O redirect, hooks |
| **GUI installer** (`gui.cpp`) | Install/edit service via dialog | `nssm install <name>`, `nssm edit <name>` |

---

#### [2.26] — Modern build

**Goal:** Build with MSBuild/Visual Studio without manual steps; win32 + x64.

- [ ] **Migrate `nssm.vcproj` → `nssm.vcxproj`**
  - VS 2026 project + solution (toolset v145); keep `.vcproj` for reference.
  - **Validate:** `msbuild nssm.sln /p:Configuration=Release /p:Platform=Win32` green, no manual build.
- [ ] **x64 build configuration**
  - Platform `x64`, toolset v145, correct `TargetMachine`.
  - **Validate:** `msbuild ... /p:Platform=x64` produces `nssm.exe`; `nssm version` reports `64-bit`.
- [ ] **Custom build step for `messages.mc`**
  - Integrate `mc.exe` (pre-build) to generate `messages.h` / `messages.rc` automatically.
  - **Validate:** clean build generates message files, no missing headers.
- [ ] **Version from git**
  - `version.cmd` uses `git describe`; document `git` in PATH requirement.
  - **Validate:** `nssm version` shows real tag (e.g. `2.25-...`), not `0.0`.
- [ ] **Declare all link libraries**
  - `advapi32 user32 shell32 comdlg32 ole32 psapi shlwapi` in project.
  - **Validate:** no `LNK2019` unresolved externals.
- [ ] **Update Build documentation**
  - README Build section for VS 2026.
  - **Validate:** new dev can build from docs in ≤ 10 minutes.

---

#### [2.27] — CI & artifacts

**Goal:** GitHub Actions automated build; win32 + x64 artifacts.

- [x] **Workflow on `windows-latest`** — landed in 2.25 (`build.cmd`, not MSBuild yet).
  - Build win32 + x64 via `build.cmd`.
  - **Validate:** PR runs build matrix; fails on compile errors.
- [x] **Upload `nssm.exe` artifacts** — landed in 2.25.
  - Attach win32 and x64 to the run.
  - **Validate:** artifacts download successfully.
- [ ] **Cache toolset / build deps**
  - **Validate:** second build noticeably faster.
- [ ] **Format check (clang-format, optional)**
  - **Validate:** PR warns on format drift.
- [x] **Tag-driven release workflow** — landed in 2.25 (tag `v*` or manual tick).
  - Push tag `v2.x` → GitHub Release with binary zip.
  - **Validate:** tag push creates draft release with binaries.
- [x] **Build badge in README** — landed in 2.25.
  - **Validate:** badge reflects branch status.

---

#### [2.28] — Platform compatibility

**Goal:** Verify on modern Windows; review toolset & Unicode.

- [ ] **Toolset v145 + current Windows SDK**
  - **Validate:** clean build, no deprecated API errors.
- [ ] **Test Windows 11 / Server 2022**
  - install / start / stop / remove a real service.
  - **Validate:** full service lifecycle OK.
- [ ] **Regression Windows 10 x64**
  - **Validate:** binary runs on Win10.
- [ ] **ARM64 survey (optional)**
  - **Validate:** arm64 build or documented blockers.
- [ ] **Unicode / UTF-8 paths (`utf8.cpp`)**
  - **Validate:** install with non-ASCII paths and spaces OK.
- [ ] **Review static runtime (`/MT`)**
  - **Validate:** exe runs on clean machine without VC++ redistributable.

---

#### [2.29] — Service engine

**Goal:** Harden inherited upstream service monitoring features.

- [ ] **`AppKillProcessTree` skip**
  - **Validate:** set `0` → kill root process only, skip child tree.
- [ ] **`AppRotateDelay` sleep after rotate**
  - **Validate:** rotate → pause for configured milliseconds.
- [ ] **Copy/truncate rotation**
  - `CopyFile` + `SetEndOfFile` for files held open by another process.
  - **Validate:** rotation works while file is locked.
- [ ] **Set environment before reading registry**
  - **Validate:** `Application` / `AppDirectory` can reference `AppEnvironment` variables.
- [ ] **Complete event hooks**
  - Start/Stop/Exit/Rotate/Power with `NSSM_*` variables.
  - **Validate:** hooks receive documented environment variables.
- [ ] **`TerminateProcess()` correctness (2.23 regression)**
  - **Validate:** stop service kills process tree cleanly.

---

#### [2.30] — Quality & hardening

**Goal:** Clear warnings, static analysis, smoke tests.

- [ ] **Enable `/W4`, fix warnings**
  - **Validate:** `/W4` build introduces no new warnings.
- [ ] **Static analysis (`/analyze` or clang-tidy)**
  - **Validate:** no high-severity findings.
- [ ] **Smoke test script**
  - install → start → status → stop → remove dummy service.
  - **Validate:** script passes locally + in CI.
- [ ] **Application Verifier / leak check**
  - **Validate:** no handle leaks on main paths.
- [ ] **Buffer overflow audit**
  - Per Connor Reynolds credit (upstream).
  - **Validate:** string copy paths reviewed.
- [ ] **64-core affinity test**
  - Per foi credit (upstream — hang with 64 cores).
  - **Validate:** `AppAffinity` with ≥ 64 CPUs does not hang.

---

#### [2.31] — Docs & packaging

**Goal:** Packaging, code signing, complete documentation.

- [ ] **HTML docs from `manual.txt`**
  - **Validate:** docs page covers full usage.
- [ ] **Code signing for `nssm.exe`**
  - **Validate:** valid signature; fewer SmartScreen warnings.
- [ ] **Zip release win32 + x64 + checksum**
  - **Validate:** SHA256 matches published binaries.
- [ ] **Polish `dump` / `list` / `processes`**
  - **Validate:** `nssm dump <svc>` reproduces service config.
- [ ] **Generate CHANGELOG from git**
  - **Validate:** release notes match commit history.
- [ ] **Migration guide from srvany / upstream**
  - **Validate:** documented migration steps.

---

## Upstream history (NSSM ≤ 2.24)

> Public domain. Author: Iain Patterson and contributors. Migrated from `ChangeLog.txt`.

### [2.24] — 2014-08-31

- Allow skipping `kill_process_tree()`.
- Configurable sleep after output rotation.
- Rotate logs with `CopyFile()` + `SetEndOfFile()` so files held open by other processes can be rotated.
- Set service environment before reading registry parameters so paths/arguments can reference `AppEnvironment` / `AppEnvironmentExtra`.

### [2.23]

- `TerminateProcess()` is called correctly again.

### [2.22]

- No longer pollute the event log with "The specified procedure could not be found" on older Windows.
- Fixed failure to set local username for service logon.

### [2.21]

- Manage existing services via GUI or command line.
- Set priority class and processor affinity for the application.
- Apply unconditional delay before restart.
- Rotate existing file when redirecting I/O.
- Unqualified paths resolved relative to startup directory when redirecting I/O.
- Set display name, description, startup type, and log on details for the service.
- Every service gets a proper console window (interactive input works when run interactively).

### [2.20]

- Services installed from the GUI no longer get wrong `AppParameters` in the registry.

### [2.19]

- Services installed from the command line (not GUI) no longer get wrong `AppStopMethod*` entries.

### [2.18]

- Support `AppEnvironmentExtra` to augment rather than replace environment.
- GUI significantly less "sucky".

### [2.17]

- Configure timeout for each shutdown method in the registry.
- Send Control-C to console applications on shutdown.
- Silently ignore `INTERROGATE` control.
- Allow building on Visual Studio Express.

### [2.16]

- Redirect service I/O streams to any path openable with `CreateFile()`.

### [2.15]

- Fixed NSSM sometimes killing unrelated processes on shutdown.

### [2.14]

- Italian translation.
- Fixed GUI rejecting paths longer than 256 characters.

### [2.13]

- Fixed default GUI language being French instead of English.

### [2.12]

- Fixed failure to run on Windows 2000.

### [2.11]

- French translation.
- Recovery actions actually work again (fix for 2.4 regression).

### [2.10]

- `AppEnvironment` support compatible with srvany.

### [2.9]

- Fixed `messages.mc` compile failure in paths containing spaces.
- Edge case fix with `CreateProcess()`.

### [2.8]

- Fixed failure to run on pre-Vista Windows.

### [2.7]

- Re-read `Application`, `AppDirectory`, `AppParameters` before each restart.
- Fixed messages not reaching the event log correctly.
- Handle invalid quotes in `AppDirectory`.
- Fixed failure to write full arguments to `AppParameters` on install.
- Restart throttle: backoff if app starts OK but exits too soon (default 1500ms, `AppThrottle`).
- Graceful process tree kill (send window/thread messages before `TerminateProcess()`).

### [2.6]

- Handle missing registry values (warn on `AppParameters`/`AppDirectory`, pick fallback directory).
- Kill process tree when stopping service.

### [2.5]

- Fixed broken `ExpandEnvironmentStrings()` (log_event left out of code).

### [2.4]

- Allow `REG_EXPAND_SZ` in registry.
- No suicide on default exit status 0.
- No hang when startup parameters cannot be determined; report STOPPED, set START_PENDING before start.

### [2.3]

- Recovery actions work (configure SCM for new behavior); recognize `AppExit` `Suicide` on pre-Vista.

### [2.2]

- Send correctly formatted messages to the event log.
- Fixed truncation of very long paths in registry.

### [2.1]

- Configure app exit handling via `AppExit\<n>` (`Restart` / `Ignore` / `Exit`).

### [2.0]

- Support building 64-bit executable.
- Project files for newer Visual Studio versions.
