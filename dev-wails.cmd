@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0dev-wails.ps1" %*
