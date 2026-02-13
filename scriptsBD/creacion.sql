DROP DATABASE IF EXISTS circuloLectura;
CREATE DATABASE circuloLectura
	CHARACTER SET utf8mb4
    COLLATE utf8mb4_spanish_ci;
USE circuloLectura;

/* Entidades FUERTES */
CREATE TABLE usuario (
	id_usuario 		INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario 	VARCHAR(50) UNIQUE NOT NULL,
    nombre_real 	VARCHAR(50) NOT NULL,
    apellido_usuario VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE genero (
	id_genero 			INT PRIMARY KEY AUTO_INCREMENT,
    nombre_genero 		VARCHAR(100) UNIQUE NOT NULL,
    descripcion_genero 	TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE idiomas (
    id_idioma 			INT PRIMARY KEY AUTO_INCREMENT,
    nombre_idioma 		VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE libro (
	id_libro 		 INT PRIMARY KEY AUTO_INCREMENT,
    titulo_libro 	 VARCHAR(100) NOT NULL,
    codigo_isbn 	 VARCHAR(20),
    idioma_original  INT,
    paginas 		 INT,
    year_publicacion INT,
    sinopsis 		 TEXT,

    CONSTRAINT fk_libro_idiomaOriginal
        FOREIGN KEY (idioma_original)
        REFERENCES idiomas(id_idioma)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

/* Entidades DEBILES */
CREATE TABLE autor (
	id_autor 		INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario 		INT DEFAULT NULL,
    nombre_autor 	VARCHAR(50) NOT NULL,
    apellido_autor 	VARCHAR(50),
    pais_autor 		VARCHAR(100),
    esUsuario 		BOOL NOT NULL DEFAULT FALSE,
    
    CONSTRAINT fk_autor_usuario 
		FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE lista (
	id_lista 			INT PRIMARY KEY AUTO_INCREMENT,
    id_usuarioCrd 		INT,
    nombre_lista 		VARCHAR(100) UNIQUE NOT NULL,
    descripcion_lista 	TEXT,
    
    CONSTRAINT fk_lista_usuario 
		FOREIGN KEY (id_usuarioCrd)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE evento (
	id_evento 			INT PRIMARY KEY AUTO_INCREMENT,
    id_usuarioCrd 			INT NOT NULL,
    nombre_evento 		VARCHAR(100) NOT NULL,
    fecha_evento 		DATE NOT NULL, -- YYYY-MM-DD
    hora_evento 		TIME, 		   -- HH:MM:SS
    direccion_evento 	VARCHAR(200),
	descripcion_evento 	TEXT NOT NULL,
    
    CONSTRAINT fk_evento_usuario
		FOREIGN KEY (id_usuarioCrd)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

/* Tablas derivadas de relaciones N:M */

/* NOTA: Relacion-Thª	=> guión		=> Libro-Genero	=> Escritura Humana
		 Nombre_Tabla 	=> barra_baja	=> libro_genero	=> Sintaxis SQL (no acepta guión)
         foreingKey     => camelCase	=> libroGenero	=> Legibilidad de tablaNombre_atributoSeleccionado
    Ej:     
		fk_nombreRelacion_atributo
        fk_libroGenero_idLibro
*/

-- Relación A: Libro-Genero
CREATE TABLE libro_genero (
    id_libro   INT NOT NULL,
    id_genero  INT NOT NULL,

    PRIMARY KEY (id_libro, id_genero),

    CONSTRAINT fk_libroGenero_idLibro
        FOREIGN KEY (id_libro)
        REFERENCES libro(id_libro)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_libroGenero_idGenero
        FOREIGN KEY (id_genero)
        REFERENCES genero(id_genero)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Relación B: Libro-Autor
CREATE TABLE libro_autor (
	id_libro INT NOT NULL,
    id_autor INT NOT NULL,
    autorPr BOOL NOT NULL DEFAULT FALSE,
    
    PRIMARY KEY (id_libro, id_autor),
    
    CONSTRAINT fk_libroAutor_idLibro
		FOREIGN KEY (id_libro)
        REFERENCES libro(id_libro)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	
    CONSTRAINT fk_libroAutor_idAutor
		FOREIGN KEY (id_autor)
        REFERENCES autor(id_autor)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Relación C: Lista-Contenido
CREATE TABLE lista_contenido (
    id_lista INT NOT NULL,
    id_libro INT NOT NULL,

    PRIMARY KEY (id_lista, id_libro),

    CONSTRAINT fk_listaContenido_idLista
        FOREIGN KEY (id_lista)
        REFERENCES lista(id_lista)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_listaContenido_idLibro
        FOREIGN KEY (id_libro)
        REFERENCES libro(id_libro)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Relación D: Libro-Usuario
CREATE TABLE libro_usuario (
    id_libro   		INT NOT NULL,
    id_usuario 		INT NOT NULL,
    estado_lectura  BOOL DEFAULT FALSE NOT NULL, -- FALSE/0: Pendiente  TRUE/1: Leido

    PRIMARY KEY (id_libro, id_usuario),

    CONSTRAINT fk_libroUsuario_idLibro
        FOREIGN KEY (id_libro)
        REFERENCES libro(id_libro)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_libroUsuario_idUsuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Relación E: Libro-Critica
CREATE TABLE libro_critica (
    id_libro    		INT NOT NULL,
    id_usuario  		INT NOT NULL,
    titulo_critica		VARCHAR(100),
    texto_critica 		TEXT,
    calificacion_libro 	TINYINT UNSIGNED NOT NULL CHECK (calificacion_libro BETWEEN 0 AND 5),
    fecha_critica 		DATETIME NOT NULL DEFAULT now(), -- YYYY-MM-DD:HH:MM:SS

    PRIMARY KEY (id_libro, id_usuario),

    CONSTRAINT fk_libroCritica_idLibro
        FOREIGN KEY (id_libro)
        REFERENCES libro(id_libro)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_libroCritica_idUsuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Relación F: Lista-Comentario
CREATE TABLE lista_comentario (
    id_listaComentario  INT PRIMARY KEY AUTO_INCREMENT,
    id_lista            INT NOT NULL,
    id_usuario          INT NOT NULL,
    texto_comentario    TEXT NOT NULL,
    id_com_respuesta    INT DEFAULT NULL,
    fecha_comentario	DATETIME NOT NULL DEFAULT now(), -- YYYY-MM-DD:HH:MM:SS


    CONSTRAINT fk_listaComentario_idLista
        FOREIGN KEY (id_lista)
        REFERENCES lista(id_lista)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_listaComentario_idUsuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_listaComentario_idRespuesta
        FOREIGN KEY (id_com_respuesta)
        REFERENCES lista_comentario(id_listaComentario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Relación G: Lista-Usuario
CREATE TABLE lista_usuario (
    id_lista        	INT NOT NULL,
    id_usuario      	INT NOT NULL,
    calificacion_lista	TINYINT UNSIGNED DEFAULT NULL CHECK (calificacion_lista BETWEEN 0 AND 5),

    PRIMARY KEY (id_lista, id_usuario),

    CONSTRAINT fk_listaUsuario_idLista
        FOREIGN KEY (id_lista)
        REFERENCES lista(id_lista)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_listaUsuario_idUsuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Relación H: Usuario-Evento
CREATE TABLE evento_usuario (
	id_evento       	INT NOT NULL,
    id_usuario      	INT NOT NULL,
    calificacion_evento	TINYINT UNSIGNED DEFAULT NULL CHECK (calificacion_evento BETWEEN 0 AND 5),
    asiste          	TINYINT UNSIGNED DEFAULT NULL CHECK (asiste IN (0,1,2)), -- 0:No  1:Sí  2:Quizas

    PRIMARY KEY (id_evento, id_usuario),

    CONSTRAINT fk_eventoUsuario_idUsuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_eventoUsuario_idEvento
        FOREIGN KEY (id_evento)
        REFERENCES evento(id_evento)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Relación I: Evento-Comentario
CREATE TABLE evento_comentario (
    id_eventoComentario INT PRIMARY KEY AUTO_INCREMENT,
    id_evento           INT NOT NULL,
    id_usuario          INT NOT NULL,
    texto_comentario    TEXT NOT NULL,
    id_com_respuesta    INT DEFAULT NULL,
    fecha_comentario    DATETIME NOT NULL DEFAULT now(), -- YYYY-MM-DD:HH:MM:SS

    CONSTRAINT fk_eventoComentario_idEvento
        FOREIGN KEY (id_evento)
        REFERENCES evento(id_evento)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_eventoComentario_idUsuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_eventoComentario_idRespuesta
        FOREIGN KEY (id_com_respuesta)
        REFERENCES evento_comentario(id_eventoComentario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Relación H: Evento-Contenido
CREATE TABLE evento_contenido (
    id_evento   INT NOT NULL,
    id_libro    INT NOT NULL,
    libroPr     BOOL DEFAULT FALSE,

    PRIMARY KEY (id_evento, id_libro),

    CONSTRAINT fk_eventoContenido_idEvento
        FOREIGN KEY (id_evento)
        REFERENCES evento(id_evento)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_eventoContenido_idLibro
        FOREIGN KEY (id_libro)
        REFERENCES libro(id_libro)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
