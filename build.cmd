@echo off
rem NSSM build script — Public Domain.
rem Usage: build.cmd [x86|x64]   (default x86)
rem Builds Release nssm.exe with the latest installed Visual Studio C++ toolset
rem (Visual Studio 2026 / MSVC v145 recommended). Outputs to build\out\<platform>.

setlocal enabledelayedexpansion

set "PLATFORM=%~1"
if "%PLATFORM%"=="" set "PLATFORM=x86"
if /I "%PLATFORM%"=="amd64" set "PLATFORM=x64"
if /I "%PLATFORM%"=="win32" set "PLATFORM=x86"

if /I not "%PLATFORM%"=="x86" if /I not "%PLATFORM%"=="x64" (
  echo ERROR: unknown platform "%PLATFORM%" ^(expected x86 or x64^).
  exit /b 1
)

set "ROOT=%~dp0"
set "SRC=%ROOT%src"
set "TMP=%ROOT%build\tmp\%PLATFORM%"
set "OUT=%ROOT%build\out\%PLATFORM%"

rem --- Locate Visual Studio with the C++ toolset via vswhere ---
set "VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
if not exist "%VSWHERE%" set "VSWHERE=%ProgramFiles%\Microsoft Visual Studio\Installer\vswhere.exe"
if not exist "%VSWHERE%" (
  echo ERROR: vswhere.exe not found. Install Visual Studio 2026 Build Tools ^(C++ workload^).
  exit /b 1
)

set "VSPATH="
for /f "usebackq tokens=*" %%i in (`"%VSWHERE%" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do set "VSPATH=%%i"
if not defined VSPATH (
  echo ERROR: no Visual Studio install with C++ tools found.
  exit /b 1
)

set "VCVARS=%VSPATH%\VC\Auxiliary\Build\vcvarsall.bat"
if not exist "%VCVARS%" (
  echo ERROR: vcvarsall.bat not found under "%VSPATH%".
  exit /b 1
)

echo === Visual Studio: %VSPATH%
call "%VCVARS%" %PLATFORM% || (echo ERROR: vcvarsall failed & exit /b 1)

set "RCDEFS=/nologo /dNDEBUG"
if /I "%PLATFORM%"=="x64" set "RCDEFS=%RCDEFS% /d_WIN64"

if not exist "%TMP%" mkdir "%TMP%"
if not exist "%OUT%" mkdir "%OUT%"

pushd "%SRC%"

if not exist gen mkdir gen

echo === Versioning
set "NSSM_VERSION_FALLBACK="
if exist "%ROOT%VERSION" set /p NSSM_VERSION_FALLBACK=<"%ROOT%VERSION"
pushd gen
call ..\resources\version.cmd
popd

echo === Compiling messages
mc -u -U resources\messages.mc -r gen -h gen || (echo ERROR: mc failed & popd & exit /b 1)

echo === Resource
rc %RCDEFS% /i . /i include /i gen /i gui /i resources /fo "%TMP%\nssm.res" resources\nssm.rc || (echo ERROR: rc failed & popd & exit /b 1)

echo === Compiling sources
cl /nologo /O2 /MT /DWIN32 /DNDEBUG /D_CONSOLE /W3 /I . /I include /I gen /Fo"%TMP%\\" /Fd"%TMP%\\" /c ^
  cli\nssm.cpp ^
  service\service.cpp service\process.cpp service\hook.cpp service\account.cpp ^
  config\registry.cpp config\settings.cpp ^
  io\io.cpp io\event.cpp ^
  gui\gui.cpp ^
  platform\imports.cpp platform\utf8.cpp platform\env.cpp platform\console.cpp || (echo ERROR: cl failed & popd & exit /b 1)

echo === Linking
link /nologo /SUBSYSTEM:CONSOLE /OUT:"%OUT%\nssm.exe" /PDB:"%OUT%\nssm.pdb" ^
  "%TMP%\*.obj" "%TMP%\nssm.res" ^
  psapi.lib shlwapi.lib advapi32.lib user32.lib shell32.lib comdlg32.lib ole32.lib || (echo ERROR: link failed & popd & exit /b 1)

popd

echo.
echo === Build OK: %OUT%\nssm.exe
endlocal
