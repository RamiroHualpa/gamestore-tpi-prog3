# -*- coding: utf-8 -*-
"""
generar_portadas.py -- Dibuja una portada SVG para los juegos que no están en Steam
(y que por eso no tienen portada WebP descargada).

Cada portada es un degradado con el color del género, formas geométricas y el título.

    python generar_portadas.py <carpeta_api> <carpeta_destino>
"""

import hashlib
import sys
from html import escape
from pathlib import Path

COLORES = {   # (claro, oscuro, acento)
    "ACCION": ("#ff5a5f", "#4a0010", "#ffd166"),
    "AVENTURA": ("#2dd4bf", "#053b36", "#fef08a"),
    "RPG": ("#b57bff", "#240046", "#f0abfc"),
    "DEPORTES": ("#4cc9f0", "#03254c", "#caf0f8"),
    "CARRERAS": ("#ff8c42", "#4a1500", "#ffe066"),
    "ESTRATEGIA": ("#f5c84c", "#3d2b00", "#fff3b0"),
    "SHOOTER": ("#94a3b8", "#0b1220", "#7dd3fc"),
    "INDIE": ("#ff6fb5", "#3a0024", "#c4f1be"),
}


def partir(titulo: str, ancho: int = 13) -> list[str]:
    """Reparte el título en renglones de ~ancho caracteres sin cortar palabras."""
    renglones, actual = [], ""
    for palabra in titulo.split():
        if actual and len(actual) + 1 + len(palabra) > ancho:
            renglones.append(actual)
            actual = palabra
        else:
            actual = f"{actual} {palabra}".strip()
    renglones.append(actual)
    return renglones[:4]


def portada(titulo: str, genero: str, estudio: str, anio: int) -> str:
    claro, oscuro, acento = COLORES[genero]
    semilla = hashlib.md5(titulo.encode()).digest()
    cx, cy, r = 120 + semilla[0] * 1.4, 140 + semilla[1] * 1.1, 120 + semilla[2] // 2
    cx2, cy2 = 80 + semilla[3] * 1.7, 420 + semilla[4] // 2
    giro = semilla[5] % 90
    renglones = partir(titulo)
    tam = 64 if max(len(r) for r in renglones) <= 9 else 52 if max(len(r) for r in renglones) <= 12 else 44
    y0 = 760 - 60 - (len(renglones) - 1) * (tam + 6)
    texto = "".join(
        f'<text x="48" y="{y0 + i * (tam + 6)}" font-size="{tam}" font-weight="800" fill="#fff">{escape(r)}</text>'
        for i, r in enumerate(renglones))
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="Portada de {escape(titulo)}">
<defs>
<linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{claro}"/><stop offset="1" stop-color="{oscuro}"/></linearGradient>
<radialGradient id="b" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="{acento}" stop-opacity=".55"/><stop offset="1" stop-color="{acento}" stop-opacity="0"/></radialGradient>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></linearGradient>
<pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate({giro})"><path d="M0 0H28" stroke="#fff" stroke-opacity=".07" stroke-width="2"/></pattern>
</defs>
<rect width="600" height="800" fill="url(#f)"/>
<rect width="600" height="800" fill="url(#p)"/>
<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r * 1.8:.0f}" fill="url(#b)"/>
<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
<rect x="{cx2:.0f}" y="{cy2:.0f}" width="170" height="170" rx="22" fill="#fff" fill-opacity=".08" transform="rotate({giro} {cx2 + 85:.0f} {cy2 + 85:.0f})"/>
<rect width="600" height="800" fill="url(#s)"/>
<g font-family="Segoe UI, Roboto, Arial, sans-serif">
<rect x="40" y="40" rx="18" width="{len(genero) * 15 + 36}" height="38" fill="#000" fill-opacity=".35"/>
<text x="58" y="66" font-size="20" font-weight="700" letter-spacing="2" fill="{acento}">{genero}</text>
{texto}
<text x="48" y="752" font-size="24" fill="#fff" fill-opacity=".8">{escape(estudio)} · {anio}</text>
</g>
</svg>
"""


def main() -> None:
    carpeta_api, destino = Path(sys.argv[1]), Path(sys.argv[2])
    sys.path.insert(0, str(carpeta_api))
    from datos_ejemplo import SIN_IMAGEN, STEAM_APP, VIDEOJUEGOS, slug  # noqa: E402

    destino.mkdir(parents=True, exist_ok=True)
    for titulo, genero, anio, _p, _s, _c, estudio, _pl, _d in VIDEOJUEGOS:
        if titulo in SIN_IMAGEN or titulo in STEAM_APP:   # los de Steam tienen portada WebP
            continue
        (destino / f"{slug(titulo)}.svg").write_text(portada(titulo, genero, estudio, anio), encoding="utf-8")
    print(f"Portadas generadas en {destino}")


if __name__ == "__main__":
    main()
