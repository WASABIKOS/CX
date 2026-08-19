import tempfile
import unittest
import zipfile
from datetime import datetime
from pathlib import Path

from sami_analytics import build_sami_dataset


HEADERS = [
    "CONVERSATIONID",
    "TELEFONO",
    "FECHA CREACION",
    "DERIVADO",
    "TIPO CLIENTE",
    "ACEPTO ENCUESTA",
    "PUNTUACION",
]


def excel_serial(value):
    return (value - datetime(1899, 12, 30)).total_seconds() / 86400


def cell(value):
    if isinstance(value, (int, float)):
        return f"<c><v>{value}</v></c>"
    escaped = str(value).replace("&", "&amp;").replace("<", "&lt;")
    return f'<c t="inlineStr"><is><t>{escaped}</t></is></c>'


def workbook(path, rows):
    xml_rows = ["<row>" + "".join(cell(value) for value in HEADERS) + "</row>"]
    xml_rows.extend("<row>" + "".join(cell(value) for value in row) + "</row>" for row in rows)
    sheet = (
        '<?xml version="1.0" encoding="utf-8"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        "<sheetData>" + "".join(xml_rows) + "</sheetData></worksheet>"
    )
    with zipfile.ZipFile(path, "w") as archive:
        archive.writestr("xl/worksheets/sheet1.xml", sheet)


class SamiAnalyticsTest(unittest.TestCase):
    def test_builds_privacy_safe_metrics(self):
        rows = [
            ["c1", "p1", excel_serial(datetime(2026, 4, 30, 10)), "No", "fixed", "ACEPTO", 10],
            ["c2", "p1", excel_serial(datetime(2026, 5, 1, 10)), "Si", "fixed", "NO ACEPTO", ""],
            ["c3", "p2", excel_serial(datetime(2026, 5, 1, 11)), "No", "prepaid", "ACEPTO", 0],
            ["c4", "p3", "", "", "No Identificado", "NO EJECUTO ENCUESTA", ""],
        ]
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "SAMI_test.xlsx"
            workbook(path, rows)
            data = build_sami_dataset(path)

        total = next(row for row in data["totals"] if row["segment"] == "Total")
        self.assertEqual(total["interactions"], 3)
        self.assertEqual(total["unique_clients"], 2)
        self.assertEqual(total["accepted_surveys"], 2)
        self.assertEqual(total["nps"], 0.0)
        self.assertEqual(total["containment_pct"], 66.67)
        self.assertEqual(total["recontact_pct"], 33.33)
        self.assertEqual(data["quality"]["excluded_without_date"], 1)
        self.assertEqual(data["date_range"]["partial_months"], ["2026-04", "2026-05"])
        self.assertNotIn("p1", str(data))
        self.assertNotIn("c1", str(data))


if __name__ == "__main__":
    unittest.main()
