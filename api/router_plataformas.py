# -*- coding: utf-8 -*-
"""router_plataformas.py -- /plataformas: el otro lado de la N a N (como /etiquetas en Food Store)."""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, status

import service
from database import SessionDep
from schemas import PlataformaCreate, PlataformaPublic
from service import ConflictoError, NoEncontradoError

router = APIRouter(prefix="/plataformas", tags=["Plataformas"])

PlataformaId = Annotated[int, Path(gt=0, description="ID de la plataforma")]


@router.get("/", response_model=list[PlataformaPublic])
def listar_plataformas(session: SessionDep):
    return service.listar_plataformas(session)


@router.post("/", response_model=PlataformaPublic, status_code=status.HTTP_201_CREATED)
def crear_plataforma(datos: PlataformaCreate, session: SessionDep):
    try:
        return service.crear_plataforma(session, datos)
    except ConflictoError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))


@router.delete("/{plataforma_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_plataforma(plataforma_id: PlataformaId, session: SessionDep) -> None:
    """Borrado FÍSICO: 204 sin cuerpo. Si está en uso, 409."""
    try:
        service.eliminar_plataforma(session, plataforma_id)
    except NoEncontradoError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    except ConflictoError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))
