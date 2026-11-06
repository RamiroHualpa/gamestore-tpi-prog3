# -*- coding: utf-8 -*-
"""
schemas.py -- Los CONTRATOS: qué JSON entra y qué JSON sale.

La web tiene que respetar estos dos objetos al pie de la letra:

  VideojuegoCreate  lo que la web ENVÍA en POST /videojuegos/
                    (trae costo_proveedor, que es un dato interno)
  VideojuegoPublic  lo que la API DEVUELVE
                    (agrega id, activo, estudio y plataformas;
                     NO trae costo_proveedor)

Las reglas de cada campo (largo, mínimo, máximo) se heredan de VideojuegoBase,
en models.py. Son las mismas que la web repite en js/validaciones.js.
"""

from pydantic import ValidationInfo, field_validator
from sqlmodel import Field, SQLModel

from models import EstudioBase, Genero, PlataformaBase, VideojuegoBase


# ----------------------------------------------------------------------
# Estudio
# ----------------------------------------------------------------------
class EstudioCreate(EstudioBase):
    pass


class EstudioPublic(EstudioBase):
    id: int
    activo: bool


# ----------------------------------------------------------------------
# Plataforma
# ----------------------------------------------------------------------
class PlataformaCreate(PlataformaBase):
    pass


class PlataformaPublic(PlataformaBase):
    id: int


# ----------------------------------------------------------------------
# Videojuego
# ----------------------------------------------------------------------
class VideojuegoCreate(VideojuegoBase):
    costo_proveedor: float = Field(gt=0)

    # Regla entre dos campos: Field no la puede expresar, por eso va en un validador.
    # costo_proveedor se declara después de precio, así que info.data ya trae el precio.
    # Si falla, FastAPI responde 422 con loc = ["body", "costo_proveedor"].
    @field_validator("costo_proveedor")
    @classmethod
    def costo_menor_que_precio(cls, costo: float, info: ValidationInfo) -> float:
        precio = info.data.get("precio")
        if precio is not None and costo >= precio:
            raise ValueError("el costo del proveedor tiene que ser menor que el precio de venta")
        return costo


class VideojuegoUpdate(SQLModel):
    """PATCH: el cliente manda SOLO lo que quiere cambiar."""
    titulo: str | None = Field(default=None, min_length=2, max_length=80)
    descripcion: str | None = Field(default=None, min_length=10, max_length=300)
    genero: Genero | None = None
    anio_lanzamiento: int | None = Field(default=None, ge=1980, le=2030)
    precio: float | None = Field(default=None, gt=0, le=500000)
    stock: int | None = Field(default=None, ge=0, le=9999)
    imagen_url: str | None = Field(default=None, max_length=255)
    imagen_respaldo_url: str | None = Field(default=None, max_length=255)
    estudio_id: int | None = Field(default=None, gt=0)
    costo_proveedor: float | None = Field(default=None, gt=0)


class VideojuegoPublic(VideojuegoBase):
    id: int
    activo: bool
    estudio: EstudioPublic
    plataformas: list[PlataformaPublic] = []


class PaginaVideojuegos(SQLModel):
    """Forma de todos los listados paginados: el total sin skip ni limit, y la página pedida."""
    total: int
    items: list[VideojuegoPublic]


class ResumenCatalogo(SQLModel):
    total_activos: int
    unidades_en_stock: int
    sin_stock: int
    por_genero: dict[str, int]
