\# NPS CX — Documentación del proyecto

\*\*Organización:\*\* CWP    
\*\*Fecha de documentación:\*\* 15 de agosto de 2026    
\*\*Dataset activo:\*\* \`cwp\_nps\_responses\_2026-08-14 10\_16\_11.xlsx\`    
\*\*Período cubierto:\*\* Abril 2025 – Agosto 2026 (17 meses)

\---

\#\# Descripción general

Pipeline de análisis de Voz del Cliente (VoC) que transforma el export de Medallia en dos artefactos operativos:

1\. \*\*Dashboard HTML interactivo\*\* — lectura ejecutiva y drivers accionables por segmento de producto.  
2\. \*\*Reporte Excel\*\* — base auditable con resumen ejecutivo, mapeo de columnas y muestra normalizada.

El pipeline ingesta el XLSX de Medallia, normaliza y segmenta cada respuesta, clasifica los comentarios con dos clasificadores independientes y persiste todo en SQLite para ejecuciones incrementales.

\---

\#\# Estado actual del dataset

| Métrica | Valor |  
|---|---|  
| Respuestas activas con comentario | 11,111 |  
| Período | Abr 2025 – Ago 2026 |  
| NPS global | \*\*−26.6\*\* |  
| Promotores | 3,077 (27.7 %) |  
| Neutros | 1,995 (18.0 %) |  
| Detractores | 6,025 (54.3 %) |  
| Sin score | 14 |

\#\#\# Distribución por segmento de producto

| Segmento | Respuestas |  
|---|---|  
| pNPS Internet | 3,595 |  
| pNPS Mobile – Prepago | 3,173 |  
| pNPS Mobile – Contrato | 2,453 |  
| rNPS / Relación | 1,887 |  
| No clasificado | 3 |

\---

\#\# Estructura del proyecto

\`\`\`  
NPS CX/  
├── incremental\_feedback\_classifier.py   \# Script principal de ingesta y clasificación  
├── PROYECTO.md                          \# Este archivo  
│  
├── outputs/  
│   └── medallia\_cx\_nps\_2026-08-14/  
│       ├── medallia\_cx\_nps\_dashboard.html      \# Dashboard interactivo (HTML auto-contenido)  
│       ├── medallia\_cx\_nps\_report.xlsx         \# Reporte Excel (4 hojas)  
│       ├── feedback\_classifications.sqlite     \# Base de datos incremental  
│       ├── dashboard.png                       \# Captura del dashboard (hoja Excel)  
│       └── medallia\_cx\_nps\_dashboard\_qr.png    \# QR para compartir el dashboard  
│  
└── work/  
    ├── nps\_data.json                    \# Datos procesados intermedios (input del dashboard)  
    ├── reclassify\_current\_feedback.py   \# Reclasificador manual determinístico (cx\_manual)  
    ├── build\_report.mjs                 \# Generador del reporte Excel  
    ├── build\_dashboard\_clean.mjs        \# Generador del dashboard HTML  
    └── \*.mjs                            \# Scripts de patching y mejoras del dashboard  
\`\`\`

\---

\#\# Fuente de datos

\*\*Sistema:\*\* Medallia    
\*\*Archivo esperado:\*\* XLSX exportado desde Medallia, con las siguientes columnas requeridas:

| Columna fuente | Uso |  
|---|---|  
| \`ID de encuesta\` | Clave primaria de la respuesta |  
| \`CW \- Unique ID\` | Clave alternativa si no hay ID de encuesta |  
| \`Customer Response Date (EST)\` | Fecha de respuesta (se toma solo \`YYYY-MM-DD\`) |  
| \`Survey Type\` | \`rNPS\` o \`pNPS\` — determina el segmento de producto |  
| \`Plan Type\` | Distingue Internet, Contrato y Prepago dentro de pNPS |  
| \`Broadband RGU\` | Confirma que hay servicio residencial activo para pNPS Internet |  
| \`Probabilidad de Recomendar\` | Score NPS para rNPS (0–10) |  
| \`Internet \- Likelihood to Recommend\` | Score NPS para pNPS Internet (0–10) |  
| \`Mobile \- Likelihood to Recommend\` | Score NPS para pNPS Mobile (0–10) |  
| \`rNPS \- Overall Satisfaction comment\` | Comentario libre de rNPS |  
| \`Internet Additional Comments\` | Comentario adicional de Internet |  
| \`Phone Mobile Catchall Comment\` | Comentario adicional de Mobile |

\> El script falla explícitamente con lista de columnas faltantes si alguna de estas no está presente en el archivo.

Los tres campos de comentario se concatenan con \` | \` para formar el comentario unificado de cada respuesta. Solo se procesa una respuesta si tiene al menos un comentario no vacío.

\---

\#\# Lógica de segmentación de producto

La asignación de segmento y score se hace en \`incremental\_feedback\_classifier.py\` según las siguientes reglas, en orden de precedencia:

| Segmento | Condición | Columna de score |  
|---|---|---|  
| \`rNPS / Relación\` | \`Survey Type \= rNPS\` | \`Probabilidad de Recomendar\` |  
| \`pNPS Internet\` | \`Survey Type \= pNPS\` \+ \`Plan Type \= Servicio residencial\` \+ \`Broadband RGU ≠ "" y ≠ "0"\` | \`Internet \- Likelihood to Recommend\` |  
| \`pNPS Mobile – Contrato\` | \`Survey Type \= pNPS\` \+ \`"contrato"\` en \`Plan Type\` | \`Mobile \- Likelihood to Recommend\` |  
| \`pNPS Mobile – Prepago\` | \`Survey Type \= pNPS\` \+ \`"prepago"\` en \`Plan Type\` | \`Mobile \- Likelihood to Recommend\` |  
| \`No clasificado\` | Ninguna condición anterior aplica | — |

\*\*Clasificación NPS:\*\* score ≥ 9 → Promotor · score 7–8 → Neutro · score 0–6 → Detractor · score nulo o no numérico → Sin score.

\*\*Fórmula NPS:\*\* \`(Promotores − Detractores) / Respuestas con score × 100\`

\---

\#\# Base de datos incremental (\`feedback\_classifications.sqlite\`)

\#\#\# Esquema

\*\*\`responses\`\*\* — Una fila por respuesta activa del archivo fuente.

| Columna | Tipo | Descripción |  
|---|---|---|  
| \`survey\_key\` | TEXT PK | ID de encuesta o CW Unique ID |  
| \`survey\_id\` | TEXT | ID de encuesta original |  
| \`cw\_unique\_id\` | TEXT | CW Unique ID original |  
| \`response\_date\` | TEXT | Fecha de respuesta (\`YYYY-MM-DD\`) |  
| \`survey\_type\` | TEXT | \`rNPS\` o \`pNPS\` |  
| \`plan\_type\` | TEXT | Plan según Medallia |  
| \`product\_segment\` | TEXT | Segmento asignado por las reglas del pipeline |  
| \`nps\_class\` | TEXT | \`Promotor\`, \`Neutro\`, \`Detractor\` o \`Sin score\` |  
| \`score\` | REAL | Score 0–10 o NULL |  
| \`comment\` | TEXT | Comentario concatenado de las tres columnas fuente |  
| \`comment\_hash\` | TEXT | SHA-256 del comentario (detecta cambios) |  
| \`source\_file\` | TEXT | Ruta del XLSX de origen |  
| \`source\_mtime\` | REAL | Timestamp de modificación del archivo fuente |  
| \`active\` | INTEGER | \`1\` \= presente en el último archivo cargado · \`0\` \= ya no aparece |  
| \`first\_seen\_at\` | TEXT | ISO 8601 UTC de la primera carga |  
| \`last\_seen\_at\` | TEXT | ISO 8601 UTC de la última actualización |

\*\*\`classifications\`\*\* — Clasificación activa de cada respuesta por clasificador.

| Columna | Descripción |  
|---|---|  
| \`survey\_key\` \+ \`classifier\` | PK compuesta |  
| \`classifier\` | \`local\`, \`ollama\` o \`cx\_manual\` |  
| \`model\_version\` | Versión del modelo o ruleset usado |  
| \`comment\_hash\` | Hash del comentario en el momento de clasificar |  
| \`category\` | Categoría asignada o NULL si falló |  
| \`status\` | \`classified\`, \`invalid\_response\`, \`error\` |  
| \`classified\_at\` | ISO 8601 UTC |

\*\*\`classification\_history\`\*\* — Historial completo de reclasificaciones (nunca se borra).

\#\#\# Lógica incremental

Cada ejecución de \`incremental\_feedback\_classifier.py\`:  
1\. Pone \`active \= 0\` a todas las filas existentes.  
2\. Lee el XLSX y hace upsert de cada respuesta con comentario: si el \`comment\_hash\` cambió, registra como \`changed\`; si no existía, \`new\`; si es igual, \`unchanged\`.  
3\. Solo reclasifica con el modelo local las respuestas cuyo hash cambió o cuya versión de modelo difiere.  
4\. El clasificador Ollama es opcional (se activa con \`--ollama-limit N \> 0\`).

\---

\#\# Clasificadores

\#\#\# Clasificador \`local\` (ML)

\- \*\*Modelo:\*\* \`CAT\_CX\_MODEL\_V4\_2\_SINTETICO.pkl\` — pipeline scikit-learn con vectorizador TF-IDF \+ clasificador supervisado, entrenado sobre datos sintéticos de telecomunicaciones.  
\- \*\*Clave en el paquete:\*\* \`motivo\_v1\`  
\- \*\*Taxonomía (15 categorías):\*\*  
  \- Bajas y cancelaciones  
  \- Compra, activación y portabilidad  
  \- Cuenta, titularidad y app  
  \- Facturación, pagos y crédito  
  \- Fallas de internet residencial  
  \- Fallas de servicio móvil  
  \- Mudanza, instalación y visita  
  \- Otros motivos y derivaciones  
  \- Planes y cambios de plan  
  \- Recargas y paquetes prepago  
  \- Roaming internacional  
  \- SIM y eSIM  
  \- Saldo y consumo  
  \- Sin motivo o abandono temprano  
  \- TV y control remoto

\> \*\*Nota:\*\* En el dataset actual el clasificador \`local\` asigna el 76.8 % de comentarios a "Otros motivos y derivaciones". Esto sugiere que el modelo entrenado con datos sintéticos no cubre bien el vocabulario real de CWP. Se recomienda reentrenar con comentarios reales etiquetados.

\#\#\# Clasificador \`cx\_manual\` (reglas determinísticas)

\- \*\*Script:\*\* \`work/reclassify\_current\_feedback.py\`  
\- \*\*Versión:\*\* \`cx\_drivers\_v1\_manual\`  
\- \*\*Taxonomía (16 categorías orientadas a drivers de queja CX):\*\*  
  \- Precio y valor percibido  
  \- Facturación, cobros y pagos  
  \- Red, cobertura y señal móvil  
  \- Internet residencial: estabilidad y caídas  
  \- Velocidad y datos móviles  
  \- Wi-Fi y cobertura dentro del hogar  
  \- Atención al cliente y canales  
  \- Soporte técnico y resolución  
  \- Planes, paquetes y promociones  
  \- Instalación, migración y activación  
  \- Cuenta, app y autogestión  
  \- Cancelación y retención  
  \- TV y entretenimiento  
  \- Roaming, llamadas y mensajería  
  \- Comentario positivo / sin queja  
  \- Otros / no especificado

\- Aplica reglas de regex en orden de precedencia (cancelación y precio antes que términos de servicio genéricos).  
\- Normaliza acentos antes de comparar.  
\- No depende de ningún servicio externo — resultado 100 % reproducible.  
\- Actualiza tanto \`nps\_data.json\` (campo \`category\`) como la tabla \`classifications\` del SQLite.

\#\#\# Clasificador \`ollama\` (LLM local, opcional)

\- Llama a \`http://127.0.0.1:11434/api/generate\` (Ollama local).  
\- Modelo por defecto: \`qwen2.5-coder:1.5b\`.  
\- Solo se ejecuta si \`--ollama-limit N \> 0\`.  
\- Responde con el nombre exacto de una de las 15 categorías del clasificador \`local\`; si la respuesta no coincide, se guarda como \`invalid\_response\`.  
\- Útil para validar manualmente los resultados del modelo \`local\`.

\---

\#\# Dashboard interactivo (\`medallia\_cx\_nps\_dashboard.html\`)

Archivo HTML auto-contenido (todos los datos embebidos como constantes JS). Se abre directamente en el navegador sin servidor.

\#\#\# Navegación y filtros

\- \*\*Sidebar izquierdo:\*\* botones de segmento (Total \+ 4 segmentos de producto). Cambia todo el dashboard al segmento seleccionado.  
\- \*\*Barra de filtros (sticky):\*\* Mes · Categoría de feedback · Clasificación NPS · botón Limpiar filtros.

\#\#\# Secciones del dashboard

| Sección | Descripción |  
|---|---|  
| \*\*Tarjetas de meta 2026\*\* | NPS actual acumulado 2026, meta del segmento y brecha. |  
| \*\*Lectura ejecutiva \+ Alerta activa\*\* | Síntesis automática del NPS y mayor driver de quejas del último mes. |  
| \*\*KPIs\*\* | NPS · Promotores · Neutros · Detractores · Feedbacks con comentario. |  
| \*\*Evolución mensual NPS \+ Muestras\*\* | Barras del NPS mensual (escala −100 a \+100) y volumen de respuestas con variación Δ vs mes anterior. |  
| \*\*TOP 3 de quejas por mes\*\* | Las tres categorías con más feedbacks de detractores por mes, excluyendo "Otros / no especificado". |  
| \*\*Evolución mensual de categorías\*\* | Barras apiladas que muestran el peso relativo de cada categoría por mes. Filtrable por categoría individual. |  
| \*\*Cascada del cambio de NPS\*\* | Waterfall que descompone el cambio de NPS entre dos meses seleccionables por categoría de feedback. |  
| \*\*Distribución NPS\*\* | Donut chart \+ leyenda con porcentajes y conteos de Promotores, Neutros y Detractores. |  
| \*\*Drivers y dolores\*\* | Barras horizontales con las 8 categorías con más feedbacks y su peso relativo. |  
| \*\*Comentarios representativos\*\* | 6 comentarios de la selección actual con etiquetas de clase NPS y categoría. |  
| \*\*Buscar comentarios\*\* | Búsqueda full-text en tiempo real sobre los feedbacks filtrados, con resaltado del término. |

\#\#\# Metas 2026 por segmento (hardcoded en el dashboard)

| Segmento | Meta NPS 2026 |  
|---|---|  
| rNPS / Relación | 0.0 |  
| pNPS Mobile – Prepago | \+4.9 |  
| pNPS Mobile – Contrato | −1.1 |  
| pNPS Internet | −7.7 |

\---

\#\# Reporte Excel (\`medallia\_cx\_nps\_report.xlsx\`)

Generado por \`work/build\_report.mjs\` usando \`@oai/artifact-tool\` (Artifact Tool de Claude).

| Hoja | Contenido |  
|---|---|  
| \*\*Dashboard\*\* | Tabla resumen por segmento con NPS, Promotores, Neutros, Detractores y score promedio. Gráfico de línea de evolución mensual. Tabla de reglas de segmentación. |  
| \*\*Column Mapping\*\* | Mapeo detallado de columnas fuente → columnas normalizadas con reglas. Lista de todas las columnas detectadas en el export. |  
| \*\*Sample 10\*\* | 10 filas normalizadas de ejemplo con todos los campos del pipeline. |  
| \*\*Normalized Data\*\* | Mismas 10 filas de ejemplo con nota sobre el total real de respuestas procesadas. |

\---

\#\# Flujo de ejecución completo

\`\`\`  
1\. Exportar desde Medallia  
   └── cwp\_nps\_responses\_YYYY-MM-DD HH\_MM\_SS.xlsx  
       (ubicación esperada: C:\\Claude\\NPS\\)

2\. Clasificación e ingesta incremental  
   └── python incremental\_feedback\_classifier.py  
       \--input  "C:\\Claude\\NPS\\cwp\_nps\_responses\_2026-08-14 10\_16\_11.xlsx"  
       \--db     "outputs\\medallia\_cx\_nps\_2026-08-14\\feedback\_classifications.sqlite"  
       \--local-model "C:\\Claude\\MODEL\\CAT\_CX\_MODEL\_V4\_2\_SINTETICO.pkl"  
       \[--ollama-limit 500\]   \# opcional, 0 desactiva Ollama

3\. Reclasificación con taxonomía CX orientada a drivers  
   └── python work\\reclassify\_current\_feedback.py  
       (actualiza nps\_data.json y la tabla classifications del SQLite)

4\. Generación del dashboard HTML (requiere Claude Code con Artifact Tool)  
   └── claude build\_dashboard\_clean.mjs

5\. Generación del reporte Excel (requiere Claude Code con Artifact Tool)  
   └── claude build\_report.mjs  
\`\`\`

\> Los pasos 4 y 5 utilizan \`@oai/artifact-tool\`, disponible únicamente dentro del entorno de Claude Code.

\---

\#\# Dependencias

\#\#\# Python

| Paquete | Uso |  
|---|---|  
| \`openpyxl\` | Lectura del XLSX de Medallia |  
| \`joblib\` | Carga del modelo ML (\`.pkl\`) |  
| \`scikit-learn\` | Runtime del pipeline TF-IDF \+ clasificador |  
| \`sqlite3\` | Incluido en stdlib — persistencia incremental |

\#\#\# Node.js (solo para generación de artefactos)

| Paquete | Uso |  
|---|---|  
| \`@oai/artifact-tool\` | Workbook Excel y render PNG (disponible en Claude Code) |  
| \`node:fs/promises\` | Lectura/escritura de archivos |

\#\#\# Archivos de datos externos

| Ruta | Descripción |  
|---|---|  
| \`C:\\Claude\\NPS\\cwp\_nps\_responses\_\*.xlsx\` | Export de Medallia (input) |  
| \`C:\\Claude\\MODEL\\CAT\_CX\_MODEL\_V4\_2\_SINTETICO.pkl\` | Modelo ML de clasificación local |

\---

\#\# Conocidos / deuda técnica

| Ítem | Descripción |  
|---|---|  
| \*\*Modelo local bajo recall\*\* | El clasificador \`local\` pone el 76.8 % en "Otros motivos y derivaciones". El modelo fue entrenado con datos sintéticos; reentrenar con comentarios reales etiquetados mejoraría sustancialmente la distribución. |  
| \*\*Rutas hardcodeadas\*\* | \`incremental\_feedback\_classifier.py\` y \`reclassify\_current\_feedback.py\` tienen rutas absolutas de Windows. Considerar parámetros CLI o archivo de configuración para portabilidad. |  
| \*\*Metas 2026 embebidas\*\* | Los valores de meta NPS están hardcodeados en \`build\_dashboard\_clean.mjs\`. Extraer a un objeto de configuración separado facilita actualización anual. |  
| \*\*Hoja "Normalized Data" incompleta\*\* | La hoja muestra solo 10 filas en lugar de la base completa. La limitación viene de \`build\_report.mjs\`; se puede extender pero incrementaría el tamaño del XLSX notablemente. |  
| \*\*Forecast deshabilitado\*\* | La sección de forecast 2026 existe en el código pero está oculta (\`display:none\`). Se puede rehabilitar removiendo ese estilo en \`build\_dashboard\_clean.mjs\`. |