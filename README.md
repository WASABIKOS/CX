# CX NPS Analytics

Pipeline de análisis de experiencia de cliente para exportes de Medallia/CWP.
El proyecto normaliza respuestas rNPS y pNPS, calcula NPS por segmento,
clasifica comentarios en drivers CX y conserva el estado incremental de las
clasificaciones.

## Componentes

- `incremental_feedback_classifier.py`: ingesta incremental desde Excel,
  normalización de comentarios, clasificación local y clasificación opcional
  mediante Ollama.
- `work/build_report.mjs`: genera el reporte Excel a partir del dataset
  normalizado local.
- `work/build_dashboard_html.mjs`: genera el dashboard HTML interactivo.
- `work/reclassify_current_feedback.py`: reclasificación reproducible de
  feedback usando la taxonomía CX vigente.
- `outputs/`: resultados generados localmente; está excluido del repositorio.

## Datos y privacidad

Los archivos de entrada, comentarios de clientes, identificadores de encuesta,
la base SQLite y los dashboards generados pueden contener información sensible.
No deben publicarse en este repositorio público. Las reglas de `.gitignore`
los mantienen fuera del control de versiones.

## Ejecución local

Instalar dependencias Python:

```powershell
python -m pip install -r requirements.txt
```

Ejecutar la clasificación incremental proporcionando las rutas locales del
export de Medallia y del modelo:

```powershell
python incremental_feedback_classifier.py `
  --input "C:\ruta\al\export_medallia.xlsx" `
  --local-model "C:\ruta\al\CAT_CX_MODEL.pkl" `
  --db "outputs\feedback_classifications.sqlite"
```

La clasificación con Ollama es opcional y se activa con `--ollama-limit`.

## Estado del repositorio

Este repositorio contiene el código y la documentación del proyecto. Los
datos y artefactos de una corrida concreta se mantienen en el entorno local
para proteger la información de clientes y permitir regenerarlos cuando sea
necesario.
