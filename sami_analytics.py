"""Privacy-safe aggregate analytics for SAMI conversation exports."""

from __future__ import annotations

import calendar
import re
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree


XML_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
REQUIRED_COLUMNS = {
    "CONVERSATIONID",
    "TELEFONO",
    "FECHA CREACION",
    "DERIVADO",
    "TIPO CLIENTE",
    "ACEPTO ENCUESTA",
    "PUNTUACION",
}
SEGMENT_ORDER = ("Fixed", "No identificado", "Postpaid", "Prepaid")


def discover_sami_input(root: Path) -> Path | None:
    """Return the newest optional SAMI export from the project's input folder."""
    candidates = []
    for pattern in ("SAMI*.xlsx", "Detalle de Análisis Conversaciones de IA*.xlsx"):
        candidates.extend((root / "input").glob(pattern))
    unique = {path.resolve(): path.stat().st_mtime for path in candidates}
    return max(unique, key=unique.get) if unique else None


def _cell_value(cell):
    if cell.get("t") == "inlineStr":
        return "".join(node.text or "" for node in cell.iter(XML_NS + "t")).strip()
    value = cell.find(XML_NS + "v")
    return (value.text or "").strip() if value is not None else ""


def _normalize(value):
    return " ".join(str(value or "").strip().lower().split())


def _segment(value):
    normalized = _normalize(value)
    return {
        "fixed": "Fixed",
        "postpaid": "Postpaid",
        "prepaid": "Prepaid",
        "no identificado": "No identificado",
    }.get(normalized, "No identificado")


def _excel_datetime(value):
    try:
        return datetime(1899, 12, 30) + timedelta(days=float(value))
    except (TypeError, ValueError, OverflowError):
        return None


def _new_bucket():
    return {
        "interactions": 0,
        "clients": set(),
        "derived": 0,
        "contained": 0,
        "accepted_surveys": 0,
        "promoters": 0,
        "neutrals": 0,
        "detractors": 0,
    }


def _add(bucket, phone, derived, accepted, score):
    bucket["interactions"] += 1
    if phone:
        bucket["clients"].add(phone)
    if derived == "si":
        bucket["derived"] += 1
    elif derived == "no":
        bucket["contained"] += 1
    if not accepted:
        return
    bucket["accepted_surveys"] += 1
    if score >= 9:
        bucket["promoters"] += 1
    elif score >= 7:
        bucket["neutrals"] += 1
    else:
        bucket["detractors"] += 1


def _finalize(bucket, **labels):
    interactions = bucket["interactions"]
    unique_clients = len(bucket["clients"])
    derivation_base = bucket["derived"] + bucket["contained"]
    accepted = bucket["accepted_surveys"]
    result = {
        **labels,
        "interactions": interactions,
        "unique_clients": unique_clients,
        "derived": bucket["derived"],
        "contained": bucket["contained"],
        "accepted_surveys": accepted,
        "promoters": bucket["promoters"],
        "neutrals": bucket["neutrals"],
        "detractors": bucket["detractors"],
        "containment_pct": round(bucket["contained"] * 100 / derivation_base, 2) if derivation_base else None,
        "derivation_pct": round(bucket["derived"] * 100 / derivation_base, 2) if derivation_base else None,
        "recontact_pct": round((interactions - unique_clients) * 100 / interactions, 2) if interactions else None,
        "nps": round((bucket["promoters"] - bucket["detractors"]) * 100 / accepted, 2) if accepted else None,
    }
    return result


def _first_worksheet(archive):
    sheets = sorted(
        name for name in archive.namelist()
        if re.fullmatch(r"xl/worksheets/sheet\d+\.xml", name)
    )
    if not sheets:
        raise ValueError("El Excel SAMI no contiene una hoja de datos legible.")
    return sheets[0]


def build_sami_dataset(input_path: Path):
    """Stream a SAMI XLSX and return aggregates without customer-level fields."""
    totals = defaultdict(_new_bucket)
    monthly = defaultdict(_new_bucket)
    daily = defaultdict(_new_bucket)
    quality = Counter()
    first_date = last_date = None
    headers = None
    positions = {}

    try:
        archive = zipfile.ZipFile(input_path)
    except (OSError, zipfile.BadZipFile) as error:
        raise ValueError(f"No pude leer el Excel SAMI: {error}") from error

    with archive:
        sheet_name = _first_worksheet(archive)
        with archive.open(sheet_name) as stream:
            for _, element in ElementTree.iterparse(stream, events=("end",)):
                if element.tag != XML_NS + "row":
                    continue
                cells = [_cell_value(cell) for cell in element.findall(XML_NS + "c")]
                if headers is None:
                    headers = cells
                    positions = {name: index for index, name in enumerate(headers)}
                    missing = sorted(REQUIRED_COLUMNS - positions.keys())
                    if missing:
                        raise ValueError(f"Columnas faltantes en el Excel SAMI: {missing}")
                    element.clear()
                    continue

                quality["source_rows"] += 1

                def get(name):
                    position = positions[name]
                    return cells[position] if position < len(cells) else ""

                created_at = _excel_datetime(get("FECHA CREACION"))
                if created_at is None:
                    quality["excluded_without_date"] += 1
                    element.clear()
                    continue

                segment = _segment(get("TIPO CLIENTE"))
                phone = get("TELEFONO")
                derived = _normalize(get("DERIVADO"))
                accepted_label = _normalize(get("ACEPTO ENCUESTA"))
                accepted = False
                score = None
                if accepted_label == "acepto":
                    try:
                        score = float(get("PUNTUACION"))
                    except (TypeError, ValueError):
                        quality["accepted_without_valid_score"] += 1
                    else:
                        if 0 <= score <= 10:
                            accepted = True
                        else:
                            quality["accepted_without_valid_score"] += 1

                if not phone:
                    quality["rows_without_client"] += 1
                if derived not in {"si", "no"}:
                    quality["rows_without_derivation"] += 1

                day = created_at.strftime("%Y-%m-%d")
                month = day[:7]
                for bucket in (totals["Total"], totals[segment], monthly[(month, "Total")], monthly[(month, segment)], daily[(day, "Total")], daily[(day, segment)]):
                    _add(bucket, phone, derived, accepted, score)
                quality["valid_dated_rows"] += 1
                first_date = created_at if first_date is None or created_at < first_date else first_date
                last_date = created_at if last_date is None or created_at > last_date else last_date
                element.clear()

    if headers is None:
        raise ValueError("El Excel SAMI está vacío.")

    def period_rows(buckets, label):
        return [
            _finalize(bucket, **{label: period}, segment=segment)
            for (period, segment), bucket in sorted(buckets.items())
        ]

    months = sorted({period for period, _ in monthly})
    partial_months = []
    for month in months:
        year, number = map(int, month.split("-"))
        first_day = first_date.day if first_date and month == first_date.strftime("%Y-%m") else 1
        last_day = last_date.day if last_date and month == last_date.strftime("%Y-%m") else calendar.monthrange(year, number)[1]
        if first_day > 1 or last_day < calendar.monthrange(year, number)[1]:
            partial_months.append(month)

    return {
        "source_file": input_path.name,
        "date_range": {
            "start": first_date.isoformat(timespec="seconds") if first_date else None,
            "end": last_date.isoformat(timespec="seconds") if last_date else None,
            "partial_months": partial_months,
        },
        "segments": list(SEGMENT_ORDER),
        "totals": [_finalize(totals[name], segment=name) for name in ("Total", *SEGMENT_ORDER)],
        "monthly": period_rows(monthly, "month"),
        "daily": period_rows(daily, "date"),
        "quality": dict(quality),
        "formulas": {
            "nps": "% promotores - % detractores; solo ACEPTO con puntuación 0-10",
            "containment": "No derivados / registros con DERIVADO Sí o No",
            "derivation": "Derivados / registros con DERIVADO Sí o No",
            "recontact": "(interacciones - clientes únicos) / interacciones",
        },
    }
