# -*- coding: utf-8 -*-
"""
datos_ejemplo.py -- Los datos con los que arranca la base.

cargar_datos_de_ejemplo(session) los inserta SOLO si la base está vacía.
Son 45 videojuegos: alcanzan para ver el paginado (12 por página = 4 páginas).
Hay juegos sin stock, uno sin imagen, uno al que le falta la imagen propia (se ve la de
respaldo) y uno dado de baja, para probar esos casos en la web.
"""

from sqlmodel import Session, select

from models import Estudio, Genero, Plataforma, Videojuego

PLATAFORMAS = ["PC", "PlayStation", "Xbox", "Nintendo Switch"]
TODAS = PLATAFORMAS

ESTUDIOS = [
    ("Nintendo", "Japón"),
    ("Team Cherry", "Australia"),
    ("Santa Monica Studio", "Estados Unidos"),
    ("Playground Games", "Reino Unido"),
    ("ConcernedApe", "Estados Unidos"),
    ("FromSoftware", "Japón"),
    ("CD Projekt Red", "Polonia"),
    ("Rockstar Games", "Estados Unidos"),
    ("Supergiant Games", "Estados Unidos"),
    ("Mojang Studios", "Suecia"),
    ("EA Sports", "Canadá"),
    ("Firaxis Games", "Estados Unidos"),
    ("Valve", "Estados Unidos"),
    ("Insomniac Games", "Estados Unidos"),
    ("Larian Studios", "Bélgica"),
    ("Ubisoft", "Francia"),
    ("Capcom", "Japón"),
    ("Re-Logic", "Estados Unidos"),
    ("Motion Twin", "Francia"),
    ("Polyphony Digital", "Japón"),
    ("Turn 10 Studios", "Estados Unidos"),
    ("343 Industries", "Estados Unidos"),
    ("id Software", "Estados Unidos"),
    ("Extremely OK Games", "Canadá"),
    ("Relic Entertainment", "Canadá"),
    ("Psyonix", "Estados Unidos"),
    ("Visual Concepts", "Estados Unidos"),
]

# (título, género, año, precio, stock, costo, estudio, plataformas, descripción)
VIDEOJUEGOS = [
    ("Hollow Knight", "INDIE", 2017, 9000, 5, 4000, "Team Cherry", TODAS,
     "Un caballero explora un reino de insectos en ruinas. Plataformas, combate exigente y un mapa enorme para descubrir."),
    ("Hollow Knight: Silksong", "INDIE", 2025, 15000, 12, 7000, "Team Cherry", TODAS,
     "Hornet escala un reino desconocido con nuevas habilidades, herramientas y enemigos más rápidos."),
    ("The Legend of Zelda: Tears of the Kingdom", "AVENTURA", 2023, 65000, 2, 40000, "Nintendo", ["Nintendo Switch"],
     "Link recorre Hyrule por tierra y por las islas del cielo, construyendo vehículos con lo que encuentra."),
    ("Mario Kart 8 Deluxe", "CARRERAS", 2017, 50000, 6, 30000, "Nintendo", ["Nintendo Switch"],
     "Carreras con objetos, 48 circuitos y partidas de hasta cuatro jugadores en la misma pantalla."),
    ("Super Mario Odyssey", "AVENTURA", 2017, 48000, 4, 28000, "Nintendo", ["Nintendo Switch"],
     "Mario viaja por reinos muy distintos y usa su gorra para tomar el control de enemigos y objetos."),
    ("Animal Crossing: New Horizons", "AVENTURA", 2020, 45000, 0, 26000, "Nintendo", ["Nintendo Switch"],
     "Una isla desierta para decorar a gusto, con vecinos, estaciones del año y eventos en tiempo real."),
    ("God of War Ragnarök", "ACCION", 2022, 55000, 0, 30000, "Santa Monica Studio", ["PlayStation", "PC"],
     "Kratos y Atreus recorren los nueve reinos nórdicos antes del fin del mundo."),
    ("Forza Horizon 5", "CARRERAS", 2021, 45000, 3, 25000, "Playground Games", ["Xbox", "PC", "PlayStation"],
     "Mundo abierto en México con cientos de autos, carreras en ruta, tierra y eventos en línea."),
    ("Stardew Valley", "INDIE", 2016, 7000, 10, 2500, "ConcernedApe", TODAS,
     "Una granja heredada, un pueblo con historias propias y temporadas para sembrar, pescar y explorar minas."),
    ("Elden Ring", "RPG", 2022, 60000, 7, 35000, "FromSoftware", ["PC", "PlayStation", "Xbox"],
     "Rol de acción en un mundo abierto oscuro, con jefes enormes y libertad para elegir el camino."),
    ("Dark Souls III", "RPG", 2016, 30000, 3, 15000, "FromSoftware", ["PC", "PlayStation", "Xbox"],
     "Combate preciso y castigador en un reino que se apaga. Cada derrota enseña algo."),
    ("Sekiro: Shadows Die Twice", "ACCION", 2019, 35000, 0, 18000, "FromSoftware", ["PC", "PlayStation", "Xbox"],
     "Un shinobi en el Japón feudal, con duelos de espada en los que importa más desviar que atacar."),
    ("The Witcher 3: Wild Hunt", "RPG", 2015, 25000, 9, 11000, "CD Projekt Red", TODAS,
     "Geralt busca a Ciri en un mundo abierto lleno de contratos de monstruos y decisiones con consecuencias."),
    ("Cyberpunk 2077", "RPG", 2020, 40000, 5, 20000, "CD Projekt Red", ["PC", "PlayStation", "Xbox"],
     "Rol en primera persona en Night City, una ciudad futurista de implantes, bandas y corporaciones."),
    ("Red Dead Redemption 2", "AVENTURA", 2018, 42000, 4, 22000, "Rockstar Games", ["PC", "PlayStation", "Xbox"],
     "Arthur Morgan y su banda huyen por el oeste norteamericano a fines del siglo XIX."),
    ("Grand Theft Auto V", "ACCION", 2013, 30000, 15, 14000, "Rockstar Games", ["PC", "PlayStation", "Xbox"],
     "Tres protagonistas, una ciudad enorme y golpes planificados paso a paso."),
    ("Hades", "INDIE", 2020, 12000, 8, 5000, "Supergiant Games", TODAS,
     "Zagreo intenta escapar del inframundo. Cada intento es distinto y la historia avanza con cada muerte."),
    ("Hades II", "INDIE", 2025, 18000, 6, 8000, "Supergiant Games", ["PC", "Nintendo Switch"],
     "Melinoe, hermana de Zagreo, enfrenta al titán del tiempo con magia y armas nuevas."),
    ("Minecraft", "AVENTURA", 2011, 20000, 25, 8000, "Mojang Studios", TODAS,
     "Un mundo hecho de bloques para construir, explorar y sobrevivir, solo o con amigos."),
    ("EA Sports FC 25", "DEPORTES", 2024, 58000, 10, 32000, "EA Sports", TODAS,
     "Fútbol con ligas y equipos licenciados, modo carrera y partidos en línea."),
    ("Madden NFL 25", "DEPORTES", 2024, 52000, 2, 30000, "EA Sports", ["PlayStation", "Xbox"],
     "Fútbol americano con la liga profesional, jugadas tácticas y modo franquicia."),
    ("Sid Meier's Civilization VI", "ESTRATEGIA", 2016, 22000, 6, 9000, "Firaxis Games", TODAS,
     "Estrategia por turnos: una civilización crece desde la edad de piedra hasta la era de la información."),
    ("XCOM 2", "ESTRATEGIA", 2016, 18000, 0, 8000, "Firaxis Games", ["PC", "PlayStation", "Xbox"],
     "Táctica por turnos: una resistencia pequeña enfrenta a una ocupación alienígena."),
    ("Half-Life 2", "SHOOTER", 2004, 6000, 20, 2000, "Valve", ["PC"],
     "Gordon Freeman vuelve a City 17. Física, acertijos y la famosa pistola de gravedad."),
    ("Portal 2", "AVENTURA", 2011, 6000, 14, 2000, "Valve", ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
     "Acertijos con portales, humor y un modo cooperativo para dos jugadores."),
    ("Marvel's Spider-Man 2", "ACCION", 2023, 62000, 5, 36000, "Insomniac Games", ["PlayStation"],
     "Peter Parker y Miles Morales se balancean por Nueva York en una historia para dos héroes."),
    ("Ratchet & Clank: Rift Apart", "ACCION", 2021, 40000, 3, 22000, "Insomniac Games", ["PlayStation", "PC"],
     "Saltos entre dimensiones, armas creativas y una aventura para toda la familia."),
    ("Baldur's Gate 3", "RPG", 2023, 52000, 8, 28000, "Larian Studios", ["PC", "PlayStation", "Xbox"],
     "Rol por turnos basado en Dungeons & Dragons, con un grupo de compañeros y decisiones que cambian todo."),
    ("Divinity: Original Sin 2", "RPG", 2017, 26000, 4, 12000, "Larian Studios", TODAS,
     "Rol táctico con un sistema de elementos que se combinan: fuego, agua, veneno y electricidad."),
    ("Assassin's Creed Valhalla", "ACCION", 2020, 35000, 6, 18000, "Ubisoft", ["PC", "PlayStation", "Xbox"],
     "Eivor lidera un clan vikingo que llega a Inglaterra en busca de un nuevo hogar."),
    ("Rainbow Six Siege", "SHOOTER", 2015, 15000, 11, 6000, "Ubisoft", ["PC", "PlayStation", "Xbox"],
     "Disparos tácticos por equipos, con paredes que se rompen y operadores con habilidades únicas."),
    ("Resident Evil 4", "ACCION", 2023, 45000, 5, 24000, "Capcom", ["PC", "PlayStation", "Xbox"],
     "Leon Kennedy busca a la hija del presidente en un pueblo rural de España. Terror y acción."),
    ("Monster Hunter: World", "ACCION", 2018, 28000, 7, 13000, "Capcom", ["PC", "PlayStation", "Xbox"],
     "Cacerías de monstruos gigantes, solo o en grupo, para fabricar mejores armas y armaduras."),
    ("Street Fighter 6", "ACCION", 2023, 40000, 0, 21000, "Capcom", ["PC", "PlayStation", "Xbox"],
     "Lucha uno contra uno con un modo historia en mundo abierto y controles para principiantes."),
    ("Terraria", "INDIE", 2011, 6000, 30, 2000, "Re-Logic", TODAS,
     "Excavar, construir y pelear en un mundo en dos dimensiones lleno de jefes y objetos."),
    ("Dead Cells", "INDIE", 2018, 10000, 9, 4000, "Motion Twin", TODAS,
     "Acción en un castillo que cambia en cada partida. Morir es parte del aprendizaje."),
    ("Gran Turismo 7", "CARRERAS", 2022, 55000, 4, 30000, "Polyphony Digital", ["PlayStation"],
     "Simulador de manejo con cientos de autos reales, circuitos famosos y un museo del automóvil."),
    ("Forza Motorsport", "CARRERAS", 2023, 50000, 2, 28000, "Turn 10 Studios", ["Xbox", "PC"],
     "Simulador de carreras en circuito, con daño realista y mejoras para cada auto."),
    ("Halo Infinite", "SHOOTER", 2021, 30000, 6, 15000, "343 Industries", ["Xbox", "PC"],
     "El Jefe Maestro vuelve en una campaña semiabierta y un modo multijugador por equipos."),
    ("DOOM Eternal", "SHOOTER", 2020, 25000, 8, 11000, "id Software", TODAS,
     "Disparos frenéticos contra hordas de demonios, con movimiento rápido y música metal."),
    ("Celeste", "INDIE", 2018, 7000, 12, 2500, "Extremely OK Games", TODAS,
     "Madeline sube una montaña en un juego de plataformas preciso que habla de ansiedad y superación."),
    ("Age of Empires IV", "ESTRATEGIA", 2021, 30000, 5, 14000, "Relic Entertainment", ["PC", "Xbox", "PlayStation"],
     "Estrategia en tiempo real con civilizaciones históricas, asedios y campañas documentales."),
    ("Super Smash Bros. Ultimate", "ACCION", 2018, 52000, 5, 30000, "Nintendo", ["Nintendo Switch"],
     "Lucha para hasta ocho jugadores con personajes de muchas sagas distintas."),
    ("Pikmin 4", "ESTRATEGIA", 2023, 48000, 3, 28000, "Nintendo", ["Nintendo Switch"],
     "Un equipo de pequeñas criaturas ayuda a explorar un planeta misterioso y rescatar náufragos."),
    ("Rocket League", "DEPORTES", 2015, 9000, 20, 3000, "Psyonix", TODAS,
     "Fútbol con autos que saltan y vuelan. Partidas cortas, en equipo y muy competitivas."),
    ("NBA 2K25", "DEPORTES", 2024, 55000, 6, 30000, "Visual Concepts", TODAS,
     "Básquet profesional con modo carrera, equipos actuales y leyendas de la liga."),
]

# Portadas: cada juego tiene una imagen PROPIA y comprimida en web/img/juegos (imagen_url)
# y, si está en Steam, una dirección pública de respaldo en internet (imagen_respaldo_url).
# Si la propia no carga en 3 segundos, la web usa la de respaldo.
# Los juegos que no están en Steam usan una portada SVG dibujada para el ejemplo.
STEAM_APP = {
    "Hollow Knight": 367520, "Hollow Knight: Silksong": 1030300, "God of War Ragnarök": 2322010,
    "Forza Horizon 5": 1551360, "Stardew Valley": 413150, "Elden Ring": 1245620, "Dark Souls III": 374320,
    "Sekiro: Shadows Die Twice": 814380, "The Witcher 3: Wild Hunt": 292030, "Cyberpunk 2077": 1091500,
    "Red Dead Redemption 2": 1174180, "Grand Theft Auto V": 271590, "Hades": 1145360, "Hades II": 1145350,
    "EA Sports FC 25": 2669320, "Madden NFL 25": 2582560, "Sid Meier's Civilization VI": 289070,
    "XCOM 2": 268500, "Half-Life 2": 220, "Portal 2": 620, "Marvel's Spider-Man 2": 2651280,
    "Ratchet & Clank: Rift Apart": 1895880, "Baldur's Gate 3": 1086940, "Divinity: Original Sin 2": 435150,
    "Assassin's Creed Valhalla": 2208920, "Rainbow Six Siege": 359550, "Resident Evil 4": 2050650,
    "Monster Hunter: World": 582010, "Street Fighter 6": 1364780, "Terraria": 105600, "Dead Cells": 588650,
    "Forza Motorsport": 2440510, "Halo Infinite": 1240440, "DOOM Eternal": 782330, "Celeste": 504230,
    "Age of Empires IV": 1466860, "Rocket League": 252950, "NBA 2K25": 2878980,
}


def url_steam(appid: int) -> str:
    return f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{appid}/library_600x900.jpg"


# Casos especiales para probar la web
SIN_IMAGEN = {"Gran Turismo 7"}           # ni propia ni de respaldo -> la web muestra "Sin imagen"
FALTA_LA_PROPIA = {"Madden NFL 25"}       # el archivo propio no existe -> se ve la de respaldo
DADOS_DE_BAJA = {"Rainbow Six Siege"}     # activo = False -> no aparece en el catálogo


def imagenes(titulo: str) -> tuple[str | None, str | None]:
    """(imagen_url, imagen_respaldo_url) de cada juego."""
    if titulo in SIN_IMAGEN:
        return None, None
    if titulo in STEAM_APP:
        return f"img/juegos/{slug(titulo)}.webp", url_steam(STEAM_APP[titulo])
    return f"img/juegos/{slug(titulo)}.svg", None      # portada dibujada, sin respaldo


def slug(titulo: str) -> str:
    """'Hollow Knight: Silksong' -> 'hollow-knight-silksong' (nombre del archivo de la portada)."""
    reemplazos = str.maketrans("áéíóúñü", "aeiounu")
    limpio = "".join(c if c.isalnum() else "-" for c in titulo.lower().translate(reemplazos))
    return "-".join(parte for parte in limpio.split("-") if parte)


def cargar_datos_de_ejemplo(session: Session) -> None:
    """Inserta estudios, plataformas y videojuegos SOLO si la base está vacía."""
    if session.exec(select(Estudio.id)).first() is not None:
        return
    estudios = {nombre: Estudio(nombre=nombre, pais=pais) for nombre, pais in ESTUDIOS}
    plataformas = {nombre: Plataforma(nombre=nombre) for nombre in PLATAFORMAS}
    session.add_all([*estudios.values(), *plataformas.values()])
    session.flush()                     # asigna los ids antes de usarlos como FK

    for titulo, genero, anio, precio, stock, costo, estudio, nombres_plat, descripcion in VIDEOJUEGOS:
        imagen_url, imagen_respaldo_url = imagenes(titulo)
        session.add(Videojuego(
            titulo=titulo, descripcion=descripcion, genero=Genero(genero), anio_lanzamiento=anio,
            precio=precio, stock=stock, costo_proveedor=costo,
            imagen_url=imagen_url, imagen_respaldo_url=imagen_respaldo_url,
            estudio_id=estudios[estudio].id,
            activo=titulo not in DADOS_DE_BAJA,
            plataformas=[plataformas[nombre] for nombre in nombres_plat],
        ))
    session.commit()
