@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

set "ROOT=%~dp0"
set "INPUT_DIR=%ROOT%input"
set "OUTPUT_DIR=%ROOT%outputs"
set "INPUT_NAME="

if not exist "%INPUT_DIR%" mkdir "%INPUT_DIR%"
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

for /f "delims=" %%F in ('dir /b /a-d /o-d "%INPUT_DIR%\CWP*.xlsx" 2^>nul') do if not defined INPUT_NAME set "INPUT_NAME=%%F"

if not defined INPUT_NAME (
  echo No encontre un archivo CWP*.xlsx en:
  echo   %INPUT_DIR%
  echo.
  echo Coloca alli el Excel de encuestas y vuelve a ejecutar este archivo.
  pause
  exit /b 2
)

if exist "%ROOT%.venv\Scripts\python.exe" (
  set "PYTHON=%ROOT%.venv\Scripts\python.exe"
) else (
  where python >nul 2>&1
  if errorlevel 1 (
    echo No encontre Python. Instala Python o crea .venv en el proyecto.
    pause
    exit /b 3
  )
  set "PYTHON=python"
)

where node >nul 2>&1
if errorlevel 1 (
  echo No encontre Node.js, necesario para generar el dashboard.
  pause
  exit /b 4
)

echo Procesando:
echo   %INPUT_DIR%\%INPUT_NAME%
echo.
"%PYTHON%" "%ROOT%run_project.py" --input "%INPUT_DIR%\%INPUT_NAME%" --output-dir "%OUTPUT_DIR%"
if errorlevel 1 (
  echo.
  echo El proceso termino con errores. Revisa el mensaje anterior.
  pause
  exit /b 5
)

echo.
echo Proceso completado.
echo Dashboard: %OUTPUT_DIR%\cx_nps_dashboard.html
echo Comentarios para leer o recategorizar: %OUTPUT_DIR%\feedback_review.csv
echo Dataset local: %OUTPUT_DIR%\nps_data.json
echo Taxonomia editable: %ROOT%cx_taxonomy.py
echo.
start "" "%OUTPUT_DIR%\cx_nps_dashboard.html"
pause
