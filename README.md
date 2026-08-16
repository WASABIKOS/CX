# CX NPS Analytics

Pipeline de análisis de experiencia de cliente para exportes de Medallia/CWP.
El proyecto normaliza respuestas rNPS y pNPS, calcula NPS por segmento,
clasifica comentarios en drivers CX y conserva el estado incremental de las
clasificaciones.

## Componentes

- `incremental_feedback_classifier.py`: ingesta incremental desde Excel,
  normalización de comentarios, clasificación local y clasificación opcional
  mediante Ollama.
- `run_cx_nps.bat`: flujo diario de un solo clic en Windows.
- `run_project.py`: entrada portable que construye el dataset y el dashboard.
- `outputs/feedback_review.csv`: revisión local de comentarios y categorías.
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

Colocar el export de encuestas cuyo nombre empiece por `CWP` en la raíz del
proyecto (o dentro de `input/`) y ejecutar:

```powershell
python run_project.py
```

En Windows, la operación diaria recomendada es colocar el Excel en `input/` y
hacer doble clic en `run_cx_nps.bat`. El archivo detecta el Excel más reciente,
ejecuta todo el proceso y abre el dashboard al terminar.

El programa detecta el Excel, calcula las métricas, clasifica los comentarios
con la taxonomía local y genera:

- `outputs/cx_nps_dashboard.html`: dashboard actualizado.
- `outputs/nps_data.json`: dataset local utilizado para construirlo.
- `outputs/feedback_review.csv`: comentarios en formato editable para revisión
  o recategorización manual.

Para recategorizar un comentario, abre `outputs/feedback_review.csv` en Excel,
edita la columna `category` usando una categoría exacta de `cx_taxonomy.py`,
guarda el archivo y vuelve a ejecutar `run_cx_nps.bat`. La corrección se
conservará en el dashboard mientras coincida el `feedback_key`.

Para elegir explícitamente un archivo o una carpeta de salida:

```powershell
python run_project.py `
  --input "C:\ruta\al\CWP_encuestas.xlsx" `
  --output-dir "outputs"
```

`incremental_feedback_classifier.py` permanece disponible para el flujo
incremental con un modelo joblib local. El flujo recomendado para una carpeta
clonada es `run_project.py`, que no depende de rutas absolutas ni de un modelo
externo.

## Estado del repositorio

Este repositorio contiene el código y la documentación del proyecto. Los
datos y artefactos de una corrida concreta se mantienen en el entorno local
para proteger la información de clientes y permitir regenerarlos cuando sea
necesario.
