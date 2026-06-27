/* NSSM docs — Public Domain. */
/** Release 2.25 — sync with CHANGELOG.md § [2.25] */

window.NSSM_RELEASE_225 = {
  meta: {
    version: "2.25",
    date: "2026-06-26",
    maintainer: "Tuyn Doan",
    upstream: "2.24 (2014-08-31)",
    tagline: "Modernized NSSM after 2.24 — built & tested on Visual Studio 2026",
    summary:
      "Non-Sucking Service Manager: wrap any application as a Windows Service and monitor/restart it on exit. Release 2.25 continues upstream 2.24, built with Visual Studio 2026 (toolset v145, MSVC 14.5x) via build.cmd, standardized layout src/ · build/ · docs/.",
    stats: [
      { label: "Source .cpp", value: "14" },
      { label: "CLI commands", value: "16" },
      { label: "Registry params", value: "40+" },
      { label: "Toolset", value: "v145" },
    ],
  },

  components: [
    { name: "CLI / Dispatcher", file: "cli/nssm.cpp", role: "Parse commands, elevate, dispatch service control", color: "#2b6cb0" },
    { name: "Service host", file: "service/service.cpp · process.cpp", role: "service_main monitors child: restart, throttle, I/O, hooks", color: "#6741d9" },
    { name: "GUI installer", file: "gui/gui.cpp", role: "Dialog to install/edit service", color: "#ae3ec9" },
  ],

  commands: [
    { cmd: "nssm install <svc> <app> [args]", desc: "Install service running application" },
    { cmd: "nssm edit <svc>", desc: "Open GUI to edit service" },
    { cmd: "nssm get <svc> <param>", desc: "Read one parameter" },
    { cmd: "nssm set <svc> <param> <val>", desc: "Set one parameter" },
    { cmd: "nssm reset <svc> <param>", desc: "Reset to default" },
    { cmd: "nssm remove <svc> confirm", desc: "Remove service" },
    { cmd: "nssm start <svc>", desc: "Start service" },
    { cmd: "nssm stop <svc>", desc: "Stop service" },
    { cmd: "nssm restart <svc>", desc: "Restart service" },
    { cmd: "nssm status <svc>", desc: "Status as string" },
    { cmd: "nssm statuscode <svc>", desc: "Status as numeric code" },
    { cmd: "nssm rotate <svc>", desc: "Rotate logs on demand" },
    { cmd: "nssm list [all]", desc: "List NSSM-managed services" },
    { cmd: "nssm dump <svc> [newname]", desc: "Emit commands to recreate config" },
    { cmd: "nssm processes <svc>", desc: "List service processes" },
    { cmd: "nssm version", desc: "Version & build configuration" },
  ],

  registryGroups: [
    { group: "Application", params: ["Application", "AppParameters", "AppDirectory"] },
    { group: "Exit & restart", params: ["AppExit", "AppThrottle", "AppRestartDelay", "AppPriority", "AppAffinity"] },
    { group: "Stop methods", params: ["AppStopMethodSkip", "AppStopMethodConsole", "AppStopMethodWindow", "AppStopMethodThreads", "AppKillProcessTree", "AppNoConsole"] },
    { group: "I/O redirect", params: ["AppStdin", "AppStdout", "AppStderr", "AppStdoutCopyAndTruncate", "AppStderrCopyAndTruncate"] },
    { group: "File rotation", params: ["AppRotateFiles", "AppRotateOnline", "AppRotateSeconds", "AppRotateBytes", "AppRotateBytesHigh", "AppRotateDelay", "AppTimestampLog", "AppRedirectHooks"] },
    { group: "Environment", params: ["AppEnvironment", "AppEnvironmentExtra", "Environment"] },
    { group: "Event hooks", params: ["AppEvents\\Start\\Pre", "AppEvents\\Start\\Post", "AppEvents\\Stop\\Pre", "AppEvents\\Exit\\Post", "AppEvents\\Rotate\\*", "AppEvents\\Power\\*"] },
    { group: "Service (SCM)", params: ["DisplayName", "Description", "Start", "Type", "ObjectName", "DependOnService", "DependOnGroup"] },
  ],

  features: [
    "Wrap any application as a Windows Service (like srvany but with restart)",
    "Restart when app exits unexpectedly; throttle when app dies too quickly",
    "Exit code handling via AppExit: Restart / Ignore / Exit / Suicide",
    "Multi-stage stop: Control-C → WM_CLOSE → WM_QUIT → TerminateProcess",
    "Kill entire child process tree when stopping service",
    "Redirect stdin/stdout/stderr to any path; rotate logs by size/time",
    "Online rotation (CopyFile + truncate) for locked files; per-line timestamps",
    "Set priority class and CPU affinity for the application",
    "Override/supplement environment via AppEnvironment / AppEnvironmentExtra",
    "Event hooks (Start/Stop/Exit/Rotate/Power) with NSSM_* variables",
    "Manage existing services: display name, description, startup type, log on, dependencies",
    "Event log with dedicated event IDs; GUI install/edit",
  ],

  modules: [
    { name: "cli/nssm.cpp", role: "Entry point, parse commands, elevate, usage" },
    { name: "service/service.cpp", role: "service_main, install/remove/control, SCM" },
    { name: "service/process.cpp", role: "Create/monitor/kill process, affinity, debug token" },
    { name: "service/hook.cpp", role: "Run event hooks, set NSSM_* variables" },
    { name: "service/account.cpp", role: "LSA, SID, 'Log on as a service' privilege" },
    { name: "config/registry.cpp", role: "Read/write Parameters registry keys" },
    { name: "config/settings.cpp", role: "get/set/reset parameter mapping table" },
    { name: "io/io.cpp", role: "I/O redirect & rotate, charset detection" },
    { name: "io/event.cpp", role: "Windows event log, popup messages" },
    { name: "gui/gui.cpp", role: "Install/edit service dialog" },
    { name: "platform/env.cpp", role: "Parse & build environment block" },
    { name: "platform/console.cpp", role: "Create/hide console window for service" },
    { name: "platform/imports.cpp", role: "Dynamically load version-specific APIs" },
    { name: "platform/utf8.cpp", role: "UTF-8 / UTF-16 conversion" },
  ],

  buildSteps: [
    { step: "build.cmd [x86|x64]", detail: "Release build script — find VS via vswhere, load vcvarsall, run steps below" },
    { step: "vswhere → vcvarsall", detail: "Locate Visual Studio 2026 (toolset v145) and initialize MSVC environment" },
    { step: "version.cmd", detail: "Generate src/gen/version.h from VERSION file (git describe --tags overrides when available)" },
    { step: "mc -u -U resources/messages.mc -r gen -h gen", detail: "Compile message catalog → src/gen/messages.h / messages.rc / *.bin" },
    { step: "rc resources/nssm.rc", detail: "Compile resources → build/tmp/<platform>/nssm.res" },
    { step: "cl /O2 /MT *.cpp", detail: "Compile 14 sources (Release, static /MT runtime)" },
    { step: "link ... .obj nssm.res", detail: "Link → build/out/<platform>/nssm.exe" },
  ],

  platforms: [
    { name: "win32 — built (build.cmd)", status: "ok" },
    { name: "x64 — built (build.cmd x64)", status: "ok" },
    { name: "arm64 — exploration 2.28", status: "plan" },
  ],

  stack: [
    { name: "Language", version: "C++ (Win32 API)" },
    { name: "Toolset", version: "MSVC v145 (14.5x)" },
    { name: "Build tools", version: "Visual Studio 2026" },
    { name: "Build script", version: "build.cmd" },
    { name: "Project (current)", version: "nssm.vcproj at repo root (VS 2008)" },
    { name: "Event log", version: "messages.mc" },
    { name: "Upstream base", version: "NSSM 2.24 (2014-08-31)" },
    { name: "Licence", version: "Public Domain" },
  ],

  credits: [
    "Maintainer: Tuyn Doan.",
    "Original author: Iain Patterson (2003–2014).",
    "64-bit: Benjamin Mayrargue. File rotation: Doug Watson.",
    "Process tree & skip: Arve Knudsen, Bader Aldurai, Barrett Lewis.",
    "Affinity/priority: Robert Middleton, Арслан Сайдуганов.",
    "Timestamp output: Nicolas Ducrocq. statuscode: Meang Akira Tanaka.",
    "NSSM is public domain software — free to use for any purpose.",
  ],

  nav: [
    { id: "overview", label: "Overview" },
    { id: "architecture", label: "Architecture" },
    { id: "commands", label: "CLI commands" },
    { id: "registry", label: "Parameters" },
    { id: "features", label: "Features" },
    { id: "modules", label: "Source files" },
    { id: "build", label: "Build" },
    { id: "credits", label: "Credits" },
  ],
};
