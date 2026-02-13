import { LibroBD, AutorNombre, GeneroNombre, LibroCritica } from "../modelosBD/modelosBD.js";

export interface LibroApp extends LibroBD {
	autores?: AutorNombre[]; // Lista de autores del libro
	generos?: GeneroNombre[]; // Lista de géneros del libro
	totalResenas?: number; // Total de reseñas del libro
	calificacionPromedio?: number; // Calificación promedio del libro
}

export interface RespuestaCriticas {
	criticas: LibroCritica[];
	frecuencias: number[];
}
