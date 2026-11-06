# -*- coding: utf-8 -*-
"""
router_videojuegos.py -- La capa HTTP de /videojuegos.

FastAPI valida la entrada -> se delega en el service -> las excepciones de
dominio se traducen a HTTP. Las rutas fijas (/generos, /resumen) van ANTES
que la dinámica /{juego_id}: FastAPI prueba de arriba hacia abajo.
"""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, Query, status

import service
from database import SessionDep
from models import Genero
from schemas import PaginaVideojuegos, ResumenCatalogo, VideojuegoCreate, VideojuegoPublic, VideojuegoUpdate
from service import ConflictoError, NoEncontradoError

router = APIRouter(prefix="/videojuegos", tags=["Videojuegos"])

JuegoId = Annotated[int, Path(gt=0, description="ID del videojuego")]
PlataformaId = Annotated[int, Path(gt=0, description="ID de la plataforma")]


def _http(error: Exception) -> HTTPException:
    """Traduce una excepción de dominio al código HTTP que le corresponde."""
    codigo = status.HTTP_404_NOT_FOUND if isinstance(error, NoEncontradoError) else status.HTTP_409_CONFLICT
    return HTTPException(status_code=codigo, detail=str(error))


@router.get("/", response_model=PaginaVideojuegos)
def listar_videojuegos(
    session: SessionDep,
    q: Annotated[str | None, Query(min_length=1, max_length=50)] = None,
    estudio_id: Annotated[int | None, Query(gt=0)] = None,
    plataforma_id: Annotated[int | None, Query(gt=0)] = None,
    genero: Genero | None = None,
    solo_con_stock: bool = False,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=50)] = 12,
):
    return service.listar_videojuegos(session, q=q, estudio_id=estudio_id, plataforma_id=plataforma_id,
                                      genero=genero, solo_con_stock=solo_con_stock, skip=skip, limit=limit)


@router.get("/generos", response_model=list[str])
def listar_generos():
    """Los valores del Enum Genero: la web arma con ellos los filtros y el <select>."""
    return [genero.value for genero in Genero]


@router.get("/resumen", response_model=ResumenCatalogo)
def resumen_catalogo(session: SessionDep):
    return service.resumen(session)


@router.get("/{juego_id}", response_model=VideojuegoPublic)
def obtener_videojuego(juego_id: JuegoId, session: SessionDep):
    try:
        return service.obtener_videojuego(session, juego_id)
    except NoEncontradoError as error:
        raise _http(error)


@router.post("/", response_model=VideojuegoPublic, status_code=status.HTTP_201_CREATED)
def crear_videojuego(datos: VideojuegoCreate, session: SessionDep):
    try:
        return service.crear_videojuego(session, datos)
    except (NoEncontradoError, ConflictoError) as error:
        raise _http(error)


@router.patch("/{juego_id}", response_model=VideojuegoPublic)
def actualizar_videojuego(juego_id: JuegoId, datos: VideojuegoUpdate, session: SessionDep):
    try:
        return service.actualizar_videojuego(session, juego_id, datos)
    except (NoEncontradoError, ConflictoError) as error:
        raise _http(error)


@router.delete("/{juego_id}", response_model=VideojuegoPublic)
def dar_de_baja_videojuego(juego_id: JuegoId, session: SessionDep):
    """Baja LÓGICA: el juego queda en la base con activo = false."""
    try:
        return service.dar_de_baja_videojuego(session, juego_id)
    except (NoEncontradoError, ConflictoError) as error:
        raise _http(error)


@router.post("/{juego_id}/plataformas/{plataforma_id}", response_model=VideojuegoPublic,
             status_code=status.HTTP_201_CREATED)
def asociar_plataforma(juego_id: JuegoId, plataforma_id: PlataformaId, session: SessionDep):
    try:
        return service.asociar_plataforma(session, juego_id, plataforma_id)
    except (NoEncontradoError, ConflictoError) as error:
        raise _http(error)


@router.delete("/{juego_id}/plataformas/{plataforma_id}", status_code=status.HTTP_204_NO_CONTENT)
def desasociar_plataforma(juego_id: JuegoId, plataforma_id: PlataformaId, session: SessionDep) -> None:
    try:
        service.desasociar_plataforma(session, juego_id, plataforma_id)
    except NoEncontradoError as error:
        raise _http(error)
