# -*- coding: utf-8 -*-
"""
ver_base.py -- Muestra lo que hay guardado en gamestore.db, leyendo con SQL directo
(sin pasar por la API). Sirve para comprobar que lo que se crea desde la web llega
de verdad a la base.

    python ver_base.py            los últimos 10 videojuegos y los totales
    python ver_base.py --todo     todos los videojuegos
    python ver_base.py --sql      además escribe gamestore.sql (estructura + datos)
"""

import sqlite3
import sys
from pathlib import Path

BASE = Path(__file__).with_name("gamestore.db")


def main() -> None:
    if not BASE.exists():
        print("No existe gamestore.db: levantá la API una vez (uvicorn main:app) para crearla.")
        return
    conexion = sqlite3.connect(BASE)

    totales = {tabla: conexion.execute(f"SELECT COUNT(*) FROM {tabla}").fetchone()[0]
               for tabla in ("estudio", "plataforma", "videojuego", "videojuegoplataforma")}
    activos = conexion.execute("SELECT COUNT(*) FROM videojuego WHERE activo = 1").fetchone()[0]
    print(f"Estudios: {totales['estudio']}  |  Plataformas: {totales['plataforma']}  |  "
          f"Videojuegos: {totales['videojuego']} ({activos} activos)  |  "
          f"Asociaciones juego-plataforma: {totales['videojuegoplataforma']}\n")

    limite = "" if "--todo" in sys.argv else "LIMIT 10"
    filas = conexion.execute(f"""
        SELECT v.id, v.titulo, v.genero, v.precio, v.costo_proveedor, v.stock, v.activo, e.nombre,
               (SELECT GROUP_CONCAT(p.nombre, ', ') FROM videojuegoplataforma vp
                JOIN plataforma p ON p.id = vp.plataforma_id WHERE vp.videojuego_id = v.id)
        FROM videojuego v JOIN estudio e ON e.id = v.estudio_id
        ORDER BY v.id DESC {limite}""").fetchall()

    print(f"{'ID':>3}  {'Título':<34} {'Género':<10} {'Precio':>8} {'Costo':>8} {'Stock':>5} "
          f"{'Act':>3}  {'Estudio':<20} Plataformas")
    for id_, titulo, genero, precio, costo, stock, activo, estudio, plataformas in filas:
        print(f"{id_:>3}  {titulo[:34]:<34} {genero:<10} {precio:>8.0f} {costo:>8.0f} {stock:>5} "
              f"{'sí' if activo else 'no':>3}  {estudio[:20]:<20} {plataformas or '-'}")

    if "--sql" in sys.argv:
        destino = BASE.with_suffix(".sql")
        destino.write_text("\n".join(conexion.iterdump()) + "\n", encoding="utf-8")
        print(f"\nSe escribió {destino.name}")
    conexion.close()


if __name__ == "__main__":
    main()
