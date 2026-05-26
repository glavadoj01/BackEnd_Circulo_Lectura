// ============================================
// TABLAS PRINCIPALES
// ============================================

// Entidades Fuertes
export interface UsuarioBD {
	id_usuario: number;
	nombre_usuario: string;
	email_usuario: string;
	nombre_real: string;
	apellido_usuario?: string;
	fecha_registro_usuario: Date | string;
	esAdministrador: 0 | 1 | 2; // 0: No, 1: Mod, 2: Admin
}

export interface GeneroBD {
	id_genero: number;
	nombre_genero: string;
	descripcion_genero?: string;
}

export interface IdiomaBD {
	id_idioma: number;
	nombre_idioma: string;
}

export interface LibroBD {
	id_libro: number;
	titulo_libro: string;
	codigo_isbn?: string;
	id_idioma_original: number | string; // FK a Idioma
	paginas?: number;
	year_publicacion?: number;
	sinopsis?: string;
}

export interface AutorBD {
	id_autor: number;
	id_usuario?: number; // FK a Usuario (si el autor es también usuario)
	nombre_autor: string;
	apellido_autor: string;
	pais_autor: string;
	esUsuario: boolean; // (0-1)
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

export interface CategoriaBD {
	id_categoria: number;
	nombre_categoria: string;
}

export interface ListaCategoriaBD {
	id_lista: number; // FK a Lista
	id_categoria: number; // FK a Categoria
}

// ============================================
// TABLAS INTERMEDIAS CON DATOS ADICIONALES
// ============================================

export interface LibroGenero {
	id_libro: number; // FK
	id_genero: number; // FK
}

// Relación B: Libro-Autor
export interface LibroAutor {
	id_libro: number; // FK
	id_autor: number; // FK
	autorPr: boolean; // true = autor principal, false = secundario
}

// Relación C: Lista-Contenido (Libros que pertenecen a una lista)
export interface ListaContenido {
	id_lista: number; // FK
	id_libro: number; // FK
	posicion?: number; // Posición del libro dentro de la lista (opcional, para ordenar)
}

// Relación D: Libro-Usuario (Libro Leído-Seguido)
export interface LibroUsuario {
	id_libro: number; // FK
	id_usuario: number; // FK
	estado_lectura?: boolean | null; // 0-1
	me_gusta_libro?: boolean | null; // 0:No  1:Sí
}

// Relación E: Libro-Critica (Reseña)
export interface LibroCritica {
	id_libro: number; // FK
	id_usuario: number; // FK
	titulo_comentario?: string;
	texto_comentario?: string;
	calificacion_comentario: number; // 0-5
	fecha_comentario: Date | string;
}

// Relación F: Lista-Comentario
export interface ListaComentarios {
	id_listaComentario: number; // PK
	id_lista: number; // FK
	id_usuario: number; // FK
	titulo_comentario?: string;
	texto_comentario: string;
	calificacion_comentario?: number | null; // si el comentario incluye una calificación (0-5)
	id_com_respuesta?: number | null; // FK recursiva (puede ser null)
	fecha_comentario: Date | string;
}

// Relación G: Lista-Usuario (Calificación de la lista)
export interface ListaUsuario {
	id_lista: number; // FK
	id_usuario: number; // FK
	me_gusta_lista?: boolean | null; // 0: No, 1: Sí
}

// Relación H: Usuario-Evento (Asistencia y me gusta del evento)
export interface EventoUsuario {
	id_evento: number; // FK
	id_usuario: number; // FK
	asiste?: boolean | null; // 0: No, 1: Sí
	me_gusta_evento?: boolean | null; // 0: No, 1: Sí
}

// Relación I: Evento-Comentario
export interface EventoComentario {
	id_eventoComentario: number; // PK
	id_evento: number; // FK
	id_usuario: number; // FK
	texto_comentario: string;
	calificacion_comentario?: number | null; // 0-5
	id_com_respuesta?: number | null; // FK recursiva (puede ser null)
	fecha_comentario: Date | string;
}

// Relación J: Evento-Libro (Libros relacionados al evento)
export interface EventoContieneLibro {
	id_evento: number; // FK
	id_libro: number; // FK
	libroPr: boolean; // true = libro principal/destacado
}

export interface SesionBD {
	token: string;
	id_usuario: number; // FK a Usuario
	expira: Date | string;
	fecha_inicio_sesion: Date | string;
}
