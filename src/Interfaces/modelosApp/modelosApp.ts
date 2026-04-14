import {
  AutorApellido,
  AutorNombre,
  GeneroNombre,
  LibroBD,
  LibroCritica,
  ListaBD,
  ListaComentarios,
} from './../modelosBD/modelosBD.js';

/****************** INTERFACES DE LA CAPA DE APLICACIÓN ******************/

/**
 * Interfaz que representa un libro en la capa de aplicación, extendiendo la información básica del libro con detalles adicionales como autores, géneros, calificación promedio y total de reseñas.
 * - id_libro: número identificador único del libro.
 * - titulo_libro: título del libro.
 * - codigo_isbn: código ISBN del libro (opcional).
 * - id_idioma_original: número identificador del idioma original del libro (opcional).
 * - paginas: número de páginas del libro (opcional).
 * - year_publicacion: año de publicación del libro (opcional).
 * - sinopsis: breve descripción del libro (opcional).
 * - autores: array de objetos que representan los autores del libro, cada uno con su nombre, apellido e ID.
 * - generos: array de objetos que representan los géneros del libro, cada uno con su nombre.
 * - totalResenas: número total de reseñas que tiene el libro (opcional).
 * - calificacionPromedio: calificación promedio del libro basada en las reseñas (opcional).
 * - nombre_idioma_original: nombre del idioma original del libro (opcional).
 */
export interface LibroApp extends LibroBD {
  autores?: Array<{ nombre_autor: AutorNombre; apellido_autor: AutorApellido; id_autor: number }>; // Lista de autores del libro
  generos?: Array<{ nombre_genero: GeneroNombre }>; // Lista de géneros del libro
  totalResenas?: number; // Total de reseñas del libro
  calificacionPromedio?: number; // Calificación promedio del libro
  nombre_idioma_original?: string;
}

/**
 * Interfaz que representa la respuesta del Backend críticas para un libro, incluyendo la lista de críticas y la distribución de frecuencias por nota.
 * - criticas: array de objetos que representan las críticas del libro, cada una con su título, texto, calificación y fecha.
 * - frecuencias: array de números que representan la cantidad de críticas para cada nota (1 a 5 estrellas), donde el índice 0 corresponde a 0 estrellas, el índice 1 a 1 estrella, y así sucesivamente hasta el índice 5 que corresponde a 5 estrellas.
 */
export interface RespuestaCriticas {
  criticas: LibroCritica[];
  frecuencias: [number, number, number, number, number];
}

/**
 * Interfaz que representa el detalle completo de un libro, incluyendo su información básica, críticas y distribución de notas.
 * - libro: objeto con la información básica del libro (título, autor, género, etc).
 * - criticas: array de críticas asociadas al libro, cada una con su título, texto, calificación y fecha.
 * - notasDistribucion: array que representa la distribución de notas (1 a 5 estrellas) con la cantidad y frecuencia de cada nota.
 * - errorCriticas: booleano que indica si hubo un error al obtener las críticas (true si hubo error, false si se obtuvieron correctamente).
 */
export interface DetalleLibroCompleto {
  libro: LibroApp;
  criticas: LibroCritica[];
  notasDistribucion: { nota: number; cantidad: number; frecuencia: number }[];
  errorCriticas: boolean;
}

/**
 * Interfaz para mostrar un libro en modo tarjeta/resumen (catálogo o dentro de una lista).
 * Incluye solo los campos necesarios para la tarjeta.
 */
export interface LibroResumen {
  id_libro: number;
  titulo_libro: string;
  autores: Array<{ nombre_autor: string; apellido_autor: string }>;
  calificacionPromedio?: number;
}

/**
 * Interfaz que representa una lista en la capa de aplicación, extendiendo la información básica de la lista con detalles adicionales si se requiere.
 * - id_lista: número identificador único de la lista.
 * - id_usuarioCrd: id del usuario creador.
 * - nombre_lista: nombre de la lista.
 * - descripcion_lista: descripción de la lista (opcional).
 * - nombreCreador: nombre del usuario creador de la lista.
 */
export interface ListaApp extends ListaBD {
  lista: ListaBD;
  nombreCreador: string;
}

/**
 * Interfaz que representa el detalle completo de una lista, incluyendo su información general y los comentarios asociados.
 * - lista: objeto con la información básica de la lista (nombre, descripción, etc).
 * - libros: array de objetos que representan los libros incluidos en la lista, cada uno con su título, autor y calificación promedio.
 * - comentarios: array de comentarios asociados a la lista, cada uno con su texto, autor y fecha.
 * - errorComentarios: booleano que indica si hubo un error al obtener los comentarios (true si hubo error, false si se obtuvieron correctamente).
 */
export interface DetalleListaCompleta {
  lista: ListaApp;
  libros: LibroResumen[];
  comentarios: ListaComentarios[];
  errorComentarios: boolean;
}
