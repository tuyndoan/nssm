# NSSM 2.25

First modernized release continuing upstream **NSSM 2.24** (2014-08-31). Same
Non-Sucking Service Manager behavior — wrap any application as a Windows Service
and monitor/restart it on exit — now built and tested with **Visual Studio 2026**
(toolset v145, MSVC 14.5x) on current Windows, with a standardized repository
layout and CI.

## Downloads

| File | Description |
| --- | --- |
| `nssm-2.25.zip` | win32 + win64 binaries (`win32/nssm.exe`, `win64/nssm.exe`) + manual |
| `nssm-2.25.zip.sha256` | SHA-256 checksum |

Verify:

```powershell
(Get-FileHash nssm-2.25.zip -Algorithm SHA256).Hash
type nssm-2.25.zip.sha256
```

## Highlights

- **Standardized layout** — sources under `src/` grouped by responsibility
  (`cli/`, `service/`, `config/`, `io/`, `gui/`, `platform/`, `include/`);
  generated files in `src/gen/`; `nssm.sln` / `nssm.vcproj` at repo root.
- **`build.cmd`** — one-command release build (`build.cmd x86` / `build.cmd x64`),
  auto-detects Visual Studio via `vswhere`, static runtime (`/MT`).
- **`pack.cmd`** — produces `dist/nssm-<version>.zip` + `.sha256`.
- **`VERSION` file** — single source for the version string; no git required.
- **GitHub Actions** — build + smoke test (win32 + win64) on every push/PR;
  versioned artifacts; auto-create this Release on `v*` tags.

## Fixed

- CI message-compiler failure: `messages.mc` / `nssm.rc` keep their UTF-16LE
  encoding through checkout, so `mc.exe` compiles the message catalog again.
- CI artifacts now include the version in their name (`nssm-2.25-x86` / `-x64`).

## Known issues

- `nssm.vcproj` is still VS 2008 format — **MSBuild can't build it directly**;
  use `build.cmd`. `.vcxproj` migration is planned for **2.26**.
- x64 build emits pointer-truncation warnings (`C4311/C4302/C4312` in
  `settings.cpp`); upstream code isn't fully 64-bit-clean. Planned for **2.28**.

**Full changelog:** see [`CHANGELOG.md`](https://github.com/tuyndoan/nssm/blob/main/CHANGELOG.md).
