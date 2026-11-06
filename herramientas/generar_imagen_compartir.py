# -*- coding: utf-8 -*-
"""Genera img/compartir.png (1200x630), la imagen que muestran las redes al compartir el sitio."""
import sys
from PIL import Image, ImageDraw, ImageFont

destino = sys.argv[1]
ancho, alto = 1200, 630
imagen = Image.new("RGB", (ancho, alto))
pixeles = imagen.load()
for x in range(ancho):
    for y in range(alto):
        t = (x / ancho * 0.7 + y / alto * 0.3)
        pixeles[x, y] = (int(10 + 114 * (1 - t) * 0.6), int(12 + 199 * t * 0.35), int(22 + 200 * (0.5 + t / 2) * 0.55))
dibujo = ImageDraw.Draw(imagen)
try:
    grande = ImageFont.truetype("seguibl.ttf", 120)
    chica = ImageFont.truetype("segoeui.ttf", 44)
except OSError:
    grande = chica = ImageFont.load_default()
dibujo.text((80, 200), "GameStore", font=grande, fill="white")
dibujo.text((84, 360), "Videojuegos para PC, PlayStation, Xbox y Switch", font=chica, fill=(220, 225, 255))
imagen.save(destino, optimize=True)
print("ok", destino)
