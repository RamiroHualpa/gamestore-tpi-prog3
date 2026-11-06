# -*- coding: utf-8 -*-
"""
descargar_portadas.py -- Baja la portada vertical (600x900) de cada juego desde el
CDN público de Steam, la achica a 300x450 y la guarda comprimida en WebP.

    python descargar_portadas.py <carpeta_api> <carpeta_descargas> <carpeta_destino>

Primero confirma con la API pública de la tienda que cada appid sea el juego correcto.
Las portadas son material promocional de cada estudio: se usan solo con fines didácticos.
"""

import json
import sys
import urllib.request
from pathlib import Path

from PIL import Image


def main() -> None:
    carpeta_api, descargas, destino = (Path(a) for a in sys.argv[1:4])
    sys.path.insert(0, str(carpeta_api))
    from datos_ejemplo import STEAM_APP, slug, url_steam  # noqa: E402

    descargas.mkdir(parents=True, exist_ok=True)
    destino.mkdir(parents=True, exist_ok=True)
    for titulo, appid in STEAM_APP.items():
        try:
            info = json.load(urllib.request.urlopen(
                f"https://store.steampowered.com/api/appdetails?appids={appid}&filters=basic", timeout=20))
            nombre = (info.get(str(appid), {}).get("data") or {}).get("name", "¿?")
        except OSError:
            nombre = "(sin verificar: revisar la portada)"
        crudo = descargas / f"{appid}.jpg"
        crudo.write_bytes(urllib.request.urlopen(url_steam(appid), timeout=20).read())
        webp = destino / f"{slug(titulo)}.webp"
        with Image.open(crudo) as imagen:
            imagen.convert("RGB").resize((300, 450), Image.LANCZOS).save(webp, "WEBP", quality=72, method=6)
        print(f"{titulo[:34]:<34} | Steam: {nombre[:40]:<40} | {webp.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
