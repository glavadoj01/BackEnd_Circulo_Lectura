import {
  AutorApellido,
  AutorNombre,
  GeneroNombre,
  LibroBD,
  LibroCritica,
} from './../modelosBD/modelosBD.js';

/**
 * Interfaz que representa un libro en la capa de aplicación, extendiendo la información básica del libro con detalles adicionales como autores, géneros, calificación promedio y total de reseñas.
 * - id_libro: número identificador único del libro.
 * - titulo_libro: título del libro.
 * - codigo_isbn: código ISBN del libro (opcional).
 * - idioma_original: número o cadena que representa el idioma original del libro.
 * - paginas: número de páginas del libro (opcional).
 * - year_publicacion: año de publicación del libro (opcional).
 * - sinopsis: breve descripción del libro (opcional).
 * - autores: array de objetos que representan los autores del libro, cada uno con su nombre, apellido e ID.
 * - generos: array de objetos que representan los géneros del libro, cada uno con su nombre.
 * - totalResenas: número total de reseñas que tiene el libro (opcional).
 * - calificacionPromedio: calificación promedio del libro basada en las reseñas (opcional).
 * - id_idioma_original: número identificador del idioma original del libro (opcional).
 * - nombre_idioma_original: nombre del idioma original del libro (opcional).
 */
export interface LibroApp extends LibroBD {
  autores?: Array<{ nombre_autor: AutorNombre; apellido_autor: AutorApellido; id_autor: number }>; // Lista de autores del libro
  generos?: Array<{ nombre_genero: GeneroNombre }>; // Lista de géneros del libro
  totalResenas?: number; // Total de reseñas del libro
  calificacionPromedio?: number; // Calificación promedio del libro
  id_idioma_original?: number;
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
