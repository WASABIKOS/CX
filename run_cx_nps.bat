@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

set "ROOT=%~dp0"
set "INPUT_DIR=%ROOT%input"
set "OUTPUT_DIR=%ROOT%outputs"
rem Copia estable que consumen los usuarios del reporte publicado.
set "PUBLISHED_DIR=%OUTPUT_DIR%\medallia_cx_nps_2026-08-14"
set "PUBLISHED_DASHBOARD=%PUBLISHED_DIR%\medallia_cx_nps_dashboard.html"
set "INPUT_NAME="
set "SAMI_NAME="

if not exist "%INPUT_DIR%" mkdir "%INPUT_DIR%"
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
if not exist "%PUBLISHED_DIR%" mkdir "%PUBLISHED_DIR%"

for /f "delims=" %%F in ('dir /b /a-d /o-d "%INPUT_DIR%\CWP*.xlsx" 2^>nul') do if not defined INPUT_NAME set "INPUT_NAME=%%F"
for /f "delims=" %%F in ('dir /b /a-d /o-d "%INPUT_DIR%\SAMI*.xlsx" 2^>nul') do if not defined SAMI_NAME set "SAMI_NAME=%%F"
for /f "delims=" %%F in ('dir /b /a-d /o-d "%INPUT_DIR%\Detalle de Análisis Conversaciones de IA*.xlsx" 2^>nul') do if not defined SAMI_NAME set "SAMI_NAME=%%F"

if not defined INPUT_NAME (
  echo No encontre un archivo CWP*.xlsx en:
  echo   %INPUT_DIR%
  echo.
  echo Coloca alli el Excel de encuestas y vuelve a ejecutar este archivo.
  pause
  exit /b 2
)

set "PYTHON="
if exist "%ROOT%.venv\Scripts\python.exe" set "PYTHON=%ROOT%.venv\Scripts\python.exe"
if not defined PYTHON (
  where py >nul 2>&1
  if not errorlevel 1 (
    echo Creando el entorno local de Python por primera vez...
    py -3 -m venv "%ROOT%.venv"
    if errorlevel 1 (
      echo No pude crear el entorno Python.
      pause
      exit /b 3
    )
    set "PYTHON=%ROOT%.venv\Scripts\python.exe"
  )
)
if not defined PYTHON (
  where python >nul 2>&1
  if errorlevel 1 (
    echo No encontre Python. Instala Python 3 y vuelve a ejecutar este archivo.
    pause
    exit /b 3
  )
  set "PYTHON=python"
)

if not exist "%ROOT%.venv\.cx_nps_ready" (
  echo Instalando dependencias del proyecto por primera vez...
  "%PYTHON%" -m pip install -r "%ROOT%requirements.txt"
  if errorlevel 1 (
    echo No pude instalar las dependencias Python.
    pause
    exit /b 3
  )
  >"%ROOT%.venv\.cx_nps_ready" echo ready
)

where node >nul 2>&1
if errorlevel 1 (
  echo No encontre Node.js, necesario para generar el dashboard.
  pause
  exit /b 4
)

echo Procesando:
echo   %INPUT_DIR%\%INPUT_NAME%
if defined SAMI_NAME echo   SAMI: %INPUT_DIR%\%SAMI_NAME%
if not defined SAMI_NAME echo   SAMI: no se encontro un Excel opcional en input
echo.
if defined SAMI_NAME (
  "%PYTHON%" "%ROOT%run_project.py" --input "%INPUT_DIR%\%INPUT_NAME%" --sami-input "%INPUT_DIR%\%SAMI_NAME%" --output-dir "%OUTPUT_DIR%"
) else (
  "%PYTHON%" "%ROOT%run_project.py" --input "%INPUT_DIR%\%INPUT_NAME%" --output-dir "%OUTPUT_DIR%"
)
if errorlevel 1 (
  echo.
  echo El proceso termino con errores. Revisa el mensaje anterior.
  pause
  exit /b 5
)

copy /Y "%OUTPUT_DIR%\cx_nps_dashboard.html" "%PUBLISHED_DASHBOARD%" >nul
if errorlevel 1 (
  echo.
  echo No pude actualizar el dashboard publicado.
  pause
  exit /b 6
)

echo.
echo Proceso completado.
echo Dashboard de trabajo: %OUTPUT_DIR%\cx_nps_dashboard.html
echo Dashboard publicado: %PUBLISHED_DASHBOARD%
echo Comentarios para leer o recategorizar: %OUTPUT_DIR%\feedback_review.csv
echo Estado incremental de categorias: %OUTPUT_DIR%\classification_state.json
echo Dataset local: %OUTPUT_DIR%\nps_data.json
echo Taxonomia editable: %ROOT%cx_taxonomy.py
echo.
start "" "%PUBLISHED_DASHBOARD%"
pause
