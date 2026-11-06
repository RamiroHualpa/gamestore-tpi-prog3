BEGIN TRANSACTION;
CREATE TABLE estudio (
	nombre VARCHAR(60) NOT NULL, 
	pais VARCHAR(40), 
	id INTEGER NOT NULL, 
	activo BOOLEAN NOT NULL, 
	PRIMARY KEY (id)
);
INSERT INTO "estudio" VALUES('Nintendo','Japón',1,1);
INSERT INTO "estudio" VALUES('Team Cherry','Australia',2,1);
INSERT INTO "estudio" VALUES('Santa Monica Studio','Estados Unidos',3,1);
INSERT INTO "estudio" VALUES('Playground Games','Reino Unido',4,1);
INSERT INTO "estudio" VALUES('ConcernedApe','Estados Unidos',5,1);
INSERT INTO "estudio" VALUES('FromSoftware','Japón',6,1);
INSERT INTO "estudio" VALUES('CD Projekt Red','Polonia',7,1);
INSERT INTO "estudio" VALUES('Rockstar Games','Estados Unidos',8,1);
INSERT INTO "estudio" VALUES('Supergiant Games','Estados Unidos',9,1);
INSERT INTO "estudio" VALUES('Mojang Studios','Suecia',10,1);
INSERT INTO "estudio" VALUES('EA Sports','Canadá',11,1);
INSERT INTO "estudio" VALUES('Firaxis Games','Estados Unidos',12,1);
INSERT INTO "estudio" VALUES('Valve','Estados Unidos',13,1);
INSERT INTO "estudio" VALUES('Insomniac Games','Estados Unidos',14,1);
INSERT INTO "estudio" VALUES('Larian Studios','Bélgica',15,1);
INSERT INTO "estudio" VALUES('Ubisoft','Francia',16,1);
INSERT INTO "estudio" VALUES('Capcom','Japón',17,1);
INSERT INTO "estudio" VALUES('Re-Logic','Estados Unidos',18,1);
INSERT INTO "estudio" VALUES('Motion Twin','Francia',19,1);
INSERT INTO "estudio" VALUES('Polyphony Digital','Japón',20,1);
INSERT INTO "estudio" VALUES('Turn 10 Studios','Estados Unidos',21,1);
INSERT INTO "estudio" VALUES('343 Industries','Estados Unidos',22,1);
INSERT INTO "estudio" VALUES('id Software','Estados Unidos',23,1);
INSERT INTO "estudio" VALUES('Extremely OK Games','Canadá',24,1);
INSERT INTO "estudio" VALUES('Relic Entertainment','Canadá',25,1);
INSERT INTO "estudio" VALUES('Psyonix','Estados Unidos',26,1);
INSERT INTO "estudio" VALUES('Visual Concepts','Estados Unidos',27,1);
CREATE TABLE plataforma (
	nombre VARCHAR(30) NOT NULL, 
	id INTEGER NOT NULL, 
	PRIMARY KEY (id)
);
INSERT INTO "plataforma" VALUES('PC',1);
INSERT INTO "plataforma" VALUES('PlayStation',2);
INSERT INTO "plataforma" VALUES('Xbox',3);
INSERT INTO "plataforma" VALUES('Nintendo Switch',4);
CREATE TABLE videojuego (
	titulo VARCHAR(80) NOT NULL, 
	descripcion VARCHAR(300) NOT NULL, 
	genero VARCHAR(10) NOT NULL, 
	anio_lanzamiento INTEGER NOT NULL, 
	precio FLOAT NOT NULL, 
	stock INTEGER NOT NULL, 
	imagen_url VARCHAR(255), 
	imagen_respaldo_url VARCHAR(255), 
	estudio_id INTEGER NOT NULL, 
	id INTEGER NOT NULL, 
	costo_proveedor FLOAT NOT NULL, 
	activo BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(estudio_id) REFERENCES estudio (id)
);
INSERT INTO "videojuego" VALUES('Hollow Knight','Un caballero explora un reino de insectos en ruinas. Plataformas, combate exigente y un mapa enorme para descubrir.','INDIE',2017,9000.0,5,'img/juegos/hollow-knight.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900.jpg',2,1,4000.0,1);
INSERT INTO "videojuego" VALUES('Hollow Knight: Silksong','Hornet escala un reino desconocido con nuevas habilidades, herramientas y enemigos más rápidos.','INDIE',2025,15000.0,12,'img/juegos/hollow-knight-silksong.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030300/library_600x900.jpg',2,2,7000.0,1);
INSERT INTO "videojuego" VALUES('The Legend of Zelda: Tears of the Kingdom','Link recorre Hyrule por tierra y por las islas del cielo, construyendo vehículos con lo que encuentra.','AVENTURA',2023,65000.0,2,'img/juegos/the-legend-of-zelda-tears-of-the-kingdom.svg',NULL,1,3,40000.0,1);
INSERT INTO "videojuego" VALUES('Mario Kart 8 Deluxe','Carreras con objetos, 48 circuitos y partidas de hasta cuatro jugadores en la misma pantalla.','CARRERAS',2017,50000.0,6,'img/juegos/mario-kart-8-deluxe.svg',NULL,1,4,30000.0,1);
INSERT INTO "videojuego" VALUES('Super Mario Odyssey','Mario viaja por reinos muy distintos y usa su gorra para tomar el control de enemigos y objetos.','AVENTURA',2017,48000.0,4,'img/juegos/super-mario-odyssey.svg',NULL,1,5,28000.0,1);
INSERT INTO "videojuego" VALUES('Animal Crossing: New Horizons','Una isla desierta para decorar a gusto, con vecinos, estaciones del año y eventos en tiempo real.','AVENTURA',2020,45000.0,0,'img/juegos/animal-crossing-new-horizons.svg',NULL,1,6,26000.0,1);
INSERT INTO "videojuego" VALUES('God of War Ragnarök','Kratos y Atreus recorren los nueve reinos nórdicos antes del fin del mundo.','ACCION',2022,55000.0,0,'img/juegos/god-of-war-ragnarök.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900.jpg',3,7,30000.0,1);
INSERT INTO "videojuego" VALUES('Forza Horizon 5','Mundo abierto en México con cientos de autos, carreras en ruta, tierra y eventos en línea.','CARRERAS',2021,45000.0,3,'img/juegos/forza-horizon-5.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/library_600x900.jpg',4,8,25000.0,1);
INSERT INTO "videojuego" VALUES('Stardew Valley','Una granja heredada, un pueblo con historias propias y temporadas para sembrar, pescar y explorar minas.','INDIE',2016,7000.0,10,'img/juegos/stardew-valley.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900.jpg',5,9,2500.0,1);
INSERT INTO "videojuego" VALUES('Elden Ring','Rol de acción en un mundo abierto oscuro, con jefes enormes y libertad para elegir el camino.','RPG',2022,60000.0,7,'img/juegos/elden-ring.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg',6,10,35000.0,1);
INSERT INTO "videojuego" VALUES('Dark Souls III','Combate preciso y castigador en un reino que se apaga. Cada derrota enseña algo.','RPG',2016,30000.0,3,'img/juegos/dark-souls-iii.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/library_600x900.jpg',6,11,15000.0,1);
INSERT INTO "videojuego" VALUES('Sekiro: Shadows Die Twice','Un shinobi en el Japón feudal, con duelos de espada en los que importa más desviar que atacar.','ACCION',2019,35000.0,0,'img/juegos/sekiro-shadows-die-twice.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900.jpg',6,12,18000.0,1);
INSERT INTO "videojuego" VALUES('The Witcher 3: Wild Hunt','Geralt busca a Ciri en un mundo abierto lleno de contratos de monstruos y decisiones con consecuencias.','RPG',2015,25000.0,9,'img/juegos/the-witcher-3-wild-hunt.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg',7,13,11000.0,1);
INSERT INTO "videojuego" VALUES('Cyberpunk 2077','Rol en primera persona en Night City, una ciudad futurista de implantes, bandas y corporaciones.','RPG',2020,40000.0,5,'img/juegos/cyberpunk-2077.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg',7,14,20000.0,1);
INSERT INTO "videojuego" VALUES('Red Dead Redemption 2','Arthur Morgan y su banda huyen por el oeste norteamericano a fines del siglo XIX.','AVENTURA',2018,42000.0,4,'img/juegos/red-dead-redemption-2.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg',8,15,22000.0,1);
INSERT INTO "videojuego" VALUES('Grand Theft Auto V','Tres protagonistas, una ciudad enorme y golpes planificados paso a paso.','ACCION',2013,30000.0,15,'img/juegos/grand-theft-auto-v.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg',8,16,14000.0,1);
INSERT INTO "videojuego" VALUES('Hades','Zagreo intenta escapar del inframundo. Cada intento es distinto y la historia avanza con cada muerte.','INDIE',2020,12000.0,8,'img/juegos/hades.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900.jpg',9,17,5000.0,1);
INSERT INTO "videojuego" VALUES('Hades II','Melinoe, hermana de Zagreo, enfrenta al titán del tiempo con magia y armas nuevas.','INDIE',2025,18000.0,6,'img/juegos/hades-ii.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/library_600x900.jpg',9,18,8000.0,1);
INSERT INTO "videojuego" VALUES('Minecraft','Un mundo hecho de bloques para construir, explorar y sobrevivir, solo o con amigos.','AVENTURA',2011,20000.0,25,'img/juegos/minecraft.svg',NULL,10,19,8000.0,1);
INSERT INTO "videojuego" VALUES('EA Sports FC 25','Fútbol con ligas y equipos licenciados, modo carrera y partidos en línea.','DEPORTES',2024,58000.0,10,'img/juegos/ea-sports-fc-25.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2669320/library_600x900.jpg',11,20,32000.0,1);
INSERT INTO "videojuego" VALUES('Madden NFL 25','Fútbol americano con la liga profesional, jugadas tácticas y modo franquicia.','DEPORTES',2024,52000.0,2,'img/juegos/madden-nfl-25.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2582560/library_600x900.jpg',11,21,30000.0,1);
INSERT INTO "videojuego" VALUES('Sid Meier''s Civilization VI','Estrategia por turnos: una civilización crece desde la edad de piedra hasta la era de la información.','ESTRATEGIA',2016,22000.0,6,'img/juegos/sid-meier-s-civilization-vi.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/289070/library_600x900.jpg',12,22,9000.0,1);
INSERT INTO "videojuego" VALUES('XCOM 2','Táctica por turnos: una resistencia pequeña enfrenta a una ocupación alienígena.','ESTRATEGIA',2016,18000.0,0,'img/juegos/xcom-2.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/268500/library_600x900.jpg',12,23,8000.0,1);
INSERT INTO "videojuego" VALUES('Half-Life 2','Gordon Freeman vuelve a City 17. Física, acertijos y la famosa pistola de gravedad.','SHOOTER',2004,6000.0,20,'img/juegos/half-life-2.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/220/library_600x900.jpg',13,24,2000.0,1);
INSERT INTO "videojuego" VALUES('Portal 2','Acertijos con portales, humor y un modo cooperativo para dos jugadores.','AVENTURA',2011,6000.0,14,'img/juegos/portal-2.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/library_600x900.jpg',13,25,2000.0,1);
INSERT INTO "videojuego" VALUES('Marvel''s Spider-Man 2','Peter Parker y Miles Morales se balancean por Nueva York en una historia para dos héroes.','ACCION',2023,62000.0,5,'img/juegos/marvel-s-spider-man-2.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2651280/library_600x900.jpg',14,26,36000.0,1);
INSERT INTO "videojuego" VALUES('Ratchet & Clank: Rift Apart','Saltos entre dimensiones, armas creativas y una aventura para toda la familia.','ACCION',2021,40000.0,3,'img/juegos/ratchet-clank-rift-apart.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1895880/library_600x900.jpg',14,27,22000.0,1);
INSERT INTO "videojuego" VALUES('Baldur''s Gate 3','Rol por turnos basado en Dungeons & Dragons, con un grupo de compañeros y decisiones que cambian todo.','RPG',2023,52000.0,8,'img/juegos/baldur-s-gate-3.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900.jpg',15,28,28000.0,1);
INSERT INTO "videojuego" VALUES('Divinity: Original Sin 2','Rol táctico con un sistema de elementos que se combinan: fuego, agua, veneno y electricidad.','RPG',2017,26000.0,4,'img/juegos/divinity-original-sin-2.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/435150/library_600x900.jpg',15,29,12000.0,1);
INSERT INTO "videojuego" VALUES('Assassin''s Creed Valhalla','Eivor lidera un clan vikingo que llega a Inglaterra en busca de un nuevo hogar.','ACCION',2020,35000.0,6,'img/juegos/assassin-s-creed-valhalla.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2208920/library_600x900.jpg',16,30,18000.0,1);
INSERT INTO "videojuego" VALUES('Rainbow Six Siege','Disparos tácticos por equipos, con paredes que se rompen y operadores con habilidades únicas.','SHOOTER',2015,15000.0,11,'img/juegos/rainbow-six-siege.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/359550/library_600x900.jpg',16,31,6000.0,0);
INSERT INTO "videojuego" VALUES('Resident Evil 4','Leon Kennedy busca a la hija del presidente en un pueblo rural de España. Terror y acción.','ACCION',2023,45000.0,5,'img/juegos/resident-evil-4.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/library_600x900.jpg',17,32,24000.0,1);
INSERT INTO "videojuego" VALUES('Monster Hunter: World','Cacerías de monstruos gigantes, solo o en grupo, para fabricar mejores armas y armaduras.','ACCION',2018,28000.0,7,'img/juegos/monster-hunter-world.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/582010/library_600x900.jpg',17,33,13000.0,1);
INSERT INTO "videojuego" VALUES('Street Fighter 6','Lucha uno contra uno con un modo historia en mundo abierto y controles para principiantes.','ACCION',2023,40000.0,0,'img/juegos/street-fighter-6.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1364780/library_600x900.jpg',17,34,21000.0,1);
INSERT INTO "videojuego" VALUES('Terraria','Excavar, construir y pelear en un mundo en dos dimensiones lleno de jefes y objetos.','INDIE',2011,6000.0,30,'img/juegos/terraria.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/library_600x900.jpg',18,35,2000.0,1);
INSERT INTO "videojuego" VALUES('Dead Cells','Acción en un castillo que cambia en cada partida. Morir es parte del aprendizaje.','INDIE',2018,10000.0,9,'img/juegos/dead-cells.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/588650/library_600x900.jpg',19,36,4000.0,1);
INSERT INTO "videojuego" VALUES('Gran Turismo 7','Simulador de manejo con cientos de autos reales, circuitos famosos y un museo del automóvil.','CARRERAS',2022,55000.0,4,NULL,NULL,20,37,30000.0,1);
INSERT INTO "videojuego" VALUES('Forza Motorsport','Simulador de carreras en circuito, con daño realista y mejoras para cada auto.','CARRERAS',2023,50000.0,2,'img/juegos/forza-motorsport.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2440510/library_600x900.jpg',21,38,28000.0,1);
INSERT INTO "videojuego" VALUES('Halo Infinite','El Jefe Maestro vuelve en una campaña semiabierta y un modo multijugador por equipos.','SHOOTER',2021,30000.0,6,'img/juegos/halo-infinite.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1240440/library_600x900.jpg',22,39,15000.0,1);
INSERT INTO "videojuego" VALUES('DOOM Eternal','Disparos frenéticos contra hordas de demonios, con movimiento rápido y música metal.','SHOOTER',2020,25000.0,8,'img/juegos/doom-eternal.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/library_600x900.jpg',23,40,11000.0,1);
INSERT INTO "videojuego" VALUES('Celeste','Madeline sube una montaña en un juego de plataformas preciso que habla de ansiedad y superación.','INDIE',2018,7000.0,12,'img/juegos/celeste.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/library_600x900.jpg',24,41,2500.0,1);
INSERT INTO "videojuego" VALUES('Age of Empires IV','Estrategia en tiempo real con civilizaciones históricas, asedios y campañas documentales.','ESTRATEGIA',2021,30000.0,5,'img/juegos/age-of-empires-iv.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1466860/library_600x900.jpg',25,42,14000.0,1);
INSERT INTO "videojuego" VALUES('Super Smash Bros. Ultimate','Lucha para hasta ocho jugadores con personajes de muchas sagas distintas.','ACCION',2018,52000.0,5,'img/juegos/super-smash-bros-ultimate.svg',NULL,1,43,30000.0,1);
INSERT INTO "videojuego" VALUES('Pikmin 4','Un equipo de pequeñas criaturas ayuda a explorar un planeta misterioso y rescatar náufragos.','ESTRATEGIA',2023,48000.0,3,'img/juegos/pikmin-4.svg',NULL,1,44,28000.0,1);
INSERT INTO "videojuego" VALUES('Rocket League','Fútbol con autos que saltan y vuelan. Partidas cortas, en equipo y muy competitivas.','DEPORTES',2015,9000.0,20,'img/juegos/rocket-league.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252950/library_600x900.jpg',26,45,3000.0,1);
INSERT INTO "videojuego" VALUES('NBA 2K25','Básquet profesional con modo carrera, equipos actuales y leyendas de la liga.','DEPORTES',2024,55000.0,6,'img/juegos/nba-2k25.webp','https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2878980/library_600x900.jpg',27,46,30000.0,1);
CREATE TABLE videojuegoplataforma (
	videojuego_id INTEGER NOT NULL, 
	plataforma_id INTEGER NOT NULL, 
	PRIMARY KEY (videojuego_id, plataforma_id), 
	FOREIGN KEY(videojuego_id) REFERENCES videojuego (id), 
	FOREIGN KEY(plataforma_id) REFERENCES plataforma (id)
);
INSERT INTO "videojuegoplataforma" VALUES(1,4);
INSERT INTO "videojuegoplataforma" VALUES(2,4);
INSERT INTO "videojuegoplataforma" VALUES(3,4);
INSERT INTO "videojuegoplataforma" VALUES(4,4);
INSERT INTO "videojuegoplataforma" VALUES(5,4);
INSERT INTO "videojuegoplataforma" VALUES(6,4);
INSERT INTO "videojuegoplataforma" VALUES(9,4);
INSERT INTO "videojuegoplataforma" VALUES(13,4);
INSERT INTO "videojuegoplataforma" VALUES(17,4);
INSERT INTO "videojuegoplataforma" VALUES(18,4);
INSERT INTO "videojuegoplataforma" VALUES(19,4);
INSERT INTO "videojuegoplataforma" VALUES(20,4);
INSERT INTO "videojuegoplataforma" VALUES(22,4);
INSERT INTO "videojuegoplataforma" VALUES(25,4);
INSERT INTO "videojuegoplataforma" VALUES(29,4);
INSERT INTO "videojuegoplataforma" VALUES(35,4);
INSERT INTO "videojuegoplataforma" VALUES(36,4);
INSERT INTO "videojuegoplataforma" VALUES(40,4);
INSERT INTO "videojuegoplataforma" VALUES(41,4);
INSERT INTO "videojuegoplataforma" VALUES(43,4);
INSERT INTO "videojuegoplataforma" VALUES(44,4);
INSERT INTO "videojuegoplataforma" VALUES(45,4);
INSERT INTO "videojuegoplataforma" VALUES(46,4);
INSERT INTO "videojuegoplataforma" VALUES(1,3);
INSERT INTO "videojuegoplataforma" VALUES(2,3);
INSERT INTO "videojuegoplataforma" VALUES(8,3);
INSERT INTO "videojuegoplataforma" VALUES(9,3);
INSERT INTO "videojuegoplataforma" VALUES(10,3);
INSERT INTO "videojuegoplataforma" VALUES(11,3);
INSERT INTO "videojuegoplataforma" VALUES(12,3);
INSERT INTO "videojuegoplataforma" VALUES(13,3);
INSERT INTO "videojuegoplataforma" VALUES(14,3);
INSERT INTO "videojuegoplataforma" VALUES(15,3);
INSERT INTO "videojuegoplataforma" VALUES(16,3);
INSERT INTO "videojuegoplataforma" VALUES(17,3);
INSERT INTO "videojuegoplataforma" VALUES(19,3);
INSERT INTO "videojuegoplataforma" VALUES(20,3);
INSERT INTO "videojuegoplataforma" VALUES(21,3);
INSERT INTO "videojuegoplataforma" VALUES(22,3);
INSERT INTO "videojuegoplataforma" VALUES(23,3);
INSERT INTO "videojuegoplataforma" VALUES(25,3);
INSERT INTO "videojuegoplataforma" VALUES(28,3);
INSERT INTO "videojuegoplataforma" VALUES(29,3);
INSERT INTO "videojuegoplataforma" VALUES(30,3);
INSERT INTO "videojuegoplataforma" VALUES(31,3);
INSERT INTO "videojuegoplataforma" VALUES(32,3);
INSERT INTO "videojuegoplataforma" VALUES(33,3);
INSERT INTO "videojuegoplataforma" VALUES(34,3);
INSERT INTO "videojuegoplataforma" VALUES(35,3);
INSERT INTO "videojuegoplataforma" VALUES(36,3);
INSERT INTO "videojuegoplataforma" VALUES(38,3);
INSERT INTO "videojuegoplataforma" VALUES(39,3);
INSERT INTO "videojuegoplataforma" VALUES(40,3);
INSERT INTO "videojuegoplataforma" VALUES(41,3);
INSERT INTO "videojuegoplataforma" VALUES(42,3);
INSERT INTO "videojuegoplataforma" VALUES(45,3);
INSERT INTO "videojuegoplataforma" VALUES(46,3);
INSERT INTO "videojuegoplataforma" VALUES(1,1);
INSERT INTO "videojuegoplataforma" VALUES(2,1);
INSERT INTO "videojuegoplataforma" VALUES(7,1);
INSERT INTO "videojuegoplataforma" VALUES(8,1);
INSERT INTO "videojuegoplataforma" VALUES(9,1);
INSERT INTO "videojuegoplataforma" VALUES(10,1);
INSERT INTO "videojuegoplataforma" VALUES(11,1);
INSERT INTO "videojuegoplataforma" VALUES(12,1);
INSERT INTO "videojuegoplataforma" VALUES(13,1);
INSERT INTO "videojuegoplataforma" VALUES(14,1);
INSERT INTO "videojuegoplataforma" VALUES(15,1);
INSERT INTO "videojuegoplataforma" VALUES(16,1);
INSERT INTO "videojuegoplataforma" VALUES(17,1);
INSERT INTO "videojuegoplataforma" VALUES(18,1);
INSERT INTO "videojuegoplataforma" VALUES(19,1);
INSERT INTO "videojuegoplataforma" VALUES(20,1);
INSERT INTO "videojuegoplataforma" VALUES(22,1);
INSERT INTO "videojuegoplataforma" VALUES(23,1);
INSERT INTO "videojuegoplataforma" VALUES(24,1);
INSERT INTO "videojuegoplataforma" VALUES(25,1);
INSERT INTO "videojuegoplataforma" VALUES(27,1);
INSERT INTO "videojuegoplataforma" VALUES(28,1);
INSERT INTO "videojuegoplataforma" VALUES(29,1);
INSERT INTO "videojuegoplataforma" VALUES(30,1);
INSERT INTO "videojuegoplataforma" VALUES(31,1);
INSERT INTO "videojuegoplataforma" VALUES(32,1);
INSERT INTO "videojuegoplataforma" VALUES(33,1);
INSERT INTO "videojuegoplataforma" VALUES(34,1);
INSERT INTO "videojuegoplataforma" VALUES(35,1);
INSERT INTO "videojuegoplataforma" VALUES(36,1);
INSERT INTO "videojuegoplataforma" VALUES(38,1);
INSERT INTO "videojuegoplataforma" VALUES(39,1);
INSERT INTO "videojuegoplataforma" VALUES(40,1);
INSERT INTO "videojuegoplataforma" VALUES(41,1);
INSERT INTO "videojuegoplataforma" VALUES(42,1);
INSERT INTO "videojuegoplataforma" VALUES(45,1);
INSERT INTO "videojuegoplataforma" VALUES(46,1);
INSERT INTO "videojuegoplataforma" VALUES(1,2);
INSERT INTO "videojuegoplataforma" VALUES(2,2);
INSERT INTO "videojuegoplataforma" VALUES(7,2);
INSERT INTO "videojuegoplataforma" VALUES(8,2);
INSERT INTO "videojuegoplataforma" VALUES(9,2);
INSERT INTO "videojuegoplataforma" VALUES(10,2);
INSERT INTO "videojuegoplataforma" VALUES(11,2);
INSERT INTO "videojuegoplataforma" VALUES(12,2);
INSERT INTO "videojuegoplataforma" VALUES(13,2);
INSERT INTO "videojuegoplataforma" VALUES(14,2);
INSERT INTO "videojuegoplataforma" VALUES(15,2);
INSERT INTO "videojuegoplataforma" VALUES(16,2);
INSERT INTO "videojuegoplataforma" VALUES(17,2);
INSERT INTO "videojuegoplataforma" VALUES(19,2);
INSERT INTO "videojuegoplataforma" VALUES(20,2);
INSERT INTO "videojuegoplataforma" VALUES(21,2);
INSERT INTO "videojuegoplataforma" VALUES(22,2);
INSERT INTO "videojuegoplataforma" VALUES(23,2);
INSERT INTO "videojuegoplataforma" VALUES(25,2);
INSERT INTO "videojuegoplataforma" VALUES(26,2);
INSERT INTO "videojuegoplataforma" VALUES(27,2);
INSERT INTO "videojuegoplataforma" VALUES(28,2);
INSERT INTO "videojuegoplataforma" VALUES(29,2);
INSERT INTO "videojuegoplataforma" VALUES(30,2);
INSERT INTO "videojuegoplataforma" VALUES(31,2);
INSERT INTO "videojuegoplataforma" VALUES(32,2);
INSERT INTO "videojuegoplataforma" VALUES(33,2);
INSERT INTO "videojuegoplataforma" VALUES(34,2);
INSERT INTO "videojuegoplataforma" VALUES(35,2);
INSERT INTO "videojuegoplataforma" VALUES(36,2);
INSERT INTO "videojuegoplataforma" VALUES(37,2);
INSERT INTO "videojuegoplataforma" VALUES(40,2);
INSERT INTO "videojuegoplataforma" VALUES(41,2);
INSERT INTO "videojuegoplataforma" VALUES(42,2);
INSERT INTO "videojuegoplataforma" VALUES(45,2);
INSERT INTO "videojuegoplataforma" VALUES(46,2);
CREATE UNIQUE INDEX ix_estudio_nombre ON estudio (nombre);
CREATE UNIQUE INDEX ix_plataforma_nombre ON plataforma (nombre);
CREATE UNIQUE INDEX ix_videojuego_titulo ON videojuego (titulo);
CREATE INDEX ix_videojuego_estudio_id ON videojuego (estudio_id);
COMMIT;
