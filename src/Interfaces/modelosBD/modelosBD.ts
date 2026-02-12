// ============================================
// TABLAS PRINCIPALES
// ============================================

// Entidades Fuertes
export interface UsuarioBD {
	id_usuario: number;
	nombre_usuario: string;
	nombre_real: string;
	apellido_usuario?: string;
	esAdministrador: boolean; // 0: No, 1: Mod, 2: Admin
}

export interface GeneroBD {
	id_genero: number;
	nombre_genero: GeneroNombre;
	descripcion_genero?: string;
}

// Para typado externo (sin ID)
export interface GeneroNombre {
	nombre_genero: string;
}

export interface IdiomaBD {
	id_idioma: number;
	nombre_idioma: IdiomaNombre;
}

// Para typado externo (sin ID)
export interface IdiomaNombre {
	nombre_idioma: string;
}

export interface LibroBD {
	id_libro: number;
	titulo_libro: string;
	codigo_isbn?: string;
	idioma_original: number | string; // FK a Idioma
	paginas?: number;
	year_publicacion?: number;
	sinopsis?: string;
}

export interface AutorBD {
	id_autor: number;
	id_usuario?: number; // FK a Usuario (si el autor es también usuario)
	nombre_autor: AutorNombre;
	apellido_autor: AutorApellido;
	pais_autor: string;
	esUsuario: boolean; // (0-1)
}
// Para typado externo (sin ID)
export interface AutorNombre {
	nombre_autor: string;
}
export interface AutorApellido {
	apellido_autor: string;
}

// Entidades Débiles
export interface ListaBD {
	id_lista: number;
	id_usuarioCrd: number; // FK a Usuario (creador)
	nombre_lista: string;
	descripcion_lista?: string;
}

export interface EventoBD {
	id_evento: number;
	id_usuarioCrd: number; // FK a Usuario (creador)
	nombre_evento: string;
	fecha_evento: Date; // o string dependiendo cómo lo manejes
	hora_evento?: string; // "HH:MM:SS"
	direccion_evento?: string;
	descripcion_evento: string;
}

// ============================================
// TABLAS INTERMEDIAS CON DATOS ADICIONALES
// ============================================

// Relación B: Libro-Autor
export interface LibroAutor {
	id_libro: number; // FK
	id_escritor: number; // FK
	autorPr: boolean; // true = autor principal, false = secundario
}

// Relación D: Libro-Usuario (Libro Leído-Seguido)
export interface LibroUsuario {
	id_libro: number; // FK
	id_usuario: number; // FK
	estado_lectura: Boolean; // 0-1
}

// Relación E: Libro-Critica (Reseña)
export interface LibroCritica {
	id_libro: number; // FK
	id_usuario: number; // FK
	titulo_critica?: string;
	texto_critica?: string;
	calificacion_libro: number; // 0-5
	fecha_critica: Date | string;
}

// Relación F: Lista-Comentario
export interface ListaComentarios {
	id_listaComentario: number; // PK
	id_lista: number; // FK
	id_usuario: number; // FK
	texto_comentario: string;
	id_com_respuesta?: number | null; // FK recursiva (puede ser null)
	fecha_comentario: Date | string;
}

// Relación G: Lista-Usuario (Calificación de la lista)
export interface ListaUsuario {
	id_lista: number; // FK
	id_usuario: number; // FK
	calificacion_lista?: number | null; // 0-5
}

// Relación H: Usuario-Evento (Asistencia y Calificación del evento)
export interface EventoUsuario {
	id_evento: number; // FK
	id_usuario: number; // FK
	calificacion_evento?: number; // 0-5
	asiste?: number | null; // 0: No, 1: Si, 2: Quizas
}

// Relación I: Evento-Comentario
export interface EventoComentario {
	id_eventoComentario: number; // PK
	id_evento: number; // FK
	id_usuario: number; // FK
	texto_comentario: string;
	id_com_respuesta?: number | null; // FK recursiva (puede ser null)
	fecha_comentario: Date | string;
}

// Relación J: Evento-Libro (Libros relacionados al evento)
export interface EventoContieneLibro {
	id_evento: number; // FK
	id_libro: number; // FK
	libroPr: boolean; // true = libro principal/destacado
}
