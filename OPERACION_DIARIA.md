# Operación diaria de CX NPS

Esta guía describe el flujo normal después de clonar el repositorio: colocar
el export de encuestas, ejecutar un archivo y revisar el dashboard actualizado.

## Ruta rápida

1. Coloca el Excel cuyo nombre empieza por `CWP` en `input/`.
2. Haz doble clic en [`run_cx_nps.bat`](run_cx_nps.bat).
3. Abre `outputs/cx_nps_dashboard.html`; el archivo se abre automáticamente al terminar.

El `.bat` conserva el dashboard de trabajo y copia la versión lista para usuarios en
`outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html`. Esa es la ruta
publicada que debe revisarse o refrescarse después de cada actualización.

El `.bat` toma el Excel CWP más reciente de `input/`. No es necesario abrir
Python, Node.js ni los scripts internos durante la operación diaria.

## Primera configuración

El equipo debe tener instalado:

- Python 3.
- Node.js.

En el primer uso, `run_cx_nps.bat` crea `.venv` e instala las dependencias de
`requirements.txt`. Las ejecuciones siguientes reutilizan ese entorno.

## Archivos de entrada y salida

| Ubicación | Uso |
|---|---|
| `input/CWP*.xlsx` | Export actual de encuestas Medallia/CWP. |
| `outputs/cx_nps_dashboard.html` | Dashboard HTML actualizado y navegable. |
| `outputs/medallia_cx_nps_2026-08-14/medallia_cx_nps_dashboard.html` | Copia publicada que consumen los usuarios. |
| `outputs/feedback_review.csv` | Comentarios y categorías para revisión manual. |
| `outputs/classification_state.json` | Estado incremental por `feedback_key` y hash del comentario. |
| `outputs/nps_data.json` | Dataset local usado para construir el dashboard. |
| `outputs/nps_acumulado_diario.xlsx` | Excel operativo por día: una hoja por mes, con bloques Fijo, Contrato y Prepago. El mes más reciente aparece primero. |
| `cx_taxonomy.py` | Categorías válidas y reglas de clasificación local. |

Los archivos de `input/` y `outputs/` son locales y están excluidos de GitHub.

## Excel acumulado diario

Cada ejecución normal también genera `outputs/nps_acumulado_diario.xlsx` y lo
copia junto al HTML publicado. El libro toma las fechas y resultados del CWP:

- cada hoja corresponde a un mes, con el más reciente primero;
- incluye bloques separados para Fijo, Contrato y Prepago;
- por día muestra muestras, promotores, neutrales, detractores, NPS diario y
  acumulados calculados en el propio Excel;
- el HTML ofrece **Exportar Excel acumulado** para abrir o descargar la copia
  que corresponde al reporte publicado.

## Recategorización manual

1. Abre `outputs/feedback_review.csv` en Excel.
2. Busca el comentario que quieres corregir.
3. Cambia únicamente la columna `category`.
4. Usa exactamente una categoría definida en `cx_taxonomy.py`.
5. No cambies `feedback_key`.
6. Guarda el CSV.
7. Ejecuta nuevamente `run_cx_nps.bat`.

El proceso conserva la categoría manual usando `feedback_key`. Los comentarios
nuevos se clasifican automáticamente y las correcciones existentes se vuelven
a aplicar cuando el mismo feedback siga presente.

El archivo `feedback_review.csv` también puede ser editado por un LLM local o
por otra herramienta automatizada. Debe modificar únicamente `category`, usar
una categoría exacta de `cx_taxonomy.py` y conservar `feedback_key`. Después se
ejecuta `run_cx_nps.bat`; el cambio queda guardado y se refleja en el HTML de
trabajo y en la copia publicada para usuarios.

El proceso no vuelve a ejecutar la clasificación automática para comentarios
que ya tienen el mismo `feedback_key`, el mismo texto y la misma versión de la
taxonomía. Si el comentario cambia, si aparece uno nuevo o si cambia la
taxonomía, se recalcula automáticamente.

La navegación del dashboard separa pNPS en Internet, Mobile Contrato y Mobile
Prepago. tNPS se separa por touchpoint y subtipo: Pay (Invoice/Full Journey),
Buy, Install (Full/Self), Change, Exit y Help (CC/Store/Technician, resuelto por `tHelp - Type`).

## Si hay más de un Excel

El `.bat` procesa automáticamente el archivo CWP con fecha de modificación más
reciente. Para elegir otro archivo de forma explícita:

```powershell
python run_project.py `
  --input "input\CWP_encuestas_2026-08-15.xlsx" `
  --output-dir "outputs"
```

## Si algo falla

- Si indica que no encuentra un Excel, revisa que esté en `input/` y comience
  por `CWP`.
- Si indica que falta Python o Node.js, instala el componente señalado y vuelve
  a ejecutar el `.bat`.
- Si el dashboard no refleja una recategorización, verifica que la categoría
  esté escrita exactamente y que `feedback_key` no haya sido modificado.
- No edites `outputs/nps_data.json` manualmente; la superficie de revisión es
  `outputs/feedback_review.csv`.

## Privacidad

El HTML, el CSV de revisión y el JSON pueden contener comentarios e
identificadores de clientes. Deben permanecer en el equipo local y no deben
subirse al repositorio público.
