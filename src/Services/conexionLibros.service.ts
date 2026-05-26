import { LibroResumen, DetalleLibroCompleto, LibroApp } from "../interfaces/modelosApp/modelosApp.js";
import { LibroCritica } from "../interfaces/modelosBD/modelosBD.js";
import { ConexionBD } from "./conexionBD.service.js";

export class ConexionLibros extends ConexionBD {
	constructor() {
		super();
	}

	/**
	 * Obtiene un catálogo paginado de libros con todos los datos requeridos por la interfaz LibroApp.
	 * Devuelve los libros en orden de id_libro ASC, sin saltos ni desorden, según la base de datos.
	 * Permite filtrar por título, autor y género.
	 * @param filtros Filtros de búsqueda: { titulo, autor, genero }
	 * @param page Página (1-based)
	 * @param limit Cantidad por página
	 * @returns Array de libros con autores, géneros, idioma, totalResenas y calificacionPromedio
	 */
	async obtenerCatalogoLibros(
		filtros: {
			titulo?: string;
			generos?: number[];
			autores?: number[];
			years?: number[];
			valoraciones?: number[];
		},
		page: number,
		limit: number,
	): Promise<LibroResumen[]> {
		const offset = (page - 1) * limit;

		const { clausulas, valores } = this.construirFiltrosLibros(filtros);

		const whereFinal = clausulas.length > 0 ? "WHERE " + clausulas.map(c => `(${c})`).join(" AND ") : "";

		const sql = `
    SELECT
      t.id_libro,
      t.titulo_libro,
      t.autores,
      t.calificacionPromedio
    FROM (
      SELECT
        l.id_libro,
        l.titulo_libro,
        GROUP_CONCAT(
          DISTINCT CONCAT(a.nombre_autor, ':', a.apellido_autor)
          ORDER BY la.autorPr DESC, a.nombre_autor ASC, a.apellido_autor ASC
          SEPARATOR '|'
        ) AS autores,
        AVG(c.calificacion_comentario) AS calificacionPromedio,
        FLOOR(AVG(c.calificacion_comentario)) AS calificacionBucket
      FROM libro l
      LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
      LEFT JOIN autor a ON la.id_autor = a.id_autor
      LEFT JOIN libro_critica c ON l.id_libro = c.id_libro
      ${whereFinal}
      GROUP BY l.id_libro
    ) AS t
    LIMIT ? OFFSET ?
  `;

		const params = [...valores, limit, offset];

		const [rows] = await this.pool.query(sql, params);

		return (rows as Array<Record<string, any>>).map(
			(row): LibroResumen => ({
				id_libro: row.id_libro,
				titulo_libro: row.titulo_libro,
				autores:
					typeof row.autores === "string" && row.autores.length > 0
						? row.autores.split("|").map((a: string) => {
								const [nombre_autor, apellido_autor] = a.split(":");
								return {
									nombre_autor,
									apellido_autor,
								};
							})
						: [],
				calificacionPromedio:
					row.calificacionPromedio !== null && row.calificacionPromedio !== undefined
						? Number(row.calificacionPromedio)
						: undefined,
			}),
		);
	}

	/**
	 * Obtiene el detalle completo de un libro por su ID, incluyendo su información básica, críticas y distribución de notas.
	 * Devuelve null si el libro no existe.
	 * @param idLibro ID del libro a obtener
	 * @returns DetalleLibroCompleto con la información del libro, sus críticas y distribución de notas, o null si no se encuentra el libro
	 */
	async obtenerDetalleLibro(idLibro: number): Promise<DetalleLibroCompleto | null> {
		const sql = `
    SELECT
      l.id_libro,
      l.titulo_libro,
      l.codigo_isbn,
      l.id_idioma_original,
      l.paginas,
      l.year_publicacion,
      l.sinopsis,
      i.nombre_idioma,
      GROUP_CONCAT(
				DISTINCT CONCAT(COALESCE(a.id_usuario, ''), ':', a.id_autor, ':', a.nombre_autor, ':', a.apellido_autor)
        ORDER BY la.autorPr DESC, a.nombre_autor ASC, a.apellido_autor ASC
        SEPARATOR '|'
      ) AS autores,
      GROUP_CONCAT(DISTINCT g.nombre_genero SEPARATOR '|') AS generos,
      COUNT(DISTINCT c.id_usuario) AS totalResenas,
      ROUND(AVG(c.calificacion_comentario),2) AS calificacionPromedio
    FROM libro l
    LEFT JOIN idiomas i ON l.id_idioma_original = i.id_idioma
    LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
    LEFT JOIN autor a ON la.id_autor = a.id_autor
    LEFT JOIN libro_genero lg ON l.id_libro = lg.id_libro
    LEFT JOIN genero g ON lg.id_genero = g.id_genero
    LEFT JOIN libro_critica c ON l.id_libro = c.id_libro
    WHERE l.id_libro = ?
    GROUP BY l.id_libro
  `;
		const [rows] = await this.pool.query(sql, [idLibro]);
		if (!rows || (rows as any[]).length === 0) return null;
		const row = (rows as Array<Record<string, any>>)[0];

		// Críticas y distribución de notas
		const [criticasRows] = await this.pool.query(
			`SELECT id_libro, id_usuario, titulo_comentario, texto_comentario, calificacion_comentario, fecha_comentario
        FROM libro_critica WHERE id_libro = ? ORDER BY fecha_comentario DESC`,
			[idLibro],
		);
		const criticas: LibroCritica[] = (criticasRows as Array<Record<string, any>>).map(c => ({
			id_libro: c.id_libro,
			id_usuario: c.id_usuario,
			titulo_comentario: c.titulo_comentario,
			texto_comentario: c.texto_comentario,
			calificacion_comentario: Number(c.calificacion_comentario),
			fecha_comentario: c.fecha_comentario,
		}));

		// Distribución de notas
		const frecuencias: number[] = [0, 0, 0, 0, 0];
		criticas.forEach(c => {
			const nota = Number(c.calificacion_comentario);
			if (nota > 0 && nota <= 5) frecuencias[nota - 1]++;
		});
		const total = criticas.length;
		const notasDistribucion = Array.from({ length: 5 }, (_, indice) => ({
			nota: indice + 1,
			cantidad: frecuencias[indice],
			frecuencia: total > 0 ? +(frecuencias[indice] / total).toFixed(2) : 0,
		}));

		// Mapeo a LibroApp
		const libro: LibroApp = {
			id_libro: row.id_libro,
			titulo_libro: row.titulo_libro,
			codigo_isbn: row.codigo_isbn,
			id_idioma_original: row.id_idioma_original,
			paginas: row.paginas,
			year_publicacion: row.year_publicacion,
			sinopsis: row.sinopsis,
			nombre_idioma_original: row.nombre_idioma,
			autores:
				typeof row.autores === "string" && row.autores.length > 0
					? row.autores.split("|").map((a: string) => {
									const [id_usuario, id_autor, nombre_autor, apellido_autor] = a.split(":");
							return {
								id_autor: Number(id_autor),
								nombre_autor,
								apellido_autor,
										...(id_usuario ? { id_usuario: Number(id_usuario) } : {}),
							};
						})
					: [],
			generos:
				typeof row.generos === "string" && row.generos.length > 0
					? row.generos.split("|").map((nombre_genero: string) => ({
							nombre_genero,
						}))
					: [],
			totalResenas: Number(row.totalResenas) || 0,
			calificacionPromedio:
				row.calificacionPromedio !== null && row.calificacionPromedio !== undefined
					? Number(row.calificacionPromedio)
					: undefined,
		};

		return {
			libro,
			criticas,
			notasDistribucion,
			errorCriticas: false,
		};
	}

	async obtenerTotalLibrosFiltrado(filtros: {
		titulo?: string;
		generos?: number[];
		autores?: number[];
		years?: number[];
		valoraciones?: number[];
	}): Promise<number> {
		const { clausulas, valores } = this.construirFiltrosLibros(filtros);

		const whereFinal = clausulas.length > 0 ? "WHERE " + clausulas.map(c => `(${c})`).join(" AND ") : "";

		const sql = `
    SELECT COUNT(DISTINCT l.id_libro) AS total
    FROM libro l
    LEFT JOIN libro_critica c ON l.id_libro = c.id_libro
    ${whereFinal}
  `;

		const [rows] = await this.pool.query(sql, valores);
		return (rows as any[])?.[0]?.total ?? 0;
	}
}
