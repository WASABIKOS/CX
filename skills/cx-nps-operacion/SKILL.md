---
name: cx-nps-operacion
description: "Trigger: CX NPS, CWP Excel, feedback_review.csv, recategorizar comentarios, actualizar dashboard. Mantén y ejecuta el flujo incremental del proyecto."
license: Apache-2.0
metadata:
  author: "WASABIKOS"
  version: "1.0"
---

## Activation Contract

Activa este skill cuando trabajes con el Excel `CWP*.xlsx`, categorías CX,
`feedback_review.csv`, el dashboard o el flujo diario de este repositorio.

## Hard Rules

- Usa `CW - Unique ID` como `feedback_key`; nunca lo cambies.
- Trata tNPS como segmentos de touchpoint: Pay (Invoice/Full Journey), Buy, Install (Full/Self), Change y Help (CC/Store/General/Technician).
- Para una recategorización manual o hecha por otro LLM, edita únicamente `category` en `outputs/feedback_review.csv`.
- Usa exactamente una categoría de `cx_taxonomy.py`; no inventes etiquetas.
- No edites el HTML generado ni `category_auto` directamente.
- Ejecuta `run_cx_nps.bat` después de editar el CSV; ese comando actualiza también la copia publicada.
- Mantén Excel, comentarios, CSV, JSON, cache y HTML fuera de Git.
- Si cambias reglas o taxonomía, incrementa `TAXONOMY_VERSION`.

## Decision Gates

| Situación | Acción |
|---|---|
| Excel nuevo | Colócalo en `input/` con nombre `CWP*.xlsx` y ejecuta el BAT. |
| Recategorización | Busca el `feedback_key`, cambia `category` y ejecuta el BAT. |
| Revisión solamente | Lee `feedback_review.csv`; no cambies archivos generados. |
| Cambio de código/taxonomía | Edita fuentes, valida y ejecuta el BAT. |

## Execution Steps

1. Lee `OPERACION_DIARIA.md` y verifica el estado de Git.
2. Identifica el Excel CWP más reciente en `input/`.
3. Para cada cambio solicitado, conserva `feedback_key`, comentario y `category_auto`.
4. Ejecuta `run_cx_nps.bat`. El pipeline reutiliza categorías sin cambios,
   recalcula solo registros nuevos/modificados y conserva fuentes manuales.
5. Verifica `outputs/classification_state.json`, las estadísticas de la corrida
   y que el HTML de trabajo y el publicado coincidan.

## Output Contract

Reporta: archivos modificados, `auto_reused`, `auto_recalculated`, cambios
manuales aplicados, dashboard publicado y cualquier validación fallida.

## References

- `../../OPERACION_DIARIA.md`
- `../../run_project.py`
- `../../run_cx_nps.bat`
- `../../cx_taxonomy.py`
