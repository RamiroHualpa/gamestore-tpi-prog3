# -*- coding: utf-8 -*-
"""
main.py -- Crea la app, prepara la base, habilita CORS y enchufa los routers.

Levantar (desde esta carpeta):
    uvicorn main:app --reload
Documentación interactiva: http://127.0.0.1:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

import database
from datos_ejemplo import cargar_datos_de_ejemplo
from router_estudios import router as router_estudios
from router_plataformas import router as router_plataformas
from router_videojuegos import router as router_videojuegos


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Una vez al arrancar: crea las tablas que falten y, si la base está vacía, la carga.
    database.crear_tablas()
    with Session(database.engine) as session:
        cargar_datos_de_ejemplo(session)
    yield


app = FastAPI(
    title="GameStore API",
    description="Ejemplo resuelto del TPI de Programación III: la API que consume la web GameStore.",
    version="1.0.0",
    lifespan=lifespan,
)

# ----------------------------------------------------------------------
# CORS: la web corre en el puerto 5500 y la API en el 8000. Son ORÍGENES
# distintos, así que el navegador bloquea las respuestas salvo que la API
# autorice ese origen. Se nombran los orígenes uno por uno: nunca "*".
# ----------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_videojuegos)
app.include_router(router_estudios)
app.include_router(router_plataformas)


@app.get("/", tags=["Estado"])
def raiz():
    return {"mensaje": "GameStore API funcionando", "documentacion": "/docs"}
