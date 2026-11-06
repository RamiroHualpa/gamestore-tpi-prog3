# -*- coding: utf-8 -*-
"""
models.py -- Las TABLAS de la base (table=True).

Es lo que se GUARDA, no lo que viaja por HTTP: hacia afuera salen los schemas
de schemas.py. Las relaciones son las mismas que en Food Store:

    Estudio 1 ──────< N Videojuego        (como Categoria 1 a N Producto)
    Videojuego N >──< N Plataforma        (como Producto N a N Etiqueta)

El género es un Enum: una lista fija de valores que la API valida sola.
"""

from enum import Enum

from sqlmodel import Field, Relationship, SQLModel


class Genero(str, Enum):
    ACCION = "ACCION"
    AVENTURA = "AVENTURA"
    RPG = "RPG"
    DEPORTES = "DEPORTES"
    CARRERAS = "CARRERAS"
    ESTRATEGIA = "ESTRATEGIA"
    SHOOTER = "SHOOTER"
    INDIE = "INDIE"


# ----------------------------------------------------------------------
# Tabla intermedia N a N (se declara antes de las dos tablas que une)
# ----------------------------------------------------------------------
class VideojuegoPlataforma(SQLModel, table=True):
    videojuego_id: int | None = Field(default=None, foreign_key="videojuego.id", primary_key=True)
    plataforma_id: int | None = Field(default=None, foreign_key="plataforma.id", primary_key=True)


# ----------------------------------------------------------------------
# Estudio (lado "1")
# ----------------------------------------------------------------------
class EstudioBase(SQLModel):
    nombre: str = Field(min_length=2, max_length=60, index=True, unique=True)
    pais: str | None = Field(default=None, max_length=40)


class Estudio(EstudioBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    activo: bool = Field(default=True)                     # baja lógica
    videojuegos: list["Videojuego"] = Relationship(back_populates="estudio")


# ----------------------------------------------------------------------
# Plataforma (lado N de la N a N)
# ----------------------------------------------------------------------
class PlataformaBase(SQLModel):
    nombre: str = Field(min_length=2, max_length=30, index=True, unique=True)


class Plataforma(PlataformaBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    videojuegos: list["Videojuego"] = Relationship(
        back_populates="plataformas", link_model=VideojuegoPlataforma)


# ----------------------------------------------------------------------
# Videojuego
# ----------------------------------------------------------------------
class VideojuegoBase(SQLModel):
    titulo: str = Field(min_length=2, max_length=80, index=True, unique=True)
    descripcion: str = Field(min_length=10, max_length=300)
    genero: Genero
    anio_lanzamiento: int = Field(ge=1980, le=2030)
    precio: float = Field(gt=0, le=500000)
    stock: int = Field(default=0, ge=0, le=9999)
    imagen_url: str | None = Field(default=None, max_length=255)            # imagen propia (img/...)
    imagen_respaldo_url: str | None = Field(default=None, max_length=255)   # copia pública en internet
    estudio_id: int = Field(gt=0, foreign_key="estudio.id", index=True)


class Videojuego(VideojuegoBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    costo_proveedor: float = Field(gt=0)        # dato interno: se recibe, se guarda y NUNCA sale
    activo: bool = Field(default=True)          # baja lógica

    estudio: Estudio | None = Relationship(back_populates="videojuegos")
    plataformas: list[Plataforma] = Relationship(
        back_populates="videojuegos", link_model=VideojuegoPlataforma)
