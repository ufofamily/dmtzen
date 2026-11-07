@echo off
setlocal
cd /d "%~dp0"
if exist "%~dp0.bardo\runtime\node\node.exe" (
  "%~dp0.bardo\runtime\node\node.exe" "%~dp0scripts\bootstrap.mjs" %*
  goto finish
)
if exist "%~dp0..\.bardo\runtime\node\node.exe" (
  "%~dp0..\.bardo\runtime\node\node.exe" "%~dp0scripts\bootstrap.mjs" %*
  goto finish
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
:finish
if errorlevel 1 (echo BARDO startup failed. & pause & exit /b 1)
