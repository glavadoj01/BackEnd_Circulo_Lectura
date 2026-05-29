/* ============================
   USUARIO ID 0 (para SET DEFAULT en FK)
   ============================ */
/* Usuario generico */
SET @password_hash_demo := '$2b$10$bEn5ReIUXGVkHfl5/R8dA.ORiBLqTebLeK.OsNzcyDXa44I4Y.a.S';
/* password Admin: 1Ab@3456789 */
SET @password_hash_admin := '$2b$10$d28RpeX3GT1A9i/IRVnMDuoBKZvvu94Tz6pFdCeJqrHpN4E5FkYca';
/* password Usuario2: aA!!23456789 */
SET @password_hash_usuario2 := '$2b$10$W3q43jcoP39SHGLYfEdFGe12xGqra4LcgcmDqReG00ux0aKXTQ81e';
/* password Usuario3: bB!$123456789 */
SET @password_hash_usuario3 := '$2b$10$jleHaIt4mVixHT1ZztnNVu/tvuMZC563T7I/JEcrvhwTbf/abCRL6';

SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO';
INSERT INTO usuario (id_usuario, nombre_usuario, nombre_real, apellido_usuario, email_usuario, password_hash, fecha_registro_usuario, esAdministrador) VALUES (0, 'usuario0', 'Usuario Cero', 'Reservado', 'usuario0@example.com', @password_hash_demo, NOW(), 0);
SET SESSION sql_mode = '';

/* ============================
   USUARIOS
   ============================ */
INSERT INTO usuario (nombre_usuario, nombre_real, apellido_usuario, email_usuario, password_hash, fecha_registro_usuario, esAdministrador) VALUES
('usuario1', 'Usuario1', 'Apellido Uno', 'usuario1@example.com', @password_hash_admin, NOW(), 2),
('usuario2', 'Usuario2', 'Apellido Dos', 'usuario2@example.com', @password_hash_usuario2, NOW(), 1),
('usuario3', 'Usuario3', 'Apellido Tres', 'usuario3@example.com', @password_hash_usuario3, NOW(), 0),
('usuario4', 'Usuario4', 'Apellido Cuatro', 'usuario4@example.com', @password_hash_demo, NOW(), 0),
('usuario5', 'Usuario5', 'Apellido Cinco', 'usuario5@example.com', @password_hash_demo, NOW(), 0),
('usuario6', 'Usuario6', 'Apellido Seis', 'usuario6@example.com', @password_hash_demo, NOW(), 0),
('usuario7', 'Usuario7', 'Apellido Siete', 'usuario7@example.com', @password_hash_demo, NOW(), 0),
('usuario8', 'Usuario8', 'Apellido Ocho', 'usuario8@example.com', @password_hash_demo, NOW(), 0),
('usuario9', 'Usuario9', 'Apellido Nueve', 'usuario9@example.com', @password_hash_demo, NOW(), 0),
('usuario10', 'Usuario10', 'Apellido Diez', 'usuario10@example.com', @password_hash_demo, NOW(), 0),
('Autor', 'Autor', 'Sin nada', 'autor@example.com', @password_hash_demo, NOW(), 1); -- Usuario que también es autor y moderador (1)

/* ============================
   CATEGORÍAS DE LISTAS
   ============================ */
INSERT INTO categoria (nombre_categoria) VALUES
('Recientes'),
('Populares'),
('Ficción'),
('Terror'),
('Ciencia-Ficción'),
('Fantasía'),
('Horror'),
('No-Ficción'),
('Ensayo'),
('Misterio'),
('Histórica');

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
INSERT INTO libro (titulo_libro, codigo_isbn, id_idioma_original, paginas, year_publicacion, sinopsis) VALUES
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
(1, 'Clásicos imprescindibles del Usuario1', 'Obras clásicas de todos los géneros'),
(6, 'Novedades y coautorías', 'Libros recientes y escritos a varias manos'),
(2, 'Libros para regalar', 'Sugerencias para regalar libros a amigos'),
(3, 'Lecturas de verano', 'Libros recomendados para el verano'),
(4, 'Pendientes de leer', 'Libros que aún no he leído'),
(5, 'Libros cortos', 'Selección de libros de menos de 300 páginas'),
(7, 'Libros premiados', 'Libros que han ganado premios importantes');

/* ============================
   RELACIÓN LISTA-CATEGORIA (N:M)
   ============================ */
-- 1: Favoritos de Usuario1 → Ficción, Recientes
-- 2: Lecturas 2024 → Ciencia-Ficción, Recientes
-- 3: Terror y Misterio → Terror, Horror, Misterio
-- 4: Ciencia Ficción Top → Ciencia-Ficción, Populares
-- 5: Clásicos imprescindibles del Usuario1 → Ficción, Histórica
-- 6: Novedades y coautorías → Recientes, Ensayo
INSERT INTO lista_categoria (id_lista, id_categoria) VALUES
(1, 1), (1, 10),
(2, 3), (2, 10),
(3, 2), (3, 5), (3, 8),
(4, 3), (4, 11),
(5, 1), (5, 9),
(6, 10), (6, 7),
(7, 1), (7, 11),
(8, 2), (8, 10),
(9, 3), (9, 10),
(10, 1), (10, 6),
(11, 1), (11, 11);

/* ============================
   RELACIÓN C: LISTA-CONTENIDO
   ============================ */
INSERT INTO lista_contenido (id_lista, id_libro) VALUES
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
(6, 38), -- Novedades y coautorías: Historia inventada
-- Lista 7: Libros para regalar
(7, 1), (7, 2), (7, 3),
-- Lista 8: Lecturas de verano
(8, 4), (8, 5), (8, 6),
-- Lista 9: Pendientes de leer
(9, 7), (9, 8), (9, 9),
-- Lista 10: Libros cortos
(10, 10), (10, 11), (10, 12),
-- Lista 11: Libros premiados
(11, 13), (11, 14), (11, 15);

/* ============================
   RELACIÓN D: LIBRO-USUARIO (estado lectura | me gustó)
   ============================ */
INSERT INTO libro_usuario VALUES
(1, 1, TRUE, TRUE),    -- usuario1 leyó LOTR
(1, 2, FALSE, NULL),   -- usuario2 pendiente LOTR
(2, 1, TRUE, TRUE),    -- usuario1 leyó Fundación
(3, 3, FALSE, NULL),   -- usuario3 pendiente It
(4, 4, TRUE, FALSE),    -- usuario4 leyó Drácula
(5, 5, TRUE, NULL),    -- usuario5 leyó Frankenstein
(6, 6, FALSE, NULL),   -- usuario6 pendiente El gato negro
(7, 7, TRUE, TRUE),    -- usuario7 leyó La Sombra del Viento
(8, 8, TRUE, TRUE),    -- usuario8 leyó El nombre de la rosa
(9, 9, FALSE, NULL),   -- usuario9 pendiente Los pilares de la Tierra
(10, 1, TRUE, TRUE),   -- usuario1 leyó 2001
(11, 2, TRUE, NULL),   -- usuario2 leyó Fahrenheit 451
(12, 3, FALSE, NULL),  -- usuario3 pendiente ¿Sueñan los androides...?
(13, 4, TRUE, TRUE),   -- usuario4 leyó Forastero en tierra extraña
(14, 5, TRUE, TRUE),   -- usuario5 leyó Dune
(15, 6, FALSE, NULL),  -- usuario6 pendiente Solaris
(16, 7, TRUE, TRUE),   -- usuario7 leyó La mano izquierda de la oscuridad
(17, 8, TRUE, NULL),   -- usuario8 leyó El juego de Ender
(18, 9, FALSE, NULL),  -- usuario9 pendiente El problema de los tres cuerpos
(19, 10, TRUE, NULL),  -- usuario10 leyó El cuento de la criada
(20, 1, TRUE, NULL),   -- usuario1 leyó Snow Crash
(21, 2, FALSE, NULL),  -- usuario2 pendiente Parentesco
(22, 3, TRUE, TRUE),   -- usuario3 leyó Marte rojo
(23, 5, FALSE, NULL),  -- usuario5 pendiente Un mundo feliz
(24, 6, TRUE, TRUE),   -- usuario6 leyó La máquina del tiempo
(25, 7, TRUE, TRUE),   -- usuario7 leyó La guerra de los mundos
(26, 8, FALSE, NULL),  -- usuario8 pendiente La guerra interminable
(27, 9, TRUE, NULL),   -- usuario9 leyó El despertar del Leviatán
(28, 10, TRUE, TRUE),  -- usuario10 leyó Justicia auxiliar
(29, 1, FALSE, NULL),  -- usuario1 pendiente La historia de tu vida
-- Novedades y coautorías
(30, 2, TRUE, TRUE),   -- usuario2 leyó Buenos presagios
(31, 3, TRUE, TRUE),   -- usuario3 leyó El misterio de Salem's Lot
(32, 4, FALSE, NULL),  -- usuario4 pendiente El códice de las sombras
(33, 5, TRUE, TRUE),   -- usuario5 leyó La conspiración de Marte
(34, 6, FALSE, NULL),  -- usuario6 pendiente El legado de la mansión
(36, 7, TRUE, TRUE),   -- usuario7 leyó Placeholder B
(38, 8, FALSE, NULL),  -- usuario8 pendiente Historia inventada
(39, 9, TRUE, NULL);   -- usuario9 leyó El misterio del sótano

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
INSERT INTO lista_comentario (id_lista, id_usuario, titulo_comentario, texto_comentario, calificacion_comentario, id_com_respuesta, fecha_comentario) VALUES
-- Lista 1: Favoritos de Usuario1
(1, 2, 'Selección destacada', 'Buena selección de libros', 4, NULL, '2024-01-01 10:00:00'),
(1, 3, 'Fan de LOTR', 'Me encanta LOTR', 4, NULL, '2024-01-01 10:05:00'),
(1, 5, 'Clásico favorito', 'Siempre vuelvo a Frankenstein\nOccaecat officia ad eu est enim adipisicing minim fugiat magna proident eiusmod nostrud eu consequat. Laborum ex ipsum duis minim laborum. Deserunt eu sint nostrud excepteur laboris nisi consectetur labore veniam. Adipisicing occaecat exercitation nisi ex consectetur labore proident dolore anim id. Est ipsum veniam mollit voluptate sint est tempor sit sint excepteur anim non. Culpa amet fugiat enim ut nisi proident fugiat nisi do dolore consequat ut. Lorem nisi proident commodo qui irure commodo ullamco officia voluptate consequat ex sunt do.\nDeserunt tempor amet Lorem occaecat excepteur eu dolor. Elit ipsum eu aliquip non sint nostrud commodo do consequat exercitation Lorem deserunt occaecat. Do nulla deserunt nisi amet. Pariatur adipisicing sint ad occaecat minim ut exercitation proident. In aliqua ipsum sunt excepteur nisi. Enim occaecat ullamco id tempor non ut consequat amet cillum ea ut excepteur.\nQuis et veniam ex cillum reprehenderit esse laboris eiusmod. Est laboris incididunt nostrud labore ipsum laboris cillum sint labore reprehenderit ipsum irure nulla. Excepteur aliquip veniam Lorem ex laboris duis veniam reprehenderit excepteur esse. Ad commodo occaecat enim consectetur officia. Ex eiusmod veniam sunt ipsum.', 0, NULL, '2024-01-01 10:10:00'),
(1, 6, 'Dune top', 'Dune es de mis favoritos', 5, NULL, '2024-01-01 10:15:00'),
(1, 1, 'Agradecimiento', 'Gracias!', 2, 1, '2024-01-01 10:20:00'),
-- Lista 2: Lecturas 2024
(2, 1, 'Clásico de ciencia ficción', 'Fundación es un clásico', 1, NULL, '2024-01-02 10:00:00'),
(2, 7, 'Solaris pendiente', 'Quiero leer Solaris este año', 2, NULL, '2024-01-02 10:05:00'),
(2, 8, 'Interés en Buenos presagios', 'Buenos presagios me llama la atención', 3, NULL, '2024-01-02 10:10:00'),
(2, 9, 'Parentesco en lista', 'Quiero leer Parentesco de Octavia Butler este año', 4, NULL, '2024-01-02 10:15:00'),
(2, 10, 'Marte rojo recomendado', 'Marte rojo de Kim Stanley Robinson es muy realista', 5, NULL, '2024-01-02 10:20:00'),
-- Lista 3: Terror y Misterio
(3, 4, 'Terror puro', 'It da mucho miedo', 5, NULL, '2024-01-03 10:00:00'),
(3, 9, 'Salem''s Lot brutal', 'El misterio de Salem''s Lot es brutal', 5, NULL, '2024-01-03 10:05:00'),
(3, 10, 'Intriga en la mansión', 'El legado de la mansión es muy intrigante', 4, NULL, '2024-01-03 10:10:00'),
-- Lista 4: Ciencia Ficción Top
(4, 1, 'Dune imprescindible', 'Dune de Frank Herbert es imprescindible', 4, NULL, '2024-01-04 10:00:00'),
(4, 2, 'Visión futurista', 'Me fascina la visión de futuro de Asimov en Fundación', 4, NULL, '2024-01-04 10:05:00'),
(4, 3, 'Solaris reflexivo', 'Solaris de Lem me dejó pensando días', 3, NULL, '2024-01-04 10:10:00'),
(4, 4, 'Tres cuerpos brutal', 'El problema de los tres cuerpos de Cixin Liu es brutal', 5, NULL, '2024-01-04 10:15:00'),
(4, 5, 'Originalidad Le Guin', 'La mano izquierda de la oscuridad de Le Guin es muy original', 4, NULL, '2024-01-04 10:20:00'),
(4, 6, 'Ciberpunk puro', 'Snow Crash de Stephenson es puro ciberpunk', 3, NULL, '2024-01-04 10:25:00'),
(4, 7, 'Distopía inquietante', 'El cuento de la criada de Atwood es inquietante', 4, NULL, '2024-01-04 10:30:00'),
(4, 8, 'Clásico espacial', '2001 de Arthur C. Clarke es un clásico del género', 3, NULL, '2024-01-04 10:35:00'),
(4, 6, 'Variedad de ciencia ficción', 'Ciencia ficción para todos los gustos', 4, NULL, '2024-01-04 10:40:00'),
(4, 8, 'Joya oculta', 'El códice de las sombras es una joya', 5, NULL, '2024-01-04 10:45:00'),
-- Lista 5: Clásicos imprescindibles
(5, 1, 'Lectura obligada', 'Clásicos que hay que leer sí o sí', 4, NULL, '2024-01-05 10:00:00'),
(5, 2, 'Variedad de géneros', 'Me encanta la variedad de géneros', 4, NULL, '2024-01-05 10:05:00'),
(5, 3, 'Imprescindibles distópicos', 'Fahrenheit 451 y Un mundo feliz son imprescindibles', 4, NULL, '2024-01-05 10:10:00'),
-- Lista 6: Novedades y coautorías
(6, 4, 'Selección de novedades', 'Interesante selección de novedades', 3, NULL, '2024-01-06 10:00:00'),
(6, 5, 'Coautoría valorada', 'Me gustan los libros escritos a varias manos', 4, NULL, '2024-01-06 10:05:00'),
(6, 6, 'Curiosidad literaria', 'Placeholder B es curioso', 3, NULL, '2024-01-06 10:10:00'),
(6, 7, 'Sorpresa positiva', 'Historia inventada sorprende para bien', 3, NULL, '2024-01-06 10:15:00'),
-- Lista 7: Libros para regalar
(7, 2, 'Regalo perfecto', 'Este año regalaré LOTR', 5, NULL, '2024-01-07 10:00:00'),
(7, 3, 'Ciencia ficción para todos', 'Fundación nunca falla como regalo', 5, NULL, '2024-01-07 10:05:00'),
-- Lista 8: Lecturas de verano
(8, 4, 'Verano de terror', 'Drácula es ideal para el verano', 4, NULL, '2024-01-08 10:00:00'),
(8, 5, 'Clásico corto', 'El gato negro se lee en una tarde', 3, NULL, '2024-01-08 10:05:00'),
-- Lista 9: Pendientes de leer
(9, 6, 'Pendiente', 'La Sombra del Viento está en mi lista', 4, NULL, '2024-01-09 10:00:00'),
(9, 7, 'Recomendación', 'El nombre de la rosa es mi próxima lectura', 4, NULL, '2024-01-09 10:05:00'),
-- Lista 10: Libros cortos
(10, 8, 'Corto pero intenso', 'Fahrenheit 451 es breve y potente', 4, NULL, '2024-01-10 10:00:00'),
(10, 9, 'Androides', '¿Sueñan los androides...? es corto y genial', 4, NULL, '2024-01-10 10:05:00'),
-- Lista 11: Libros premiados
(11, 10, 'Premio merecido', 'Forastero en tierra extraña es imprescindible', 5, NULL, '2024-01-11 10:00:00'),
(11, 1, 'Dune', 'Dune ha ganado muchos premios', 5, NULL, '2024-01-11 10:05:00');

/* ============================
   RELACIÓN G: LISTA-USUARIO
   ============================ */
INSERT INTO lista_usuario (id_lista, id_usuario, me_gusta_lista) VALUES
(1, 2, 1),
(1, 3, 1),
(1, 5, 0),
(1, 6, 0),
(2, 1, 0),
(2, 7, 1),
(2, 8, 1),
(3, 4, 1),
(3, 9, 0),
(3, 10, 1),
(4, 1, 1),
(4, 6, 0),
(4, 8, 0),
(5, 1, 1),
(5, 2, 1),
(5, 3, 1),
(6, 4, 1),
(6, 5, 0),
(6, 6, 0),
(6, 7, 1),
(7, 2, 1), (7, 3, 1), (7, 4, 0),
(8, 5, 1), (8, 6, 1), (8, 7, 0),
(9, 8, 1), (9, 9, 1), (9, 10, 0),
(10, 1, 1), (10, 2, 1), (10, 3, 0),
(11, 4, 1), (11, 5, 1), (11, 6, 0);


INSERT INTO lista_comentario (id_lista, id_usuario, titulo_comentario, texto_comentario, id_com_respuesta, fecha_comentario, calificacion_comentario) VALUES
(1, 2, NULL, '', NULL, '2024-01-01 00:00:00', 5),
(1, 3, NULL, '', NULL, '2024-01-01 00:00:00', 4),
(1, 5, NULL, '', NULL, '2024-01-01 00:00:00', 3),
(1, 6, NULL, '', NULL, '2024-01-01 00:00:00', 2),
(2, 1, NULL, '', NULL, '2024-01-01 00:00:00', 3),
(2, 7, NULL, '', NULL, '2024-01-01 00:00:00', 4),
(2, 8, NULL, '', NULL, '2024-01-01 00:00:00', 5),
(3, 4, NULL, '', NULL, '2024-01-01 00:00:00', 5),
(3, 9, NULL, '', NULL, '2024-01-01 00:00:00', 3),
(3, 10, NULL, '', NULL, '2024-01-01 00:00:00', 4),
(4, 1, NULL, '', NULL, '2024-01-01 00:00:00', 4),
(4, 6, NULL, '', NULL, '2024-01-01 00:00:00', 3),
(4, 8, NULL, '', NULL, '2024-01-01 00:00:00', 2),
(5, 1, NULL, '', NULL, '2024-01-01 00:00:00', 5),
(5, 2, NULL, '', NULL, '2024-01-01 00:00:00', 4),
(5, 3, NULL, '', NULL, '2024-01-01 00:00:00', 5),
(6, 4, NULL, '', NULL, '2024-01-01 00:00:00', 4),
(6, 5, NULL, '', NULL, '2024-01-01 00:00:00', 3),
(6, 6, NULL, '', NULL, '2024-01-01 00:00:00', 2),
(6, 7, NULL, '', NULL, '2024-01-01 00:00:00', 4),
(7, 2, NULL, '', NULL, '2024-01-01 00:00:00', 5), (7, 3, NULL, '', NULL, '2024-01-01 00:00:00', 4), (7, 4, NULL, '', NULL, '2024-01-01 00:00:00', 3),
(8, 5, NULL, '', NULL, '2024-01-01 00:00:00', 5), (8, 6, NULL, '', NULL, '2024-01-01 00:00:00', 4), (8, 7, NULL, '', NULL, '2024-01-01 00:00:00', 3),
(9, 8, NULL, '', NULL, '2024-01-01 00:00:00', 5), (9, 9, NULL, '', NULL, '2024-01-01 00:00:00', 4), (9, 10, NULL, '', NULL, '2024-01-01 00:00:00', 3),
(10, 1, NULL, '', NULL, '2024-01-01 00:00:00', 5), (10, 2, NULL, '', NULL, '2024-01-01 00:00:00', 4), (10, 3, NULL, '', NULL, '2024-01-01 00:00:00', 3),
(11, 4, NULL, '', NULL, '2024-01-01 00:00:00', 5), (11, 5, NULL, '', NULL, '2024-01-01 00:00:00', 4), (11, 6, NULL, '', NULL, '2024-01-01 00:00:00', 3);

/* ============================
   EVENTOS
   ============================ */
INSERT INTO evento (id_usuarioCrd, nombre_evento, fecha_evento, hora_evento, direccion_evento, descripcion_evento) VALUES
(1, 'Club de lectura Enero', '2026-01-15', '18:00:00', 'Calle Mayor 10', 'Debate sobre libros clásicos'),
(2, 'Reunión Sci-Fi', '2026-02-20', '19:30:00', 'Av. Futuro 22', 'Charla sobre ciencia ficción'),
(3, 'Noche de Terror', '2026-06-30', '21:00:00', 'Casa del Miedo', 'Lectura de relatos de terror'),
-- Evento 4: Debate sobre distopías (pasado)
(4, 'Debate sobre distopías', '2026-03-10', '18:30:00', 'Biblioteca Central', 'Debate sobre novelas distópicas clásicas y modernas'),
-- Evento 5: Presentación de libro (pasado)
(5, 'Presentación de "Historia inventada"', '2026-05-10', '19:00:00', 'Librería El Búho', 'Presentación y firma de la novela "Historia inventada"'),
-- Evento 6: Maratón de lectura veraniega (futuro)
(6, 'Maratón de lectura veraniega', '2026-06-15', '17:00:00', 'Parque del Sol', 'Lectura colectiva de libros cortos para el verano'),
-- Evento 7: Encuentro de autores (futuro)
(7, 'Encuentro de autores', '2026-07-20', '20:00:00', 'Centro Cultural', 'Charla y networking con autores y lectores'),

-- Pasados adicionales
(8, 'Debate de Ensayo', '2026-01-25', '18:30:00', 'Aula Magna', 'Debate sobre ensayos literarios y no ficción'),
(9, 'Cómic y Novela Gráfica', '2026-02-15', '18:00:00', 'Sala Comic', 'Encuentro sobre cómic y novela gráfica'),
(10, 'Círculo de Poesía', '2026-03-01', '19:00:00', 'Jardín Literario', 'Lectura y creación de poesía'),
(1, 'Terror Otoñal', '2026-03-10', '20:00:00', 'Casa Encantada', 'Lectura de relatos de terror para otoño'),
(2, 'Cierre de Invierno', '2026-05-28', '21:00:00', 'Salón Principal', 'Fiesta y balance de lecturas de invierno'),
-- Futuros adicionales
(3, 'Encuentro Primavera', '2026-08-01', '18:30:00', 'Sala Primavera', 'Lecturas y actividades de primavera'),
(4, 'Cómic y Novela Gráfica II', '2026-08-15', '18:00:00', 'Sala Comic', 'Segundo encuentro sobre cómic y novela gráfica'),
(5, 'Círculo de Poesía II', '2026-09-01', '19:00:00', 'Jardín Literario', 'Nueva edición de poesía'),
(6, 'Terror Otoñal II', '2026-10-10', '20:00:00', 'Casa Encantada', 'Segunda lectura de relatos de terror para otoño'),
(7, 'Cierre de Temporada', '2026-12-01', '21:00:00', 'Salón Principal', 'Fiesta y balance de lecturas anuales');

/* ============================
   RELACIÓN H: EVENTO-USUARIO
   ============================ */
INSERT INTO evento_usuario VALUES
-- Evento 1
(1, 1, true, true),   -- asiste
(1, 2, NULL, NULL),   -- sin respuesta
(1, 3, NULL, NULL), -- sin respuesta
-- Evento 2
(2, 1, true, NULL),
(2, 4, false, NULL),   -- no asiste
-- Evento 3
(3, 3, true, NULL),
-- Evento 4
(4, 1, true, NULL),(4, 2, true, NULL),(4, 3, true, NULL),(4, 4, NULL, NULL),
-- Evento 5
(5, 5, true, NULL),(5, 6, NULL, NULL),(5, 7, NULL, NULL),
-- Evento 6
(6, 8, NULL, NULL),(6, 9, true, NULL),(6, 10, true, NULL),
-- Evento 7
(7, 1, NULL, NULL),(7, 2, true, NULL),(7, 3, true, NULL),(7, 11, true, NULL),
-- Pasados adicionales
(8, 2, true, true), (8, 3, true, false), (8, 4, NULL, NULL),
(9, 5, true, true), (9, 6, true, false), (9, 7, NULL, NULL),
(10, 8, NULL, false), (10, 9, true, true), (10, 10, true, false),
(11, 1, true, true), (11, 2, true, true), (11, 3, true, true),
(12, 4, NULL, NULL), (12, 5, true, true), (12, 6, true, false),
-- Futuros adicionales
(13, 7, true, true), (13, 8, true, NULL), (13, 9, NULL, NULL),
(14, 2, true, NULL), (14, 3, true, NULL), (14, 4, NULL, NULL),
(15, 5, true, true), (15, 6, true, NULL), (15, 7, NULL, NULL),
(16, 8, NULL, NULL), (16, 9, true, true), (16, 10, true, true),
(17, 1, true, true), (17, 2, true, true), (17, 3, true, NULL);

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
(3, 10, 'Texto de usuario10 en evento 3', NULL),
-- Evento 4
(4, 1, 'Un mundo feliz y Fahrenheit 451 son mis favoritos', NULL),
(4, 2, 'Me gustaría debatir sobre el control social en las distopías', NULL),
(4, 3, '¿Alguien leyó Parentesco?', NULL),
(4, 4, 'Las distopías modernas también son interesantes', NULL),
-- Evento 5
(5, 5, '¡Gracias por venir a la presentación!', NULL),
(5, 6, 'Me encantó la firma de libros', NULL),
(5, 7, 'Espero que haya más eventos así', NULL),
-- Evento 6
(6, 8, '¿Qué libros cortos recomiendan para el verano?', NULL),
(6, 9, 'Me apunto a la maratón', NULL),
(6, 10, '¡Llevaré bocadillos!', NULL),
-- Evento 7
(7, 1, 'Será genial conocer a los autores', NULL),
(7, 2, '¿Habrá firma de libros?', NULL),
(7, 3, '¡No falten!', NULL),
(7, 11, 'Confirmo mi asistencia como autor', NULL),
-- Pasados adicionales
(8, 2, 'Los ensayos también son literatura', NULL),
(8, 3, 'Me interesa la no ficción', NULL),
(8, 4, '¿Habrá debate abierto?', NULL),
(9, 5, 'Me encantan los cómics', NULL),
(9, 6, '¿Alguien recomienda novela gráfica?', NULL),
(9, 7, 'Voy a llevar mi colección', NULL),
(10, 8, 'La poesía es vida', NULL),
(10, 9, '¿Habrá micro abierto?', NULL),
(10, 10, 'Quiero leer mis versos', NULL),
(11, 1, 'Terror en otoño, planazo', NULL),
(11, 2, '¿Se puede ir disfrazado?', NULL),
(11, 3, 'Llevaré calabazas', NULL),
(12, 4, 'Gran invierno de lecturas', NULL),
(12, 5, 'Espero repetir el próximo año', NULL),
(12, 6, '¡Gracias a todos!', NULL),
-- Futuros adicionales
(13, 7, 'Lecturas de primavera', NULL),
(13, 8, '¿Habrá actividades al aire libre?', NULL),
(13, 9, 'Llevaré bocadillos', NULL),
(14, 2, 'Me encantan los cómics', NULL),
(14, 3, '¿Alguien recomienda novela gráfica?', NULL),
(14, 4, 'Voy a llevar mi colección', NULL),
(15, 5, 'La poesía es vida', NULL),
(15, 6, '¿Habrá micro abierto?', NULL),
(15, 7, 'Quiero leer mis versos', NULL),
(16, 8, 'Terror en otoño, planazo', NULL),
(16, 9, '¿Se puede ir disfrazado?', NULL),
(16, 10, 'Llevaré calabazas', NULL),
(17, 1, 'Gran año de lecturas', NULL),
(17, 2, 'Espero repetir el próximo año', NULL),
(17, 3, '¡Gracias a todos!', NULL);

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
(3, 20, FALSE), -- Frankenstein en Noche de Terror
-- Evento 4: Debate sobre distopías
(4, 11, TRUE),   -- Fahrenheit 451 principal
(4, 23, FALSE),  -- Un mundo feliz
(4, 12, FALSE),  -- ¿Sueñan los androides...?
-- Evento 5: Presentación de "Historia inventada"
(5, 38, TRUE),   -- Historia inventada principal
(5, 36, FALSE),  -- Placeholder B
-- Evento 6: Maratón de lectura veraniega
(6, 6, TRUE),    -- El gato negro principal
(6, 36, FALSE),  -- Placeholder B
(6, 40, FALSE),  -- Libro sin género ni autor
-- Evento 7: Encuentro de autores
(7, 32, TRUE),   -- El códice de las sombras principal
(7, 35, FALSE),  -- Placeholder A
(7, 1, FALSE),   -- LOTR

-- Pasados adicionales
(8, 9, TRUE), (8, 8, FALSE), (8, 40, FALSE),
(9, 12, TRUE), (9, 20, FALSE), (9, 28, FALSE),
(10, 30, TRUE), (10, 32, FALSE), (10, 35, FALSE),
(11, 3, TRUE), (11, 4, FALSE), (11, 37, FALSE),
(12, 1, TRUE), (12, 14, FALSE), (12, 23, FALSE),
-- Futuros adicionales
(13, 7, TRUE), (13, 8, FALSE), (13, 31, FALSE),
(14, 12, TRUE), (14, 20, FALSE), (14, 28, FALSE),
(15, 30, TRUE), (15, 32, FALSE), (15, 35, FALSE),
(16, 3, TRUE), (16, 4, FALSE), (16, 37, FALSE),
(17, 1, TRUE), (17, 14, FALSE), (17, 23, FALSE);

/* ============================
   SESIONES
   ============================ */
SET @ahora := NOW();
INSERT INTO sesiones (token, id_usuario, expira, fecha_inicio_sesion) VALUES
('seed-session-expirada-1', 7, DATE_SUB(@ahora, INTERVAL 10 DAY), DATE_SUB(DATE_SUB(@ahora, INTERVAL 10 DAY), INTERVAL 30 DAY)),
('seed-session-expirada-2', 2, DATE_SUB(@ahora, INTERVAL 2 DAY), DATE_SUB(DATE_SUB(@ahora, INTERVAL 2 DAY), INTERVAL 30 DAY)),
('seed-session-5m-1', 3, DATE_ADD(@ahora, INTERVAL 5 MINUTE), DATE_SUB(DATE_ADD(@ahora, INTERVAL 5 MINUTE), INTERVAL 30 DAY)),
('seed-session-5m-2', 4, DATE_ADD(@ahora, INTERVAL 5 MINUTE), DATE_SUB(DATE_ADD(@ahora, INTERVAL 5 MINUTE), INTERVAL 30 DAY)),
('seed-session-10m-1', 5, DATE_ADD(@ahora, INTERVAL 10 MINUTE), DATE_SUB(DATE_ADD(@ahora, INTERVAL 10 MINUTE), INTERVAL 30 DAY)),
('seed-session-10m-2', 6, DATE_ADD(@ahora, INTERVAL 10 MINUTE), DATE_SUB(DATE_ADD(@ahora, INTERVAL 10 MINUTE), INTERVAL 30 DAY)),
('seed-session-semana-1', 1, DATE_ADD(@ahora, INTERVAL 7 DAY), DATE_SUB(DATE_ADD(@ahora, INTERVAL 7 DAY), INTERVAL 30 DAY)),
('seed-session-semana-2', 8, DATE_ADD(@ahora, INTERVAL 8 DAY), DATE_SUB(DATE_ADD(@ahora, INTERVAL 8 DAY), INTERVAL 30 DAY));
