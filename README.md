# CX NPS Analytics

Pipeline de análisis de experiencia de cliente para exportes de Medallia/CWP
y conversaciones del bot SAMI. El proyecto normaliza respuestas rNPS y pNPS, calcula NPS por segmento,
clasifica comentarios en drivers CX y conserva el estado incremental de las
clasificaciones.

Para el uso diario en Windows, consulta [`OPERACION_DIARIA.md`](OPERACION_DIARIA.md).
Para que un LLM siga las mismas reglas, carga el skill compartido
`G:\My Drive\CORE\04_SHARED_SKILLS\cx-nps-operacion\SKILL.md` antes de editar
datos, categorías o dashboards. El repositorio conserva una copia portable en
[`skills/cx-nps-operacion/SKILL.md`](skills/cx-nps-operacion/SKILL.md).

## Componentes

- `incremental_feedback_classifier.py`: ingesta incremental desde Excel,
  normalización de comentarios, clasificación local y clasificación opcional
  mediante Ollama.
- `run_cx_nps.bat`: flujo diario de un solo clic en Windows.
- `run_project.py`: entrada portable que construye el dataset y el dashboard.
- `sami_analytics.py`: lectura progresiva y agregación privada del export SAMI.
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

En Windows, la operación diaria recomendada es colocar el Excel CWP y,
opcionalmente, un archivo `SAMI*.xlsx` o
`Detalle de Análisis Conversaciones de IA*.xlsx` en `input/`, y hacer doble clic
en `run_cx_nps.bat`. El archivo detecta los exportes más recientes, ejecuta todo
el proceso y abre el dashboard al terminar.

El programa detecta el Excel, calcula las métricas y clasifica los comentarios
con la taxonomía local. La clasificación automática es incremental: reutiliza
el resultado cuando coinciden el `CW - Unique ID`, el texto del comentario y
la versión de la taxonomía. Genera:

- `outputs/cx_nps_dashboard.html`: dashboard actualizado.
- `outputs/nps_data.json`: dataset local utilizado para construirlo.
- `outputs/feedback_review.csv`: comentarios en formato editable para revisión
  o recategorización manual.
- `outputs/classification_state.json`: estado local que evita recalcular
  comentarios sin cambios.

Para recategorizar un comentario, abre `outputs/feedback_review.csv` en Excel,
edita la columna `category` usando una categoría exacta de `cx_taxonomy.py`,
guarda el archivo y vuelve a ejecutar `run_cx_nps.bat`. La corrección se
conservará en el dashboard mientras coincida el `feedback_key`.

También puedes pedirle a tu LLM que edite directamente `category` en
`outputs/feedback_review.csv`, manteniendo `feedback_key` y usando una categoría
exacta de `cx_taxonomy.py`. Ejecuta después `run_cx_nps.bat` para aplicar el
cambio y actualizar el HTML publicado.

La segmentación del reporte separa pNPS en Internet, Mobile Contrato y Mobile
Prepago. tNPS se desglosa por touchpoint: Pay (Invoice/Full Journey), Buy,
Install (Full/Self), Change, Exit y Help (CC/Store/Technician, resuelto por `tHelp - Type`).

Cuando existe un export SAMI válido, la navegación añade `SAMI` inmediatamente
debajo de `rNPS / Relación`. Esta vista muestra NPS, encuestas aceptadas,
interacciones, clientes únicos, contención, derivación y recontacto por periodo
y segmento. Solo se guardan agregados: teléfonos, cuentas, identificadores y
comentarios SAMI no se incorporan al JSON ni al HTML.

Para elegir explícitamente un archivo o una carpeta de salida:

```powershell
python run_project.py `
  --input "C:\ruta\al\CWP_encuestas.xlsx" `
  --sami-input "C:\ruta\al\SAMI_conversaciones.xlsx" `
  --output-dir "outputs"
```

`incremental_feedback_classifier.py` permanece disponible como flujo separado
para experimentar con un modelo joblib local. El flujo recomendado para una
carpeta clonada es `run_project.py`, que usa la taxonomía vigente, conserva el
estado incremental y no depende de rutas absolutas ni de un modelo externo.

## Estado del repositorio

Este repositorio contiene el código y la documentación del proyecto. Los
datos y artefactos de una corrida concreta se mantienen en el entorno local
para proteger la información de clientes y permitir regenerarlos cuando sea
necesario.
