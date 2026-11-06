# -*- coding: utf-8 -*-
"""
database.py -- El ENGINE (uno solo, global) y la SESIÓN por request.

Es la única capa que sabe DÓNDE está la base. Por defecto usa SQLite en el
archivo gamestore.db, que viene ya cargado con datos. Para usar otra base se
define la variable de entorno DATABASE_URL antes de levantar la API.
"""

import os
from pathlib import Path
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

import models  # noqa: F401  -- importarlo registra las tablas en SQLModel.metadata

# El archivo gamestore.db se busca al lado de este archivo, sin importar desde dónde se levante la API.
ARCHIVO_BASE = Path(__file__).with_name("gamestore.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{ARCHIVO_BASE.as_posix()}")

# check_same_thread=False es solo para SQLite: FastAPI atiende cada request en un hilo distinto.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)


def crear_tablas() -> None:
    """Crea las tablas que todavía no existen (no toca las que ya están)."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Una sesión POR REQUEST: se abre al entrar y se cierra sola al terminar."""
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
