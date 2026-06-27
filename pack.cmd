@echo off
rem NSSM packaging script — Public Domain.
rem Builds win32 + win64 (if needed) and packages them into dist\nssm-<version>.zip
rem with a SHA256 checksum. Distribution artifacts are git-ignored; upload to a
rem GitHub Release rather than committing them.

setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "VER="
if exist "%ROOT%VERSION" set /p VER=<"%ROOT%VERSION"
if "%VER%"=="" set "VER=0.0"

echo === Building binaries (version %VER%)
if not exist "%ROOT%build\out\x86\nssm.exe" call "%ROOT%build.cmd" x86 || (echo ERROR: x86 build failed & exit /b 1)
if not exist "%ROOT%build\out\x64\nssm.exe" call "%ROOT%build.cmd" x64 || (echo ERROR: x64 build failed & exit /b 1)

set "DIST=%ROOT%dist"
set "STAGE=%DIST%\stage\nssm-%VER%"
set "ZIP=%DIST%\nssm-%VER%.zip"

echo === Staging
if exist "%DIST%\stage" rmdir /s /q "%DIST%\stage"
mkdir "%STAGE%\win32" 2>NUL
mkdir "%STAGE%\win64" 2>NUL
copy /y "%ROOT%build\out\x86\nssm.exe" "%STAGE%\win32\nssm.exe" >NUL || (echo ERROR: missing x86 exe & exit /b 1)
copy /y "%ROOT%build\out\x64\nssm.exe" "%STAGE%\win64\nssm.exe" >NUL || (echo ERROR: missing x64 exe & exit /b 1)
if exist "%ROOT%docs\manual.txt" copy /y "%ROOT%docs\manual.txt" "%STAGE%\README.txt" >NUL

echo === Zipping
if not exist "%DIST%" mkdir "%DIST%"
if exist "%ZIP%" del "%ZIP%"
powershell -NoProfile -Command "Compress-Archive -Path '%STAGE%' -DestinationPath '%ZIP%' -Force" || (echo ERROR: zip failed & exit /b 1)

echo === Checksum
powershell -NoProfile -Command "(Get-FileHash '%ZIP%' -Algorithm SHA256).Hash.ToLower() + '  nssm-%VER%.zip' | Set-Content -Encoding ascii '%ZIP%.sha256'"

rmdir /s /q "%DIST%\stage"

echo.
echo === Packaged: %ZIP%
type "%ZIP%.sha256"
endlocal
