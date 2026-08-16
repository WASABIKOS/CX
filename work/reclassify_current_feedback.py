import hashlib
import json
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(r"C:\Users\1872488\Documents\ChatGPT\NPS CX")
JSON_PATH = ROOT / "work" / "nps_data.json"
DB_PATH = ROOT / "outputs" / "medallia_cx_nps_2026-08-14" / "feedback_classifications.sqlite"
VERSION = "cx_drivers_v1_manual"

TAXONOMY = [
    "Precio y valor percibido",
    "Facturación, cobros y pagos",
    "Red, cobertura y señal móvil",
    "Internet residencial: estabilidad y caídas",
    "Velocidad y datos móviles",
    "Wi-Fi y cobertura dentro del hogar",
    "Atención al cliente y canales",
    "Soporte técnico y resolución",
    "Planes, paquetes y promociones",
    "Instalación, migración y activación",
    "Cuenta, app y autogestión",
    "Cancelación y retención",
    "TV y entretenimiento",
    "Roaming, llamadas y mensajería",
    "Comentario positivo / sin queja",
    "Otros / no especificado",
]


def norm(text):
    text = str(text or "").lower()
    text = text.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ü", "u")
    return re.sub(r"\s+", " ", text).strip()


def has(text, patterns):
    return any(re.search(pattern, text) for pattern in patterns)


def categorize(comment, segment=""):
    t = norm(comment)
    s = norm(segment)
    if not t:
        return "Otros / no especificado"

    # Specific customer pain points take precedence over generic service terms.
    rules = [
        ("Cancelación y retención", [r"cancel", r"dar de baja", r"desconectar", r"irme", r"cambiarme", r"cambiar de compan", r"no me quiero quedar"]),
        ("Precio y valor percibido", [r"caro", r"cara", r"cost[oa]", r"precio", r"precios", r"aumentaron", r"subieron", r"alto costo", r"valor", r"econ[oó]mico", r"pago mucho"]),
        ("Facturación, cobros y pagos", [r"factur", r"cobro", r"cobran", r"deuda", r"pagar", r"pago", r"recibo", r"cargo", r"mora", r"vencid", r"duplicad"]),
        ("Atención al cliente y canales", [r"atencion", r"cliente", r"call center", r"agente", r"tienda", r"sucursal", r"telefono", r"contactar", r"no contest", r"demoran", r"trato"]),
        ("Soporte técnico y resolución", [r"tecnico", r"repar", r"report", r"resolver", r"solucion", r"no resuel", r"visita", r"cita", r"da[nñ]o", r"problema reportado"]),
        ("Planes, paquetes y promociones", [r"plan", r"paquete", r"promoc", r"oferta", r"contrato", r"megas", r"ilimitad", r"dias de data", r"beneficio"]),
        ("Wi-Fi y cobertura dentro del hogar", [r"wifi", r"wi fi", r"wi-fi", r"router", r"modem", r"habitacion", r"cuarto", r"casa", r"no llega", r"repetidor", r"cobertura.*casa"]),
        ("Velocidad y datos móviles", [r"data", r"datos", r"lento", r"lenta", r"velocidad", r"megabit", r"mbps", r"internet movil", r"naveg", r"4g", r"5g"]),
        ("Red, cobertura y señal móvil", [r"se[nñ]al", r"cobertura", r"red", r"antena", r"llamada", r"no disponible", r"se cae la senal", r"sin servicio"]),
        ("Internet residencial: estabilidad y caídas", [r"internet", r"conexion", r"conexi[oó]n", r"se cae", r"cae mucho", r"inestable", r"fluctua", r"pausa", r"intermitente", r"fibra optica"]),
        ("Cuenta, app y autogestión", [r"app", r"aplicacion", r"cuenta", r"clave", r"contrase[nñ]a", r"correo", r"iniciar sesion", r"portal", r"online"]),
        ("Instalación, migración y activación", [r"instal", r"activ", r"sim", r"chip", r"portab", r"migrar", r"fibra", r"reconexion", r"reconexi[oó]n"]),
        ("TV y entretenimiento", [r"tele", r"tv", r"canal", r"pelicula", r"video", r"control remoto", r"pantalla"]),
        ("Roaming, llamadas y mensajería", [r"roaming", r"sms", r"mensaje", r"buz[oó]n", r"voice mail", r"llamad"]),
    ]
    for category, patterns in rules:
        if has(t, patterns):
            return category

    if has(t, [r"excelente", r"bueno", r"buena", r"buen servicio", r"satisfech", r"sin problema", r"funciona bien", r"muy rapido", r"muy buena", r"eficiente", r"recomiendo"]):
        return "Comentario positivo / sin queja"
    return "Otros / no especificado"


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    rows = data["feedback_model"]["rows"]
    counts = {}
    for row in rows:
        category = categorize(row.get("feedback", ""), row.get("segment", ""))
        row["category_local"] = category
        row["category"] = category
        counts[category] = counts.get(category, 0) + 1
    data["feedback_model"]["taxonomy"] = TAXONOMY
    data["feedback_model"]["classifier"] = VERSION
    data["feedback_model"]["classification_note"] = "Taxonomía CX orientada a drivers de queja; clasificación determinística reproducible, sin Ollama."
    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    # Persist the new active classification while retaining prior local/Ollama history.
    con = sqlite3.connect(DB_PATH)
    stamp = now_iso()
    response_rows = con.execute("SELECT survey_key, comment, comment_hash FROM responses WHERE active=1").fetchall()
    for key, comment, comment_hash in response_rows:
        category = categorize(comment)
        con.execute("INSERT INTO classification_history (survey_key,classifier,model_version,comment_hash,category,status,classified_at) VALUES (?,?,?,?,?,?,?)", (key, "cx_manual", VERSION, comment_hash, category, "classified", stamp))
        con.execute("""INSERT INTO classifications VALUES (?,?,?,?,?,?,?)
            ON CONFLICT(survey_key,classifier) DO UPDATE SET
            model_version=excluded.model_version, comment_hash=excluded.comment_hash,
            category=excluded.category, status=excluded.status, classified_at=excluded.classified_at""", (key, "cx_manual", VERSION, comment_hash, category, "classified", stamp))
    con.commit()
    con.close()
    print(json.dumps({"rows": len(rows), "db_active": len(response_rows), "categories": counts}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
