import { ListaApp } from "../interfaces/modelosApp/modelosApp.js";
import { ConexionBD } from "./conexionBD.service.js";

export class ConexionUsuarios extends ConexionBD {
	async obtenerLibrosLeidosPendientes(idUsuario: number, estadoLectura: number = 0) {
		const sql = `
    SELECT
      l.id_libro,
      l.titulo_libro,
      GROUP_CONCAT(DISTINCT CONCAT(a.nombre_autor, ':', a.apellido_autor) SEPARATOR '|') AS autores,
      AVG(c.calificacion_comentario) AS calificacionPromedio
    FROM libro_usuario lu
    JOIN libro l ON l.id_libro = lu.id_libro
    LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
    LEFT JOIN autor a ON la.id_autor = a.id_autor
    LEFT JOIN libro_critica c ON l.id_libro = c.id_libro
    WHERE lu.id_usuario = ? AND lu.estado_lectura = ?
    GROUP BY l.id_libro
  `;
		const [rows] = await this.pool.query(sql, [idUsuario, estadoLectura]);

		return (rows as Array<Record<string, any>>).map(row => ({
			id_libro: row.id_libro,
			titulo_libro: row.titulo_libro,
			autores: row.autores
				? row.autores.split("|").map((a: string) => {
						const [nombre_autor, apellido_autor] = a.split(":");
						return { nombre_autor, apellido_autor };
					})
				: [],
			calificacionPromedio: row.calificacionPromedio ? Number(row.calificacionPromedio) : undefined,
		}));
	}

	async obtenerListasPorIds(listaIds: number[]): Promise<ListaApp[]> {
		if (listaIds.length === 0) return [];

		// 1. Obtener listas + creador
		const sql = `
    SELECT l.*, u.nombre_usuario AS nombreCreador
    FROM lista l
    JOIN usuario u ON l.id_usuarioCrd = u.id_usuario
    WHERE l.id_lista IN (${listaIds.map(() => "?").join(",")})
    ORDER BY l.id_lista ASC
  `;
		const [rows] = await this.pool.query(sql, listaIds);

		// 2. Categorías
		const sqlCat = `
    SELECT lc.id_lista, c.nombre_categoria
    FROM lista_categoria lc
    JOIN categoria c ON lc.id_categoria = c.id_categoria
    WHERE lc.id_lista IN (${listaIds.map(() => "?").join(",")})
  `;
		const [catRows] = await this.pool.query(sqlCat, listaIds);

		const categoriasPorLista: Record<number, string[]> = {};
		(catRows as Array<Record<string, any>>).forEach((row: any) => {
			if (!categoriasPorLista[row.id_lista]) categoriasPorLista[row.id_lista] = [];
			categoriasPorLista[row.id_lista].push(row.nombre_categoria);
		});

		// 3. Libros portada + total libros
		const sqlLibros = `
    SELECT id_lista, id_libro
    FROM lista_contenido
    WHERE id_lista IN (${listaIds.map(() => "?").join(",")})
    ORDER BY id_lista ASC, id_libro ASC
  `;
		const [libRows] = await this.pool.query(sqlLibros, listaIds);

		const librosPortadaPorLista: Record<number, number[]> = {};
		const totalLibrosPorLista: Record<number, number> = {};

		(libRows as Array<Record<string, any>>).forEach((row: any) => {
			if (!totalLibrosPorLista[row.id_lista]) totalLibrosPorLista[row.id_lista] = 0;
			totalLibrosPorLista[row.id_lista]++;

			if (!librosPortadaPorLista[row.id_lista]) librosPortadaPorLista[row.id_lista] = [];
			if (librosPortadaPorLista[row.id_lista].length < 3) {
				librosPortadaPorLista[row.id_lista].push(row.id_libro);
			}
		});

		// 4. Seguidores
		const sqlSeguidores = `
		SELECT id_lista, COUNT(*) AS totalSeguidores
    FROM lista_usuario
		WHERE id_lista IN (${listaIds.map(() => "?").join(",")})
    GROUP BY id_lista
  `;
		const [seguidoresRows] = await this.pool.query(sqlSeguidores, listaIds);
		const totalSeguidoresPorLista: Record<number, number> = {};
		(seguidoresRows as Array<Record<string, any>>).forEach((row: any) => {
			totalSeguidoresPorLista[row.id_lista] = row.totalSeguidores;
		});

		// 5. Me gusta
		const sqlMeGusta = `
    SELECT id_lista, COUNT(*) AS totalMeGusta
    FROM lista_usuario
	    WHERE id_lista IN (${listaIds.map(() => "?").join(",")}) AND me_gusta_lista = 1
    GROUP BY id_lista
  `;
		const [meGustaRows] = await this.pool.query(sqlMeGusta, listaIds);

		const totalMeGustaPorLista: Record<number, number> = {};
		(meGustaRows as Array<Record<string, any>>).forEach((row: any) => {
			totalMeGustaPorLista[row.id_lista] = row.totalMeGusta;
		});

		// 5. Map final (idéntico al catálogo)
		return (rows as Array<Record<string, any>>).map((row: any) => ({
			id_lista: row.id_lista,
			id_usuarioCreador: row.id_usuarioCrd,
			nombre_lista: row.nombre_lista,
			nombreCreador: row.nombreCreador,
			categorias: categoriasPorLista[row.id_lista] || [],
			librosPortada: librosPortadaPorLista[row.id_lista] || [],
			totalLibros: totalLibrosPorLista[row.id_lista] || 0,
			totalSeguidores: totalSeguidoresPorLista[row.id_lista] || 0,
			totalMeGusta: totalMeGustaPorLista[row.id_lista] || 0,
			descripcion_lista: row.descripcion_lista || undefined,
		}));
	}

	async obtenerEventosCreados(idUsuario: number) {
		const sql = `
    SELECT *
    FROM evento
    WHERE id_usuarioCrd = ?
  `;
		const [rows] = await this.pool.query(sql, [idUsuario]);
		return rows;
	}

	async obtenerEventosAsistidos(idUsuario: number) {
		const sql = `
    SELECT e.*
    FROM evento_usuario eu
    JOIN evento e ON e.id_evento = eu.id_evento
    WHERE eu.id_usuario = ? AND eu.asiste = 1
  `;
		const [rows] = await this.pool.query(sql, [idUsuario]);
		return rows;
	}

	async obtenerCriticasUsuario(idUsuario: number) {
		const sql = `
    SELECT lc.*, l.titulo_libro
    FROM libro_critica lc
    INNER JOIN libro l ON lc.id_libro = l.id_libro
    WHERE lc.id_usuario = ?
    ORDER BY lc.fecha_comentario DESC
  `;
		const [rows] = await this.pool.query(sql, [idUsuario]);
		return rows;
	}
}
