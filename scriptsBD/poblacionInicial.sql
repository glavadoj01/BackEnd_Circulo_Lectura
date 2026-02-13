/* ============================
   USUARIO ID 0 (para SET DEFAULT en FK)
   ============================ */
SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO';
INSERT INTO usuario (id_usuario, nombre_usuario, nombre_real, apellido_usuario) VALUES (0, 'usuario0', 'Usuario Cero', 'Reservado');
SET SESSION sql_mode = '';

/* ============================
   USUARIOS
   ============================ */
INSERT INTO usuario (nombre_usuario, nombre_real, apellido_usuario) VALUES
('usuario1', 'Usuario1', 'Apellido Uno'),
('usuario2', 'Usuario2', 'Apellido Dos'),
('usuario3', 'Usuario3', 'Apellido Tres'),
('usuario4', 'Usuario4', 'Apellido Cuatro'),
('usuario5', 'Usuario5', 'Apellido Cinco'),
('usuario6', 'Usuario6', 'Apellido Seis'),
('usuario7', 'Usuario7', 'Apellido Siete'),
('usuario8', 'Usuario8', 'Apellido Ocho'),
('usuario9', 'Usuario9', 'Apellido Nueve'),
('usuario10', 'Usuario10', 'Apellido Diez'),
('Autor', 'Autor', 'Sin nada');              -- Usuario que también es autor

/* ============================
   GENEROS
   ============================ */
INSERT INTO genero (nombre_genero, descripcion_genero) VALUES
('Fantasía', 'Obras con elementos mágicos o irreales'),
('Ciencia Ficción', 'Narrativas futuristas o tecnológicas'),
('Terror', 'Historias diseñadas para causar miedo'),
('Novela Histórica', 'Relatos ambientados en épocas pasadas'),
('Misterio', 'Tramas centradas en resolver enigmas');

/* ============================
   AUTORES (reales + inventados)
   ============================ */
INSERT INTO autor (id_usuario, nombre_autor, apellido_autor, pais_autor, esUsuario) VALUES
-- Reales
(NULL, 'J.R.R.', 'Tolkien', 'Reino Unido', FALSE),         -- 1
(NULL, 'Isaac', 'Asimov', 'Rusia/EEUU', FALSE),            -- 2
(NULL, 'Stephen', 'King', 'EEUU', FALSE),                  -- 3
(NULL, 'Bram', 'Stoker', 'Irlanda', FALSE),                -- 4
(NULL, 'Mary', 'Shelley', 'Reino Unido', FALSE),           -- 5
(NULL, 'Edgar Allan', 'Poe', 'EEUU', FALSE),               -- 6
(NULL, 'Carlos', 'Ruiz Zafón', 'España', FALSE),           -- 7
(NULL, 'Umberto', 'Eco', 'Italia', FALSE),                 -- 8
(NULL, 'Ken', 'Follett', 'Reino Unido', FALSE),            -- 9
(NULL, 'Arthur C.', 'Clarke', 'Reino Unido', FALSE),       -- 10
(NULL, 'Ray', 'Bradbury', 'EEUU', FALSE),                  -- 11
(NULL, 'Philip K.', 'Dick', 'EEUU', FALSE),                -- 12
(NULL, 'Robert A.', 'Heinlein', 'EEUU', FALSE),            -- 13
(NULL, 'Frank', 'Herbert', 'EEUU', FALSE),                 -- 14
(NULL, 'Stanislaw', 'Lem', 'Polonia', FALSE),              -- 15
(NULL, 'Ursula K.', 'Le Guin', 'EEUU', FALSE),             -- 16
(NULL, 'Orson Scott', 'Card', 'EEUU', FALSE),              -- 17
(NULL, 'Cixin', 'Liu', 'China', FALSE),                    -- 18
(NULL, 'Margaret', 'Atwood', 'Canadá', FALSE),             -- 19
(NULL, 'Neal', 'Stephenson', 'EEUU', FALSE),               -- 20
(NULL, 'Octavia E.', 'Butler', 'EEUU', FALSE),             -- 21
(NULL, 'Kim Stanley', 'Robinson', 'EEUU', FALSE),          -- 22
(NULL, 'Aldous', 'Huxley', 'Reino Unido', FALSE),          -- 23
(NULL, 'H. G.', 'Wells', 'Reino Unido', FALSE),            -- 24
(NULL, 'Joe', 'Haldeman', 'EEUU', FALSE),                  -- 25
(NULL, 'Daniel', 'Abraham', 'EEUU', FALSE),                -- 26
(NULL, 'Ty', 'Franck', 'EEUU', FALSE),                     -- 27
(NULL, 'Ann', 'Leckie', 'EEUU', FALSE),                    -- 28
(NULL, 'Ted', 'Chiang', 'EEUU', FALSE),                    -- 29
(NULL, 'Neil', 'Gaiman', 'Reino Unido', FALSE),            -- 30
(NULL, 'Terry', 'Pratchett', 'Reino Unido', FALSE),        -- 31
(NULL, 'Peter', 'Straub', 'EEUU', FALSE),                  -- 32
-- Inventados y usuarios
(1, 'Usuario1', 'Apellido Uno', 'España', TRUE),           -- 33
(NULL, 'Ana', 'Martínez', 'España', FALSE),                -- 34
(NULL, 'Inventado', 'Terror', 'País Imaginario', FALSE),   -- 35
(NULL, 'Inventada', 'Histórica', 'País Imaginario', FALSE),-- 36
(NULL, 'Inventado', 'Misterio', 'País Imaginario', FALSE), -- 37
(11, 'Autor', 'Sin nada', 'País Imaginario', TRUE);        -- 38

/* ============================
   IDIOMAS
   ============================ */
INSERT INTO idiomas (nombre_idioma) VALUES
('Español'),   -- 1
('Inglés'),    -- 2
('Francés'),   -- 3
('Alemán'),    -- 4
('Italiano'),  -- 5
('Ruso'),      -- 6
('Chino'),     -- 7
('Polaco');    -- 8

/* ============================
   LIBROS (reales + inventados)
   ============================ */
INSERT INTO libro (titulo_libro, codigo_isbn, idioma_original, paginas, year_publicacion, sinopsis) VALUES
-- Reales
('El Señor de los Anillos', '978-84-450-7294-1', 1, 1200, 1954, 'La Comunidad del Anillo y la lucha contra Sauron.'),     -- 1 Español
('Fundación', '978-84-450-7657-4', 6, 255, 1951, 'El declive del Imperio Galáctico.'),                                    -- 2 Ruso
('It', '978-84-253-1841-8', 2, 1138, 1986, 'Un ente maligno aterroriza Derry.'),                                          -- 3 Inglés
('Drácula', '978-84-376-0494-7', 2, 418, 1897, 'El conde Drácula viaja de Transilvania a Inglaterra.'),                   -- 4 Inglés
('Frankenstein', '978-84-376-0493-0', 2, 280, 1818, 'Científico crea vida artificial.'),                                  -- 5 Inglés
('El gato negro', '978-84-376-0492-3', 2, 32, 1843, 'Relato corto de terror psicológico.'),                               -- 6 Inglés
('La Sombra del Viento', '978-84-08-03793-1', 1, 565, 2001, 'Un libro misterioso cambia la vida de un joven.'),           -- 7 Español
('El nombre de la rosa', '978-84-663-0226-2', 5, 512, 1980, 'Misterio en una abadía medieval.'),                          -- 8 Italiano
('Los pilares de la Tierra', '978-84-08-01356-0', 2, 1040, 1989, 'Construcción de una catedral en la Edad Media.'),       -- 9 Inglés
('2001: Una odisea espacial', '978-84-450-7295-8', 2, 297, 1968, 'Viaje a Júpiter con HAL 9000.'),                        -- 10 Inglés
('Fahrenheit 451', '978-84-376-0491-6', 2, 256, 1953, 'Sociedad donde los libros están prohibidos.'),                     -- 11 Inglés
('¿Sueñan los androides con ovejas eléctricas?', '978-84-450-7296-5', 2, 272, 1968, 'Cazador de androides en un mundo postapocalíptico.'), -- 12 Inglés
('Forastero en tierra extraña', '978-84-450-7297-2', 2, 528, 1961, 'Un humano criado por marcianos regresa a la Tierra.'),-- 13 Inglés
('Dune', '978-84-450-7298-9', 2, 688, 1965, 'La lucha por el control del planeta Arrakis.'),                              -- 14 Inglés
('Solaris', '978-83-08-03123-1', 8, 304, 1961, 'Estación espacial sobre un planeta misterioso.'),                         -- 15 Polaco
('La mano izquierda de la oscuridad', '978-84-450-7299-6', 2, 320, 1969, 'Explorador en un planeta de género fluido.'),   -- 16 Inglés
('El juego de Ender', '978-84-450-7300-9', 2, 352, 1985, 'Niño prodigio en la guerra interestelar.'),                     -- 17 Inglés
('El problema de los tres cuerpos', '978-84-450-7301-6', 7, 480, 2008, 'Contacto con una civilización alienígena.'),      -- 18 Chino
('El cuento de la criada', '978-84-450-7302-3', 2, 416, 1985, 'Distopía sobre el control de la natalidad.'),              -- 19 Inglés
('Snow Crash', '978-84-450-7303-0', 2, 480, 1992, 'Ciberpunk y realidad virtual.'),                                       -- 20 Inglés
('Parentesco', '978-84-450-7304-7', 2, 416, 1979, 'Viajes en el tiempo y esclavitud.'),                                   -- 21 Inglés
('Marte rojo', '978-84-450-7305-4', 2, 576, 1992, 'Colonización y terraformación de Marte.'),                             -- 22 Inglés
('Un mundo feliz', '978-84-376-0490-9', 2, 288, 1932, 'Sociedad futura de control social.'),                              -- 23 Inglés
('La máquina del tiempo', '978-84-376-0489-3', 2, 128, 1895, 'Viaje al futuro lejano.'),                                  -- 24 Inglés
('La guerra de los mundos', '978-84-376-0488-6', 2, 288, 1898, 'Invasión marciana a la Tierra.'),                         -- 25 Inglés
('La guerra interminable', '978-84-450-7306-1', 2, 336, 1974, 'Soldado en una guerra interestelar.'),                     -- 26 Inglés
('El despertar del Leviatán', '978-84-450-7307-8', 2, 592, 2011, 'Detective y piloto en el sistema solar.'),              -- 27 Inglés
('Justicia auxiliar', '978-84-450-7308-5', 2, 416, 2013, 'Conciencia IA en múltiples cuerpos.'),                          -- 28 Inglés
('La historia de tu vida', '978-84-450-7309-2', 2, 304, 2002, 'Lingüista contacta con alienígenas.'),                     -- 29 Inglés
('Buenos presagios', '978-84-450-7310-8', 2, 416, 1990, 'Un ángel y un demonio intentan evitar el Apocalipsis.'),         -- 30 Inglés
('El misterio de Salem''s Lot', '978-84-450-7311-5', 2, 439, 1975, 'Novela de terror escrita por dos autores.'),          -- 31 Inglés
('El códice de las sombras', '978-84-450-7312-2', 1, 380, 2022, 'Fantasía épica escrita a cuatro manos.'),                -- 32 Español
('La conspiración de Marte', '978-84-450-7313-9', 2, 410, 2023, 'Ciencia ficción con dos autores.'),                      -- 33 Inglés
('El legado de la mansión', '978-84-450-7314-6', 1, 290, 2021, 'Terror y misterio por dos autores.'),                     -- 34 Español
-- Inventados
('Libro Placeholder A', '978-99-00000001', 1, NULL, NULL, NULL),                                                        -- 35
('Libro Placeholder B', '978-99-00000002', 1, 300, 2020, 'Libro inventado para pruebas.'),                              -- 36
('Terror en la noche', '978-99-00000003', 1, 200, 2020, 'Novela de terror inventada.'),                                 -- 37
('Historia inventada', '978-99-00000004', 1, 350, 2019, 'Novela histórica inventada.'),                                 -- 38
('El misterio del sótano', '978-99-00000005', 1, 220, 2021, 'Novela de misterio inventada.'),                           -- 39
('Libro sin género ni autor ni ná', NULL , NULL , NULL, NULL, NULL);                                                  -- 40

/* ============================
   RELACIÓN A: LIBRO-GENERO
   ============================ */
INSERT INTO libro_genero VALUES
(1, 1), -- LOTR → Fantasía
(1, 4), -- LOTR → Histórica (ambientación)
(2, 2), -- Fundación → Ciencia Ficción
(3, 3), -- It → Terror
(4, 3), -- Drácula → Terror
(5, 3), -- Frankenstein → Terror
(5, 2), -- Frankenstein → Ciencia Ficción
(5, 5), -- Frankenstein → Misterio
(6, 3), -- El gato negro → Terror
(7, 5), -- La Sombra del Viento → Misterio
(8, 5), -- El nombre de la rosa → Misterio
(8, 4), -- El nombre de la rosa → Histórica
(9, 4), -- Los pilares de la Tierra → Histórica
(10, 2), -- 2001: Una odisea espacial → Ciencia Ficción
(11, 2), -- Fahrenheit 451 → Ciencia Ficción
(12, 2), -- ¿Sueñan los androides...? → Ciencia Ficción
(13, 2), -- Forastero en tierra extraña → Ciencia Ficción
(14, 2), -- Dune → Ciencia Ficción
(14, 5), -- Dune → Misterio
(15, 2), -- Solaris → Ciencia Ficción
(16, 2), -- La mano izquierda de la oscuridad → Ciencia Ficción
(17, 2), -- El juego de Ender → Ciencia Ficción
(18, 2), -- El problema de los tres cuerpos → Ciencia Ficción
(19, 2), -- El cuento de la criada → Ciencia Ficción
(20, 2), -- Snow Crash → Ciencia Ficción
(21, 2), -- Parentesco → Ciencia Ficción
(22, 2), -- Marte rojo → Ciencia Ficción
(23, 2), -- Un mundo feliz → Ciencia Ficción
(24, 2), -- La máquina del tiempo → Ciencia Ficción
(25, 2), -- La guerra de los mundos → Ciencia Ficción
(25, 3), -- La guerra de los mundos → Terror
(26, 2), -- La guerra interminable → Ciencia Ficción
(27, 2), -- El despertar del Leviatán → Ciencia Ficción
(28, 2), -- Justicia auxiliar → Ciencia Ficción
(29, 2), -- La historia de tu vida → Ciencia Ficción
(30, 1), -- Buenos presagios → Fantasía
(31, 3), -- El misterio de Salem's Lot → Terror
(32, 1), -- El códice de las sombras → Fantasía
(33, 2), -- La conspiración de Marte → Ciencia Ficción
(34, 3), -- El legado de la mansión → Terror
-- Inventados
(35, 1), -- Placeholder A → Fantasía
(36, 2), -- Placeholder B → Ciencia Ficción
(37, 3), -- Terror en la noche → Terror
(38, 4), -- Historia inventada → Histórica
(39, 5)  -- El misterio del sótano → Misterio
;

/* ============================
   RELACIÓN B: LIBRO-AUTOR
   ============================ */
-- Solo puede haber un autor principal (autorPr=TRUE) por libro. Si hay coautores, se marcan como FALSE.
-- Se reflejan solo coautorías reales históricas.
INSERT INTO libro_autor VALUES
(1, 1, TRUE),   -- LOTR → Tolkien (principal)
(2, 2, TRUE),   -- Fundación → Asimov (principal)
(3, 3, TRUE),   -- It → King (principal)
(4, 4, TRUE),   -- Drácula → Bram Stoker (principal)
(5, 5, TRUE),   -- Frankenstein → Mary Shelley (principal)
(6, 6, TRUE),   -- El gato negro → Edgar Allan Poe (principal)
(7, 7, TRUE),   -- La Sombra del Viento → Carlos Ruiz Zafón (principal)
(8, 8, TRUE),   -- El nombre de la rosa → Umberto Eco (principal)
(9, 9, TRUE),   -- Los pilares de la Tierra → Ken Follett (principal)
(10, 10, TRUE), -- 2001: Una odisea espacial → Arthur C. Clarke (principal)
(11, 11, TRUE), -- Fahrenheit 451 → Ray Bradbury (principal)
(12, 12, TRUE), -- ¿Sueñan los androides...? → Philip K. Dick (principal)
(13, 13, TRUE), -- Forastero en tierra extraña → Robert A. Heinlein (principal)
(14, 14, TRUE), -- Dune → Frank Herbert (principal)
(15, 15, TRUE), -- Solaris → Stanislaw Lem (principal)
(16, 16, TRUE), -- La mano izquierda de la oscuridad → Ursula K. Le Guin (principal)
(17, 17, TRUE), -- El juego de Ender → Orson Scott Card (principal)
(18, 18, TRUE), -- El problema de los tres cuerpos → Cixin Liu (principal)
(19, 19, TRUE), -- El cuento de la criada → Margaret Atwood (principal)
(20, 20, TRUE), -- Snow Crash → Neal Stephenson (principal)
(21, 21, TRUE), -- Parentesco → Octavia E. Butler (principal)
(22, 22, TRUE), -- Marte rojo → Kim Stanley Robinson (principal)
(23, 23, TRUE), -- Un mundo feliz → Aldous Huxley (principal)
(24, 24, TRUE), -- La máquina del tiempo → H. G. Wells (principal)
(25, 25, TRUE), -- La guerra de los mundos → H. G. Wells (principal)
(26, 26, TRUE), -- La guerra interminable → Joe Haldeman (principal)
-- Coautoría real: "El despertar del Leviatán" (James S.A. Corey = Daniel Abraham y Ty Franck)
(27, 26, FALSE), -- El despertar del Leviatán → Daniel Abraham (coautor)
(27, 27, TRUE),  -- El despertar del Leviatán → Ty Franck (principal, arbitrario)
-- Coautoría real: "Buenos presagios" (Neil Gaiman y Terry Pratchett)
(30, 30, TRUE),  -- Buenos presagios → Neil Gaiman (principal)
(30, 31, FALSE), -- Buenos presagios → Terry Pratchett (coautor)
-- Coautoría ficticia: "El misterio de Salem's Lot" (Stephen King y Peter Straub)
(31, 3, TRUE),   -- El misterio de Salem's Lot → Stephen King (principal)
(31, 32, FALSE), -- El misterio de Salem's Lot → Peter Straub (coautor ficticio)
-- Coautoría ficticia: "El códice de las sombras" (Ursula K. Le Guin y Ana Martínez)
(32, 16, TRUE),  -- El códice de las sombras → Ursula K. Le Guin (principal)
(32, 34, FALSE), -- El códice de las sombras → Ana Martínez (coautora ficticia)
-- Coautoría ficticia: "La conspiración de Marte" (Kim Stanley Robinson y Cixin Liu)
(33, 22, TRUE),  -- La conspiración de Marte → Kim Stanley Robinson (principal)
(33, 18, FALSE), -- La conspiración de Marte → Cixin Liu (coautor ficticio)
-- Coautoría ficticia: "El legado de la mansión" (Carlos Ruiz Zafón y Inventado Terror)
(34, 7, TRUE),   -- El legado de la mansión → Carlos Ruiz Zafón (principal)
(34, 35, FALSE), -- El legado de la mansión → Inventado Terror (coautor ficticio)
-- Inventados y usuarios
(35, 33, TRUE), -- Placeholder A → Usuario1 como autor (principal)
(36, 34, TRUE), -- Placeholder B → Ana Martínez (principal)
(37, 35, TRUE), -- Terror en la noche → Inventado Terror (principal)
(38, 36, TRUE), -- Historia inventada → Inventada Histórica (principal)
(39, 37, TRUE); -- El misterio del sótano → Inventado Misterio (principal)
;

/* ============================
   LISTAS
   ============================ */
INSERT INTO lista (id_usuarioCrd, nombre_lista, descripcion_lista) VALUES
(1, 'Favoritos de Usuario1', 'Mis libros preferidos'),
(2, 'Lecturas 2024', 'Libros que quiero leer este año'),
(3, 'Terror y Misterio', 'Selección de libros oscuros'),
(4, 'Ciencia Ficción Top', 'Mis recomendaciones de Sci-Fi'),
-- Nuevas listas
(1, 'Clásicos imprescindibles del Usuario1', 'Obras clásicas de todos los géneros'),
(6, 'Novedades y coautorías', 'Libros recientes y escritos a varias manos');

/* ============================
   RELACIÓN C: LISTA-CONTENIDO
   ============================ */
INSERT INTO lista_contenido VALUES
(1, 1),  -- Favoritos de Usuario1: LOTR
(1, 7),  -- Favoritos de Usuario1: La Sombra del Viento
(1, 5),  -- Favoritos de Usuario1: Frankenstein
(1, 14), -- Favoritos de Usuario1: Dune
(1, 23), -- Favoritos de Usuario1: Un mundo feliz

(2, 2),  -- Lecturas 2024: Fundación
(2, 14), -- Lecturas 2024: Dune
(2, 15), -- Lecturas 2024: Solaris
(2, 16), -- Lecturas 2024: La mano izquierda de la oscuridad
(2, 30), -- Lecturas 2024: Buenos presagios
(2, 33), -- Lecturas 2024: La conspiración de Marte

(3, 3),  -- Terror y Misterio: It
(3, 4),  -- Terror y Misterio: Drácula
(3, 6),  -- Terror y Misterio: El gato negro
(3, 31), -- Terror y Misterio: El misterio de Salem's Lot
(3, 34), -- Terror y Misterio: El legado de la mansión
(3, 37), -- Terror y Misterio: Terror en la noche
(3, 39), -- Terror y Misterio: El misterio del sótano

(4, 2),  -- Ciencia Ficción Top: Fundación
(4, 10), -- Ciencia Ficción Top: 2001: Una odisea espacial
(4, 11), -- Ciencia Ficción Top: Fahrenheit 451
(4, 12), -- Ciencia Ficción Top: ¿Sueñan los androides...?
(4, 13), -- Ciencia Ficción Top: Forastero en tierra extraña
(4, 14), -- Ciencia Ficción Top: Dune
(4, 15), -- Ciencia Ficción Top: Solaris
(4, 16), -- Ciencia Ficción Top: La mano izquierda de la oscuridad
(4, 17), -- Ciencia Ficción Top: El juego de Ender
(4, 18), -- Ciencia Ficción Top: El problema de los tres cuerpos
(4, 19), -- Ciencia Ficción Top: El cuento de la criada
(4, 20), -- Ciencia Ficción Top: Snow Crash
(4, 21), -- Ciencia Ficción Top: Parentesco
(4, 22), -- Ciencia Ficción Top: Marte rojo
(4, 23), -- Ciencia Ficción Top: Un mundo feliz
(4, 24), -- Ciencia Ficción Top: La máquina del tiempo
(4, 25), -- Ciencia Ficción Top: La guerra de los mundos
(4, 26), -- Ciencia Ficción Top: La guerra interminable
(4, 27), -- Ciencia Ficción Top: El despertar del Leviatán
(4, 28), -- Ciencia Ficción Top: Justicia auxiliar
(4, 29), -- Ciencia Ficción Top: La historia de tu vida
(4, 32), -- Ciencia Ficción Top: El códice de las sombras
(4, 33), -- Ciencia Ficción Top: La conspiración de Marte

(5, 1),  -- Clásicos imprescindibles: LOTR
(5, 2),  -- Clásicos imprescindibles: Fundación
(5, 4),  -- Clásicos imprescindibles: Drácula
(5, 5),  -- Clásicos imprescindibles: Frankenstein
(5, 8),  -- Clásicos imprescindibles: El nombre de la rosa
(5, 9),  -- Clásicos imprescindibles: Los pilares de la Tierra
(5, 11), -- Clásicos imprescindibles: Fahrenheit 451
(5, 23), -- Clásicos imprescindibles: Un mundo feliz
(5, 24), -- Clásicos imprescindibles: La máquina del tiempo

(6, 30), -- Novedades y coautorías: Buenos presagios
(6, 31), -- Novedades y coautorías: El misterio de Salem's Lot
(6, 32), -- Novedades y coautorías: El códice de las sombras
(6, 33), -- Novedades y coautorías: La conspiración de Marte
(6, 34), -- Novedades y coautorías: El legado de la mansión
(6, 36), -- Novedades y coautorías: Placeholder B
(6, 38); -- Novedades y coautorías: Historia inventada

/* ============================
   RELACIÓN D: LIBRO-USUARIO (estado lectura)
   ============================ */
INSERT INTO libro_usuario VALUES
(1, 1, TRUE),    -- usuario1 leyó LOTR
(1, 2, FALSE),   -- usuario2 pendiente LOTR
(2, 1, TRUE),    -- usuario1 leyó Fundación
(3, 3, FALSE),   -- usuario3 pendiente It
(4, 4, TRUE),    -- usuario4 leyó Drácula
(5, 5, TRUE),    -- usuario5 leyó Frankenstein
(6, 6, FALSE),   -- usuario6 pendiente El gato negro
(7, 7, TRUE),    -- usuario7 leyó La Sombra del Viento
(8, 8, TRUE),    -- usuario8 leyó El nombre de la rosa
(9, 9, FALSE),   -- usuario9 pendiente Los pilares de la Tierra
(10, 1, TRUE),   -- usuario1 leyó 2001
(11, 2, TRUE),   -- usuario2 leyó Fahrenheit 451
(12, 3, FALSE),  -- usuario3 pendiente ¿Sueñan los androides...?
(13, 4, TRUE),   -- usuario4 leyó Forastero en tierra extraña
(14, 5, TRUE),   -- usuario5 leyó Dune
(15, 6, FALSE),  -- usuario6 pendiente Solaris
(16, 7, TRUE),   -- usuario7 leyó La mano izquierda de la oscuridad
(17, 8, TRUE),   -- usuario8 leyó El juego de Ender
(18, 9, FALSE),  -- usuario9 pendiente El problema de los tres cuerpos
(19, 10, TRUE),  -- usuario10 leyó El cuento de la criada
(20, 1, TRUE),   -- usuario1 leyó Snow Crash
(21, 2, FALSE),  -- usuario2 pendiente Parentesco
(22, 3, TRUE),   -- usuario3 leyó Marte rojo
(23, 5, FALSE),  -- usuario5 pendiente Un mundo feliz
(24, 6, TRUE),   -- usuario6 leyó La máquina del tiempo
(25, 7, TRUE),   -- usuario7 leyó La guerra de los mundos
(26, 8, FALSE),  -- usuario8 pendiente La guerra interminable
(27, 9, TRUE),   -- usuario9 leyó El despertar del Leviatán
(28, 10, TRUE),  -- usuario10 leyó Justicia auxiliar
(29, 1, FALSE),  -- usuario1 pendiente La historia de tu vida
-- Novedades y coautorías
(30, 2, TRUE),   -- usuario2 leyó Buenos presagios
(31, 3, TRUE),   -- usuario3 leyó El misterio de Salem's Lot
(32, 4, FALSE),  -- usuario4 pendiente El códice de las sombras
(33, 5, TRUE),   -- usuario5 leyó La conspiración de Marte
(34, 6, FALSE),  -- usuario6 pendiente El legado de la mansión
(36, 7, TRUE),   -- usuario7 leyó Placeholder B
(38, 8, FALSE),  -- usuario8 pendiente Historia inventada
(39, 9, TRUE);   -- usuario9 leyó El misterio del sótano

/* ============================
   RELACIÓN E: LIBRO-CRITICA
   ============================ */
INSERT INTO libro_critica VALUES
(1, 1, 'Obra maestra', 'Un clásico imprescindible.', 5, '2024-01-10 12:00:00'),
(1, 2, 'Muy bueno', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 4, '2024-01-15 13:30:00'),
(1, 3, 'Entretenido', 'Sed do eiusmod tempor incididunt ut labore.', 3, '2024-01-20 15:00:00'),
(2, 1, 'Fascinante', 'Gran ciencia ficción.', 5, '2024-02-05 10:00:00'),
(2, 2, 'Muy interesante', 'El futuro según Asimov.', 4, '2024-02-10 11:00:00'),
(3, 3, 'Terrorífica', 'It me dio pesadillas.', 5, '2024-03-01 20:00:00'),
(4, 4, 'Clásico del terror', 'Drácula nunca pasa de moda.', 5, '2024-03-10 21:00:00'),
(5, 5, 'Reflexivo', 'Frankenstein y la ética científica.', 4, '2024-03-15 18:00:00'),
(6, 6, 'Breve pero intenso', 'El gato negro es inquietante.', 4, '2024-04-01 09:00:00'),
(7, 7, 'Misterio atrapante', 'La Sombra del Viento es adictiva.', 5, '2024-04-10 17:00:00'),
(8, 8, 'Histórico y detectivesco', 'El nombre de la rosa es único.', 5, '2024-04-15 19:00:00'),
(9, 9, 'Épico', 'Los pilares de la Tierra es monumental.', 5, '2024-05-01 20:00:00'),
(10, 1, 'Ciencia y filosofía', '2001 es visual y profunda.', 5, '2024-05-10 14:00:00'),
(11, 2, 'Distopía inquietante', 'Fahrenheit 451 y la censura.', 4, '2024-05-15 16:00:00'),
(12, 3, 'Cautivador', 'Androides y humanos en conflicto.', 5, '2024-06-01 18:00:00'),
(13, 4, 'Profundo', 'Forastero en tierra extraña te hace pensar.', 4, '2024-06-10 20:00:00'),
(14, 5, 'Épico', 'Dune es política y aventura.', 5, '2024-06-15 21:00:00'),
(15, 6, 'Fascinante', 'Solaris y la psicología alienígena.', 4, '2024-07-01 10:00:00'),
(16, 7, 'Original', 'La mano izquierda de la oscuridad es única.', 5, '2024-07-10 12:00:00'),
(17, 8, 'Adictivo', 'El juego de Ender es pura estrategia.', 5, '2024-07-15 13:00:00'),
(18, 9, 'Ciencia y misterio', 'El problema de los tres cuerpos engancha.', 4, '2024-08-01 15:00:00'),
(19, 10, 'Perturbador', 'El cuento de la criada es inquietante.', 5, '2024-08-10 17:00:00'),
(20, 1, 'Ciberpunk puro', 'Snow Crash es sátira y acción.', 4, '2024-08-15 19:00:00'),
(21, 2, 'Emotivo', 'Parentesco mezcla viajes y drama.', 5, '2024-09-01 20:00:00'),
(22, 3, 'Ambicioso', 'Marte rojo es realista y complejo.', 4, '2024-09-10 21:00:00'),
(23, 4, 'Clásico', 'Un mundo feliz y el control social.', 5, '2024-09-15 22:00:00'),
(24, 5, 'Viaje asombroso', 'La máquina del tiempo es pionera.', 4, '2024-10-01 10:00:00'),
(25, 6, 'Invasión épica', 'La guerra de los mundos es un referente.', 5, '2024-10-10 12:00:00'),
(26, 7, 'Guerra sin fin', 'La guerra interminable es reflexiva.', 4, '2024-10-15 13:00:00'),
(27, 8, 'Espacio y política', 'El despertar del Leviatán es absorbente.', 5, '2024-11-01 15:00:00'),
(28, 9, 'IA y conciencia', 'Justicia auxiliar es original.', 4, '2024-11-10 17:00:00'),
(29, 10, 'Lenguaje y contacto', 'La historia de tu vida es profunda.', 5, '2024-11-15 19:00:00'),
-- Novedades y coautorías
(30, 1, 'Divertido y apocalíptico', 'Buenos presagios es ingenioso.', 5, '2025-01-10 12:00:00'),
(31, 2, 'Terror a dos manos', 'El misterio de Salem''s Lot es intenso.', 4, '2025-01-15 13:30:00'),
(32, 3, 'Fantasía moderna', 'El códice de las sombras sorprende.', 4, '2025-01-20 15:00:00'),
(33, 4, 'Sci-fi colaborativa', 'La conspiración de Marte es actual.', 4, '2025-02-05 10:00:00'),
(34, 5, 'Terror y misterio', 'El legado de la mansión es intrigante.', 4, '2025-02-10 11:00:00'),
(36, 6, 'Curioso', 'Placeholder B es experimental.', 2, '2025-03-01 20:00:00'),
(37, 7, 'Terror inventado', 'Terror en la noche cumple su función.', 3, '2025-03-10 21:00:00'),
(38, 8, 'Histórica inventada', 'Historia inventada es entretenida.', 3, '2025-03-15 18:00:00'),
(39, 9, 'Misterio inventado', 'El misterio del sótano es aceptable.', 3, '2025-04-01 09:00:00');

/* ============================
   RELACIÓN F: LISTA-COMENTARIO
   ============================ */
INSERT INTO lista_comentario (id_lista, id_usuario, texto_comentario, id_com_respuesta) VALUES
-- Lista 1: Favoritos de Usuario1
(1, 2, 'Buena selección de libros', NULL),
(1, 3, 'Me encanta LOTR', NULL),
(1, 5, 'Siempre vuelvo a Frankenstein', NULL),
(1, 6, 'Dune es de mis favoritos', NULL),
(1, 1, 'Gracias!', 1),
-- Lista 2: Lecturas 2024
(2, 1, 'Fundación es un clásico', NULL),
(2, 7, 'Quiero leer Solaris este año', NULL),
(2, 8, 'Buenos presagios me llama la atención', NULL),
(2, 9, 'Quiero leer Parentesco de Octavia Butler este año', NULL),
(2, 10, 'Marte rojo de Kim Stanley Robinson es muy realista', NULL),
-- Lista 3: Terror y Misterio
(3, 4, 'It da mucho miedo', NULL),
(3, 9, 'El misterio de Salem''s Lot es brutal', NULL),
(3, 10, 'El legado de la mansión es muy intrigante', NULL),
-- Lista 4: Ciencia Ficción Top
(4, 1, 'Dune de Frank Herbert es imprescindible', NULL),
(4, 2, 'Me fascina la visión de futuro de Asimov en Fundación', NULL),
(4, 3, 'Solaris de Lem me dejó pensando días', NULL),
(4, 4, 'El problema de los tres cuerpos de Cixin Liu es brutal', NULL),
(4, 5, 'La mano izquierda de la oscuridad de Le Guin es muy original', NULL),
(4, 6, 'Snow Crash de Stephenson es puro ciberpunk', NULL),
(4, 7, 'El cuento de la criada de Atwood es inquietante', NULL),
(4, 8, '2001 de Arthur C. Clarke es un clásico del género', NULL),
(4, 6, 'Ciencia ficción para todos los gustos', NULL),
(4, 8, 'El códice de las sombras es una joya', NULL),
-- Lista 5: Clásicos imprescindibles
(5, 1, 'Clásicos que hay que leer sí o sí', NULL),
(5, 2, 'Me encanta la variedad de géneros', NULL),
(5, 3, 'Fahrenheit 451 y Un mundo feliz son imprescindibles', NULL),
-- Lista 6: Novedades y coautorías
(6, 4, 'Interesante selección de novedades', NULL),
(6, 5, 'Me gustan los libros escritos a varias manos', NULL),
(6, 6, 'Placeholder B es curioso', NULL),
(6, 7, 'Historia inventada sorprende para bien', NULL);

/* ============================
   RELACIÓN G: LISTA-USUARIO
   ============================ */
INSERT INTO lista_usuario VALUES
(1, 2, 5),
(1, 3, 4),
(1, 5, 3),
(1, 6, 2),
(2, 1, 3),
(2, 7, 4),
(2, 8, 5),
(3, 4, 5),
(3, 9, 3),
(3, 10, 4),
(4, 1, 4),
(4, 6, 3),
(4, 8, 2),
-- Nuevas listas
(5, 1, 5),
(5, 2, 4),
(5, 3, 5),
(6, 4, 4),
(6, 5, 3),
(6, 6, 2),
(6, 7, 4);

/* ============================
   EVENTOS
   ============================ */
INSERT INTO evento (id_usuarioCrd, nombre_evento, fecha_evento, hora_evento, direccion_evento, descripcion_evento) VALUES
(1, 'Club de lectura Enero', '2025-01-15', '18:00:00', 'Calle Mayor 10', 'Debate sobre libros clásicos'),
(2, 'Reunión Sci-Fi', '2025-02-20', '19:30:00', 'Av. Futuro 22', 'Charla sobre ciencia ficción'),
(3, 'Noche de Terror', '2025-10-31', '21:00:00', 'Casa del Miedo', 'Lectura de relatos de terror');

/* ============================
   RELACIÓN H: EVENTO-USUARIO
   ============================ */
INSERT INTO evento_usuario VALUES
(1, 1, 5, 1),   -- asiste
(1, 2, 4, 2),   -- quizás
(1, 3, NULL, NULL), -- sin respuesta
(2, 1, 5, 1),
(2, 4, 3, 0),   -- no asiste
(3, 3, 4, 1);

/* ============================
   RELACIÓN I: EVENTO-COMENTARIO
   ============================ */
INSERT INTO evento_comentario (id_evento, id_usuario, texto_comentario, id_com_respuesta) VALUES
-- Evento 1: Club de lectura Enero
(1, 2, 'Tengo muchas ganas de este evento', NULL),
(1, 3, 'Yo también asistiré', NULL),
(1, 5, 'Comentario de usuario5 en evento 1', NULL),
(1, 6, 'Lorem ipsum dolor en evento 1', NULL),
(1, 7, 'El cuento de la criada de Atwood es muy actual', NULL),
(1, 1, 'Perfecto, nos vemos allí', 2),
-- Evento 2: Reunión Sci-Fi
(2, 1, 'Fundación es un gran tema para debatir', NULL),
(2, 2, 'Debatir Dune de Herbert va a estar genial', NULL),
(2, 3, '¿Alguien ha leído a Ursula K. Le Guin?', NULL),
(2, 4, 'Me interesa mucho la trilogía de Cixin Liu', NULL),
(2, 5, 'Solaris de Lem es muy filosófico', NULL),
(2, 6, 'Me gustaría comentar Frankenstein de Mary Shelley', NULL),
(2, 7, 'Comentario de usuario7 en evento 2', NULL),
(2, 8, 'Texto de usuario8 en evento 2', NULL),
-- Evento 3: Noche de Terror
(3, 4, 'It da mucho miedo', NULL),
(3, 8, 'Perfecta elección para Halloween: Frankenstein de Shelley', NULL),
(3, 9, 'Comentario de usuario9 en evento 3', NULL),
(3, 10, 'Texto de usuario10 en evento 3', NULL);

/* ============================
   RELACIÓN J: EVENTO-CONTENIDO
   ============================ */
INSERT INTO evento_contenido VALUES
-- Evento 1: Club de lectura Enero
(1, 1, TRUE),   -- LOTR libro principal
(1, 4, FALSE),
(1, 11, FALSE), -- Dune en Club de lectura Enero
-- Evento 2: Reunión Sci-Fi
(2, 2, TRUE),   -- Fundación libro principal
(2, 7, FALSE),  -- 2001: Una odisea espacial
(2, 8, FALSE),  -- Fahrenheit 451
(2, 9, FALSE),  -- ¿Sueñan los androides...?
(2, 10, FALSE), -- Forastero en tierra extraña
(2, 11, TRUE),  -- Dune como libro principal
(2, 12, FALSE), -- Solaris
(2, 13, FALSE), -- La mano izquierda de la oscuridad
(2, 14, FALSE), -- El juego de Ender
(2, 15, FALSE), -- El problema de los tres cuerpos
(2, 16, FALSE), -- El cuento de la criada
(2, 17, FALSE), -- Snow Crash
(2, 18, FALSE), -- Parentesco
(2, 19, FALSE), -- Marte rojo
(2, 20, FALSE), -- Frankenstein
(2, 21, FALSE), -- Un mundo feliz
(2, 22, FALSE), -- La máquina del tiempo
(2, 23, FALSE), -- La guerra de los mundos
(2, 24, FALSE), -- La guerra interminable
(2, 25, FALSE), -- El despertar del Leviatán
(2, 26, FALSE), -- Justicia auxiliar
(2, 27, FALSE), -- La historia de tu vida
-- Evento 3: Noche de Terror
(3, 3, TRUE),   -- It libro principal
(3, 20, FALSE); -- Frankenstein en Noche de Terror
