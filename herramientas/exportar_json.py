# -*- coding: utf-8 -*-
"""
exportar_json.py -- Genera los archivos JSON de la versión sin API (web-json/datos/).

Le pide cada recurso a la API con TestClient, sobre una base en memoria recién cargada,
así los archivos tienen EXACTAMENTE la forma de las respuestas reales.

    python exportar_json.py <carpeta_api> <carpeta_datos>
"""

import json
import os
import sys
from pathlib import Path


def guardar(ruta: Path, datos) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(datos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    carpeta_api, destino = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    os.chdir(carpeta_api)
    sys.path.insert(0, str(carpeta_api))

    from fastapi.testclient import TestClient
    from sqlalchemy.pool import StaticPool
    from sqlmodel import Session, SQLModel, create_engine

    import database
    import main as aplicacion
    from datos_ejemplo import cargar_datos_de_ejemplo

    motor = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    SQLModel.metadata.create_all(motor)
    with Session(motor) as sesion:
        cargar_datos_de_ejemplo(sesion)

    def sesion_de_prueba():
        with Session(motor) as sesion:
            yield sesion

    aplicacion.app.dependency_overrides[database.get_session] = sesion_de_prueba
    cliente = TestClient(aplicacion.app)

    # Un archivo por cada llamado que hace la web
    juegos = cliente.get("/videojuegos/", params={"limit": 50}).json()["items"]
    guardar(destino / "videojuegos.json", juegos)                      # GET /videojuegos/ (todos los activos)
    for juego in juegos:
        guardar(destino / "videojuegos" / f"{juego['id']}.json",       # GET /videojuegos/{id}
                cliente.get(f"/videojuegos/{juego['id']}").json())
    guardar(destino / "generos.json", cliente.get("/videojuegos/generos").json())
    guardar(destino / "resumen.json", cliente.get("/videojuegos/resumen").json())
    guardar(destino / "estudios.json", cliente.get("/estudios/").json())
    guardar(destino / "plataformas.json", cliente.get("/plataformas/").json())
    print(f"{len(juegos)} videojuegos exportados en {destino}")


if __name__ == "__main__":
    main()
