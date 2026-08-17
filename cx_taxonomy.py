"""Deterministic CX feedback taxonomy used by the local pipeline."""

import re


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

# Increment this when the taxonomy or its rules change so cached automatic
# classifications are intentionally recalculated.
TAXONOMY_VERSION = "cx_drivers_v1_rules"


def normalize(text):
    value = str(text or "").lower()
    value = value.translate(str.maketrans("áéíóúü", "aeiouu"))
    return re.sub(r"\s+", " ", value).strip()


def matches(text, patterns):
    return any(re.search(pattern, text) for pattern in patterns)


def categorize(comment, segment=""):
    """Return one stable taxonomy label for a feedback comment."""
    text = normalize(comment)
    if not text:
        return "Otros / no especificado"

    rules = [
        ("Cancelación y retención", [r"cancel", r"dar de baja", r"desconectar", r"irme", r"cambiarme", r"cambiar de compan"]),
        ("Precio y valor percibido", [r"caro", r"cara", r"cost[oa]", r"precio", r"subieron", r"aumentaron", r"alto costo", r"valor", r"economico", r"pago mucho"]),
        ("Facturación, cobros y pagos", [r"factur", r"cobro", r"cobran", r"deuda", r"pagar", r"pago", r"recibo", r"cargo", r"mora", r"vencid", r"duplicad"]),
        ("Atención al cliente y canales", [r"atencion", r"cliente", r"call center", r"agente", r"tienda", r"sucursal", r"telefono", r"contactar", r"no contest", r"demoran", r"trato"]),
        ("Soporte técnico y resolución", [r"tecnico", r"repar", r"report", r"resolver", r"solucion", r"no resuel", r"visita", r"cita", r"dan[oñ]", r"problema reportado"]),
        ("Planes, paquetes y promociones", [r"plan", r"paquete", r"promoc", r"oferta", r"contrato", r"megas", r"ilimitad", r"dias de data", r"beneficio"]),
        ("Wi-Fi y cobertura dentro del hogar", [r"wifi", r"wi fi", r"wi-fi", r"router", r"modem", r"habitacion", r"cuarto", r"casa", r"no llega", r"repetidor", r"cobertura.*casa"]),
        ("Velocidad y datos móviles", [r"data", r"datos", r"lento", r"lenta", r"velocidad", r"megabit", r"mbps", r"internet movil", r"naveg", r"4g", r"5g"]),
        ("Red, cobertura y señal móvil", [r"senal", r"cobertura", r"red", r"antena", r"llamada", r"no disponible", r"se cae la senal", r"sin servicio"]),
        ("Internet residencial: estabilidad y caídas", [r"internet", r"conexion", r"se cae", r"cae mucho", r"inestable", r"fluctua", r"pausa", r"intermitente", r"fibra optica"]),
        ("Cuenta, app y autogestión", [r"app", r"aplicacion", r"cuenta", r"clave", r"contrasena", r"correo", r"iniciar sesion", r"portal", r"online"]),
        ("Instalación, migración y activación", [r"instal", r"activ", r"sim", r"chip", r"portab", r"migrar", r"fibra", r"reconexion"]),
        ("TV y entretenimiento", [r"tele", r"tv", r"canal", r"pelicula", r"video", r"control remoto", r"pantalla"]),
        ("Roaming, llamadas y mensajería", [r"roaming", r"sms", r"mensaje", r"buzon", r"voice mail", r"llamad"]),
    ]
    for category, patterns in rules:
        if matches(text, patterns):
            return category

    if matches(text, [r"excelente", r"bueno", r"buena", r"buen servicio", r"satisfech", r"sin problema", r"funciona bien", r"muy rapido", r"muy buena", r"eficiente", r"recomiendo"]):
        return "Comentario positivo / sin queja"
    return "Otros / no especificado"
