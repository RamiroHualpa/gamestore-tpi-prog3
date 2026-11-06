# -*- coding: utf-8 -*-
"""router_estudios.py -- /estudios: el lado "1" de la relación (como /categorias en Food Store)."""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, status

import service
from database import SessionDep
from schemas import EstudioCreate, EstudioPublic
from service import ConflictoError, NoEncontradoError

router = APIRouter(prefix="/estudios", tags=["Estudios"])

EstudioId = Annotated[int, Path(gt=0, description="ID del estudio")]


def _http(error: Exception) -> HTTPException:
    codigo = status.HTTP_404_NOT_FOUND if isinstance(error, NoEncontradoError) else status.HTTP_409_CONFLICT
    return HTTPException(status_code=codigo, detail=str(error))


@router.get("/", response_model=list[EstudioPublic])
def listar_estudios(session: SessionDep):
    """Los estudios ACTIVOS, ordenados por nombre (los usa el <select> del formulario)."""
    return service.listar_estudios(session)


@router.get("/{estudio_id}", response_model=EstudioPublic)
def obtener_estudio(estudio_id: EstudioId, session: SessionDep):
    try:
        return service.obtener_estudio(session, estudio_id)
    except NoEncontradoError as error:
        raise _http(error)


@router.post("/", response_model=EstudioPublic, status_code=status.HTTP_201_CREATED)
def crear_estudio(datos: EstudioCreate, session: SessionDep):
    try:
        return service.crear_estudio(session, datos)
    except ConflictoError as error:
        raise _http(error)


@router.put("/{estudio_id}", response_model=EstudioPublic)
def reemplazar_estudio(estudio_id: EstudioId, datos: EstudioCreate, session: SessionDep):
    try:
        return service.reemplazar_estudio(session, estudio_id, datos)
    except (NoEncontradoError, ConflictoError) as error:
        raise _http(error)


@router.delete("/{estudio_id}", response_model=EstudioPublic)
def dar_de_baja_estudio(estudio_id: EstudioId, session: SessionDep):
    """Baja LÓGICA: responde el estudio con activo = false."""
    try:
        return service.dar_de_baja_estudio(session, estudio_id)
    except (NoEncontradoError, ConflictoError) as error:
        raise _http(error)
