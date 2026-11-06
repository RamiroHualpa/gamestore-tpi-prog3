# -*- coding: utf-8 -*-
"""
service.py -- La LÓGICA DE NEGOCIO y la transacción.

No conoce HTTP: cuando una regla se rompe lanza una excepción de dominio y el
router la traduce (NoEncontradoError -> 404, ConflictoError -> 409).
Es la ÚNICA capa que hace add, commit y rollback.

Reglas de negocio:
  RN-01  El nombre de un estudio, una plataforma o un videojuego no se repite
         (sin distinguir mayúsculas). Uno dado de baja conserva su nombre.   -> 409
  RN-02  Un estudio con juegos activos no se da de baja. Una plataforma
         en uso no se elimina. Dar de baja algo ya dado de baja.            -> 409
  RN-03  Un juego solo se crea o se mueve a un estudio que existe y está activo. -> 404
  RN-04  Una plataforma no se asocia dos veces al mismo juego (409);
         quitar una que el juego no tiene (404).
"""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, or_, select

from models import Estudio, Plataforma, Videojuego, VideojuegoPlataforma
from schemas import EstudioCreate, PlataformaCreate, VideojuegoCreate, VideojuegoUpdate


class NoEncontradoError(Exception):
    """El recurso no existe. El router lo traduce a 404."""


class ConflictoError(Exception):
    """La operación choca con el estado actual. El router lo traduce a 409."""


def _guardar(session: Session, entidad, mensaje_conflicto: str):
    """add -> commit -> refresh. Si la base rechaza el dato: rollback y 409."""
    session.add(entidad)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise ConflictoError(mensaje_conflicto)
    session.refresh(entidad)
    return entidad


def _nombre_repetido(session: Session, columna_id, columna_nombre, nombre: str,
                     excluir_id: int | None = None) -> bool:
    """RN-01: busca el nombre sin distinguir mayúsculas. Sirve para las tres tablas."""
    consulta = select(columna_id).where(func.lower(columna_nombre) == nombre.strip().lower())
    if excluir_id is not None:
        consulta = consulta.where(columna_id != excluir_id)
    return session.exec(consulta).first() is not None


# ======================================================================
# ESTUDIOS
# ======================================================================
def listar_estudios(session: Session) -> list[Estudio]:
    return list(session.exec(
        select(Estudio).where(Estudio.activo == True).order_by(Estudio.nombre)).all())  # noqa: E712


def obtener_estudio(session: Session, estudio_id: int) -> Estudio:
    estudio = session.get(Estudio, estudio_id)
    if estudio is None:
        raise NoEncontradoError(f"No existe un estudio con id {estudio_id}")
    return estudio


def _estudio_activo(session: Session, estudio_id: int) -> Estudio:
    """RN-03: el estudio de un juego tiene que existir y estar activo."""
    estudio = session.get(Estudio, estudio_id)
    if estudio is None or not estudio.activo:
        raise NoEncontradoError(f"No existe un estudio activo con id {estudio_id}")
    return estudio


def crear_estudio(session: Session, datos: EstudioCreate) -> Estudio:
    if _nombre_repetido(session, Estudio.id, Estudio.nombre, datos.nombre):
        raise ConflictoError(f"Ya existe el estudio '{datos.nombre}'")
    return _guardar(session, Estudio.model_validate(datos), f"Ya existe el estudio '{datos.nombre}'")


def reemplazar_estudio(session: Session, estudio_id: int, datos: EstudioCreate) -> Estudio:
    estudio = obtener_estudio(session, estudio_id)
    if _nombre_repetido(session, Estudio.id, Estudio.nombre, datos.nombre, excluir_id=estudio_id):
        raise ConflictoError(f"Ya existe el estudio '{datos.nombre}'")
    estudio.sqlmodel_update(datos.model_dump())
    return _guardar(session, estudio, f"Ya existe el estudio '{datos.nombre}'")


def dar_de_baja_estudio(session: Session, estudio_id: int) -> Estudio:
    estudio = obtener_estudio(session, estudio_id)
    if not estudio.activo:
        raise ConflictoError(f"El estudio '{estudio.nombre}' ya estaba dado de baja")
    activos = session.exec(select(func.count(Videojuego.id)).where(
        Videojuego.estudio_id == estudio_id, Videojuego.activo == True)).one()  # noqa: E712
    if activos > 0:
        raise ConflictoError(
            f"El estudio '{estudio.nombre}' tiene {activos} videojuego(s) activos: no se puede dar de baja")
    estudio.activo = False
    return _guardar(session, estudio, "No se pudo dar de baja el estudio")


# ======================================================================
# PLATAFORMAS
# ======================================================================
def listar_plataformas(session: Session) -> list[Plataforma]:
    return list(session.exec(select(Plataforma).order_by(Plataforma.id)).all())


def obtener_plataforma(session: Session, plataforma_id: int) -> Plataforma:
    plataforma = session.get(Plataforma, plataforma_id)
    if plataforma is None:
        raise NoEncontradoError(f"No existe una plataforma con id {plataforma_id}")
    return plataforma


def crear_plataforma(session: Session, datos: PlataformaCreate) -> Plataforma:
    if _nombre_repetido(session, Plataforma.id, Plataforma.nombre, datos.nombre):
        raise ConflictoError(f"Ya existe la plataforma '{datos.nombre}'")
    return _guardar(session, Plataforma.model_validate(datos), f"Ya existe la plataforma '{datos.nombre}'")


def eliminar_plataforma(session: Session, plataforma_id: int) -> None:
    plataforma = obtener_plataforma(session, plataforma_id)
    en_uso = session.exec(select(func.count()).select_from(VideojuegoPlataforma).where(
        VideojuegoPlataforma.plataforma_id == plataforma_id)).one()
    if en_uso > 0:
        raise ConflictoError(
            f"La plataforma '{plataforma.nombre}' está asociada a {en_uso} videojuego(s): no se puede eliminar")
    session.delete(plataforma)
    session.commit()


# ======================================================================
# VIDEOJUEGOS
# ======================================================================
def _con_relaciones(consulta):
    """Carga el estudio y las plataformas en la misma ida a la base (sin N+1)."""
    return consulta.options(selectinload(Videojuego.estudio), selectinload(Videojuego.plataformas))


def listar_videojuegos(session: Session, q: str | None = None, estudio_id: int | None = None,
                       plataforma_id: int | None = None, genero: str | None = None,
                       solo_con_stock: bool = False, skip: int = 0, limit: int = 12) -> dict:
    """Listado paginado: devuelve {total, items}. total cuenta TODOS los que cumplen los filtros."""
    filtros = [Videojuego.activo == True]  # noqa: E712
    if q:
        texto = f"%{q.strip().lower()}%"
        filtros.append(or_(func.lower(Videojuego.titulo).like(texto),
                           func.lower(Videojuego.descripcion).like(texto)))
    if estudio_id is not None:
        filtros.append(Videojuego.estudio_id == estudio_id)
    if genero is not None:
        filtros.append(Videojuego.genero == genero)
    if solo_con_stock:
        filtros.append(Videojuego.stock > 0)
    if plataforma_id is not None:
        # Subconsulta por la tabla intermedia: los juegos que salen en esa plataforma
        filtros.append(Videojuego.id.in_(
            select(VideojuegoPlataforma.videojuego_id)
            .where(VideojuegoPlataforma.plataforma_id == plataforma_id)))

    total = session.exec(select(func.count(Videojuego.id)).where(*filtros)).one()
    items = session.exec(_con_relaciones(
        select(Videojuego).where(*filtros).order_by(Videojuego.id).offset(skip).limit(limit))).all()
    return {"total": total, "items": list(items)}


def obtener_videojuego(session: Session, juego_id: int) -> Videojuego:
    juego = session.exec(_con_relaciones(select(Videojuego).where(Videojuego.id == juego_id))).first()
    if juego is None:
        raise NoEncontradoError(f"No existe un videojuego con id {juego_id}")
    return juego


def resumen(session: Session) -> dict:
    activos = Videojuego.activo == True  # noqa: E712
    total = session.exec(select(func.count(Videojuego.id)).where(activos)).one()
    unidades = session.exec(select(func.coalesce(func.sum(Videojuego.stock), 0)).where(activos)).one()
    sin_stock = session.exec(select(func.count(Videojuego.id)).where(activos, Videojuego.stock == 0)).one()
    filas = session.exec(select(Videojuego.genero, func.count(Videojuego.id))
                         .where(activos).group_by(Videojuego.genero)).all()
    return {"total_activos": total, "unidades_en_stock": unidades, "sin_stock": sin_stock,
            "por_genero": {genero.value if hasattr(genero, "value") else genero: cantidad
                           for genero, cantidad in filas}}


def crear_videojuego(session: Session, datos: VideojuegoCreate) -> Videojuego:
    _estudio_activo(session, datos.estudio_id)                             # RN-03 -> 404
    if _nombre_repetido(session, Videojuego.id, Videojuego.titulo, datos.titulo):
        raise ConflictoError(f"Ya existe un videojuego llamado '{datos.titulo}'")   # RN-01 -> 409
    juego = Videojuego.model_validate(datos)       # schema de entrada -> fila de la tabla
    _guardar(session, juego, f"Ya existe un videojuego llamado '{datos.titulo}'")
    return obtener_videojuego(session, juego.id)   # se relee con estudio y plataformas


def actualizar_videojuego(session: Session, juego_id: int, datos: VideojuegoUpdate) -> Videojuego:
    juego = obtener_videojuego(session, juego_id)
    cambios = {campo: valor for campo, valor in datos.model_dump(exclude_unset=True).items()
               if valor is not None or campo in ("imagen_url", "imagen_respaldo_url")}
    if "estudio_id" in cambios:
        _estudio_activo(session, cambios["estudio_id"])
    if "titulo" in cambios and _nombre_repetido(
            session, Videojuego.id, Videojuego.titulo, cambios["titulo"], excluir_id=juego_id):
        raise ConflictoError(f"Ya existe un videojuego llamado '{cambios['titulo']}'")
    precio = cambios.get("precio", juego.precio)
    costo = cambios.get("costo_proveedor", juego.costo_proveedor)
    if costo >= precio:
        raise ConflictoError("El costo del proveedor tiene que ser menor que el precio de venta")
    juego.sqlmodel_update(cambios)
    _guardar(session, juego, "Ya existe un videojuego con ese título")
    return obtener_videojuego(session, juego_id)


def dar_de_baja_videojuego(session: Session, juego_id: int) -> Videojuego:
    juego = obtener_videojuego(session, juego_id)
    if not juego.activo:
        raise ConflictoError(f"El videojuego '{juego.titulo}' ya estaba dado de baja")
    juego.activo = False
    _guardar(session, juego, "No se pudo dar de baja el videojuego")
    return obtener_videojuego(session, juego_id)


def asociar_plataforma(session: Session, juego_id: int, plataforma_id: int) -> Videojuego:
    juego = obtener_videojuego(session, juego_id)
    plataforma = obtener_plataforma(session, plataforma_id)
    if plataforma in juego.plataformas:
        raise ConflictoError(f"'{juego.titulo}' ya está asociado a {plataforma.nombre}")
    juego.plataformas.append(plataforma)
    _guardar(session, juego, "La asociación ya existe")
    return obtener_videojuego(session, juego_id)


def desasociar_plataforma(session: Session, juego_id: int, plataforma_id: int) -> None:
    juego = obtener_videojuego(session, juego_id)
    plataforma = obtener_plataforma(session, plataforma_id)
    if plataforma not in juego.plataformas:
        raise NoEncontradoError(f"'{juego.titulo}' no está asociado a {plataforma.nombre}")
    juego.plataformas.remove(plataforma)
    session.add(juego)
    session.commit()
