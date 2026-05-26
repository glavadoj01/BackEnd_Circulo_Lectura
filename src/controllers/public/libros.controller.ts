import { Request, Response } from "express";
import { parsePositiveInt } from "../../utils/validation.utils.js";
import { respuestaOk, respuestaError } from "../../utils/validationMessages.utils.js";
import { ConexionLibros } from "../../services/conexionLibros.service.js";

/**
 * Obtener libros con/sin filtros de búsqueda y paginación.
 * @param req Objeto de solicitud de Express, con posibles filtros en req.query (titulo, autor, genero, page, limit).
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON con un array de libros que coinciden con los filtros, o un error si ocurrió algún problema.
 */
export async function obtenerLibros(req: Request, res: Response) {
	let conexionAbierta: ConexionLibros | null = null;
	try {
		const q = req.query;

		const page = q.page ? Number(q.page) : 1;
		const limit = q.limit ? Math.min(Number(q.limit), 50) : 20;
		if (Number.isNaN(page) || page < 1 || Number.isNaN(limit) || limit < 1) {
			return respuestaError(res, 400, "PARAMETROS_PAGINACION_INVALIDOS");
		}

		// Filtros permitidos
		const filtros: {
			titulo?: string;
			generos?: number[];
			autores?: number[];
			years?: number[];
			valoraciones?: number[];
		} = {};

		if (typeof q.titulo === "string") filtros.titulo = q.titulo;
		if (typeof q.generos === "string") filtros.generos = q.generos.split(",").map(Number).filter(Number.isFinite);
		if (typeof q.autores === "string") filtros.autores = q.autores.split(",").map(Number).filter(Number.isFinite);
		if (typeof q.years === "string") filtros.years = q.years.split(",").map(Number).filter(Number.isFinite);
		if (typeof q.valoraciones === "string")
			filtros.valoraciones = q.valoraciones.split(",").map(Number).filter(Number.isFinite);

		conexionAbierta = new ConexionLibros();
		const libros = await conexionAbierta.obtenerCatalogoLibros(filtros, page, limit);

		return respuestaOk(res, 200, "LIBROS_OBTENIDOS_OK", libros);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_LIBROS", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

/**
 * Obtener un libro por ID.
 * @param req Objeto de solicitud de Express, con el ID del libro a obtener en req.query.id o req.params.id.
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON con los datos del libro encontrado, incluyendo autores y géneros como arrays, o un error si ocurrió algún problema o si el libro no fue encontrado.
 */
export async function obtenerLibroId(req: Request, res: Response) {
	let conexionAbierta: ConexionLibros | null = null;
	try {
		const idRaw = req.query.id ?? req.params.id;
		const id = parsePositiveInt(idRaw);
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
		}

		conexionAbierta = new ConexionLibros();
		const libro = await conexionAbierta.obtenerDetalleLibro(id);

		if (!libro) {
			return respuestaError(res, 404, "ERROR_OBTENER_LIBRO");
		}

		// Devuelve autores y géneros como arrays, igual que en la paginación
		return respuestaOk(res, 200, "LIBRO_OBTENIDO_OK", libro);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_LIBRO", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

/**
 * Obtener el total de libros.
 * @param _req Objeto de solicitud de Express (no se usa).
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON con el total de libros en la base de datos.
 */
export async function obtenerLibrosTotal(req: Request, res: Response) {
	let conexionAbierta: ConexionLibros | null = null;
	try {
		conexionAbierta = new ConexionLibros();

		const filtros = {
			titulo: typeof req.query.titulo === "string" ? req.query.titulo : undefined,
			generos: typeof req.query.generos === "string" ? req.query.generos.split(",").map(Number) : undefined,
			autores: typeof req.query.autores === "string" ? req.query.autores.split(",").map(Number) : undefined,
			years: typeof req.query.years === "string" ? req.query.years.split(",").map(Number) : undefined,
			valoraciones:
				typeof req.query.valoraciones === "string" ? req.query.valoraciones.split(",").map(Number) : undefined,
		};

		const total = await conexionAbierta.obtenerTotalLibrosFiltrado(filtros);

		return respuestaOk(res, 200, "TOTAL_LIBROS_OBTENIDO_OK", { total: total });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_TOTAL_LIBROS", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

export async function obtenerIdiomas(_req: Request, res: Response) {
	let conexionAbierta: ConexionLibros | null = null;
	console.log("[obtenerIdiomas] Req recibida: ", _req.headers, _req.query, _req.params);
	try {
		conexionAbierta = new ConexionLibros();
		const result = await conexionAbierta.listarRegistros(
			"idiomas",
			{},
			"nombre_idioma ASC",
			0,
			"id_idioma, nombre_idioma",
		);
		console.log("[obtenerIdiomas] Resultado consulta idiomas: ", result);
		if (!result.exito) return respuestaError(res, 500, "ERROR_OBTENER_IDIOMAS", result.mensaje);
		return respuestaOk(res, 200, "IDIOMAS_OBTENIDOS_OK", result.datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_IDIOMAS", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}
