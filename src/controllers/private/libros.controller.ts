import { Response } from "express";
import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { ConexionBD } from "../../services/conexionBD.service.js";
import { LibroBD } from "../../interfaces/modelosBD/modelosBD.js";
import { parsePositiveInt } from "../../utils/validation.utils.js";
import { respuestaOk, respuestaError } from "../../utils/validationMessages.utils.js";
import { asegurarRol } from "../../utils/authorization.utils.js";
import { getSesionID } from "../../utils/authorization.utils.js";

/**
 * Valida los datos de un autor.
 * @param autor Objeto autor a validar.
 * @returns {boolean} true si es válido, false si no.
 */
const validarAutor = (autor: any): boolean => {
	return (
		autor &&
		typeof autor.nombre_autor === "string" &&
		autor.nombre_autor.trim().length > 1 &&
		typeof autor.apellido_autor === "string" &&
		autor.apellido_autor.trim().length > 1
	);
};

/**
 * Valida los datos de un género.
 * @param genero Objeto género a validar.
 * @returns {boolean} true si es válido, false si no.
 */
const validarGenero = (genero: any): boolean => {
	return genero && typeof genero.nombre_genero === "string" && genero.nombre_genero.trim().length > 1;
};

/**
 * Procesa autores: busca por nombre y apellido, crea si no existe, y devuelve los ids.
 * @param conexion Instancia de ConexionBD.
 * @param autores Array de autores.
 * @returns Promise<number[]> Array de ids de autores.
 */
const procesarAutores = async (conexion: ConexionBD, autores: any[]): Promise<number[]> => {
	const ids: number[] = [];
	for (const autor of autores) {
		if (!validarAutor(autor)) throw new Error("AUTOR_DATOS_INVALIDOS");
		const { nombre_autor, apellido_autor, pais_autor } = autor;
		let encontrado = (await conexion.listarRegistros("autor", { nombre_autor, apellido_autor }, "", 1, "id_autor"))
			.datos[0];
		if (encontrado === undefined) {
			const idAutor = (
				await conexion.insertarRegistro("autor", {
					nombre_autor,
					apellido_autor,
					pais_autor: pais_autor || "",
					esUsuario: false,
				})
			).datos.insertId;
			ids.push(idAutor);
		} else {
			ids.push(encontrado.id_autor);
		}
	}
	return ids;
};

/**
 * Procesa géneros: busca por nombre, crea si no existe, y devuelve los ids.
 * @param conexion Instancia de ConexionBD.
 * @param generos Array de géneros.
 * @returns Promise<number[]> Array de ids de géneros.
 */
const procesarGeneros = async (conexion: ConexionBD, generos: any[]): Promise<number[]> => {
	const ids: number[] = [];
	for (const genero of generos) {
		if (!validarGenero(genero)) throw new Error("GENERO_DATOS_INVALIDOS");
		const { nombre_genero } = genero;
		let encontrado = (await conexion.listarRegistros("genero", { nombre_genero }, "", 1, "id_genero")).datos[0];
		if (encontrado === undefined) {
			const idGenero = (
				await conexion.insertarRegistro("genero", {
					nombre_genero,
				})
			).datos.insertId;
			ids.push(idGenero);
		} else {
			ids.push(encontrado.id_genero);
		}
	}
	return ids;
};

/**
 * Sincronizar los autores de un libro con los IDs proporcionados.
 * @param conexion Conexión abierta a la base de datos.
 * @param idLibro ID del libro al que se le van a sincronizar los autores.
 * @param autoresIds Array de IDs de autores a sincronizar.
 */
const sincronizarAutores = async (conexion: ConexionBD, idLibro: number, autoresIds: number[]) => {
	const autoresDeseados = [...new Set(autoresIds)];
	const actuales = (await conexion.listarRegistros("libro_autor", { id_libro: idLibro })).datos;
	const actualesPorId = new Map<number, any>(actuales.map((rel: any) => [rel.id_autor, rel]));

	for (const [indice, idAutor] of autoresDeseados.entries()) {
		const autorPrDeseado = indice === 0;
		const relacionActual = actualesPorId.get(idAutor);

		if (!relacionActual) {
			await conexion.insertarRegistro("libro_autor", {
				id_libro: idLibro,
				id_autor: idAutor,
				autorPr: autorPrDeseado,
			});
			continue;
		}

		if (Boolean(relacionActual.autorPr) !== autorPrDeseado) {
			await conexion.actualizarRegistro(
				"libro_autor",
				{
					autorPr: autorPrDeseado,
				},
				{
					id_libro: idLibro,
					id_autor: idAutor,
				},
			);
		}
	}

	for (const relacionActual of actuales) {
		if (!autoresDeseados.includes(relacionActual.id_autor)) {
			await conexion.borrarRegistro("libro_autor", {
				id_libro: idLibro,
				id_autor: relacionActual.id_autor,
			});
		}
	}
};

/**
 * Sincronizar los géneros de un libro con los IDs proporcionados.
 * @param conexion Conexión abierta a la base de datos.
 * @param idLibro ID del libro al que se le van a sincronizar los géneros.
 * @param generosIds Array de IDs de géneros a sincronizar.
 */
const sincronizarGeneros = async (conexion: ConexionBD, idLibro: number, generosIds: number[]) => {
	const actuales = (await conexion.listarRegistros("libro_genero", { id_libro: idLibro })).datos;
	const actualesIds = actuales.map((rel: any) => rel.id_genero);

	for (const idGenero of generosIds) {
		if (!actualesIds.includes(idGenero)) {
			await conexion.insertarRegistro("libro_genero", {
				id_libro: idLibro,
				id_genero: idGenero,
			});
		}
	}

	for (const idActual of actualesIds) {
		if (!generosIds.includes(idActual)) {
			await conexion.borrarRegistro("libro_genero", {
				id_libro: idLibro,
				id_genero: idActual,
			});
		}
	}
};

/**
 * Crear un nuevo libro.
 * @param req Objeto de solicitud de Express, con los datos del libro a crear en req.body.libro, y arrays de autores en req.body.autores y géneros en req.body.generos.
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON con el ID del libro creado y los datos ingresados, o un error si ocurrió algún problema.
 */
export async function crearLibro(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionBD | null = null;
	try {
		if (!asegurarRol(req, res, 2)) return null;
		const datos: Partial<LibroBD> = req.body.libro ? req.body.libro : req.body;
		if (
			!datos.titulo_libro ||
			typeof datos.titulo_libro !== "string" ||
			datos.titulo_libro.trim().length < 2 ||
			!datos.id_idioma_original
		) {
			return respuestaError(res, 400, "CAMPOS_OBLIGATORIOS");
		}

		const autores = Array.isArray(req.body.autores) ? req.body.autores : [];
		const generos = Array.isArray(req.body.generos) ? req.body.generos : [];

		conexionAbierta = new ConexionBD();

		const autoresIds = await procesarAutores(conexionAbierta, autores);
		const generosIds = await procesarGeneros(conexionAbierta, generos);

		const insertId = (await conexionAbierta.insertarRegistro("libro", datos)).datos.insertId;

		for (const [indice, idAutor] of autoresIds.entries()) {
			await conexionAbierta.insertarRegistro("libro_autor", {
				id_libro: insertId,
				id_autor: idAutor,
				autorPr: indice === 0,
			});
		}
		for (const idGenero of generosIds) {
			await conexionAbierta.insertarRegistro("libro_genero", {
				id_libro: insertId,
				id_genero: idGenero,
			});
		}

		return respuestaOk(res, 201, "LIBRO_CREADO_OK", {
			id_libro: insertId,
			...datos,
			autores: autoresIds,
			generos: generosIds,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_CREAR_LIBRO", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

/**
 * Actualizar un libro existente.
 * @param req Objeto de solicitud de Express, con el ID del libro a actualizar en req.params.id o req.body.id_libro, y los datos a actualizar en req.body.libro, además de posibles arrays de autores en req.body.autores y géneros en req.body.generos.
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON indicando si el libro fue actualizado y cuántos registros fueron afectados, o un error si ocurrió algún problema o si el libro no fue encontrado.
 */
export async function actualizarLibro(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionBD | null = null;
	try {
		if (!asegurarRol(req, res, 2)) return null;
		const idRaw = req.params.id ?? req.body.id_libro;
		const id = parsePositiveInt(idRaw);
		const datos: Partial<LibroBD> =
			typeof req.body.libro === "object" && req.body.libro !== null ? req.body.libro : req.body;
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
		}

		const tieneAutores = Object.prototype.hasOwnProperty.call(req.body, "autores");
		const tieneGeneros = Object.prototype.hasOwnProperty.call(req.body, "generos");

		conexionAbierta = new ConexionBD();
		const afectados = (await conexionAbierta.actualizarRegistro("libro", datos, { id_libro: id })).datos.affectedRows;
		if (afectados === 0) {
			return respuestaError(res, 404, "ERROR_OBTENER_LIBRO");
		}

		if (tieneAutores) {
			const autores = Array.isArray(req.body.autores) ? req.body.autores : [];
			const autoresIds = await procesarAutores(conexionAbierta, autores);
			await sincronizarAutores(conexionAbierta, id, autoresIds);
		}

		if (tieneGeneros) {
			const generos = Array.isArray(req.body.generos) ? req.body.generos : [];
			const generosIds = await procesarGeneros(conexionAbierta, generos);
			await sincronizarGeneros(conexionAbierta, id, generosIds);
		}

		return respuestaOk(res, 200, "LIBRO_ACTUALIZADO_OK", { actualizado: true, afectados });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_ACTUALIZAR_LIBRO", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

// ================= MÉTODOS: ME GUSTA EN LIBRO =================
export async function marcarMeGustaLibro(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const idLibro = Number(req.params.id ?? req.body.id_libro);
		const idUsuario = Number(req.params.usuarioId ?? req.body.id_usuario);

		if (Number.isNaN(idLibro)) return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
		if (Number.isNaN(idUsuario)) return respuestaError(res, 400, "ID_USUARIO_INVALIDO");

		if (getSesionID(req) !== idUsuario) return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");

		conexion = new ConexionBD();

		const libroRows = await conexion.listarRegistros("libro", { id_libro: idLibro }, "", 1, "id_libro");
		if (!libroRows.exito || !libroRows.datos || libroRows.datos.length === 0) return respuestaError(res, 404, "NO_ENCONTRADO_LIBRO");

		const relacion = await conexion.listarRegistros(
			"libro_usuario",
			{ id_libro: idLibro, id_usuario: idUsuario },
			"",
			1,
			"id_libro, id_usuario, me_gusta_libro",
		);

		if (!relacion.exito) return respuestaError(res, 500, "ERROR_ME_GUSTA_LIBRO", relacion.mensaje);

		if (!relacion.datos || relacion.datos.length === 0) {
			const insert = await conexion.insertarRegistro("libro_usuario", { id_libro: idLibro, id_usuario: idUsuario, me_gusta_libro: 1 });
			if (!insert.exito) return respuestaError(res, 500, "ERROR_ME_GUSTA_LIBRO", insert.mensaje);
		} else {
			const update = await conexion.actualizarRegistro(
				"libro_usuario",
				{ me_gusta_libro: 1 },
				{ id_libro: idLibro, id_usuario: idUsuario },
			);
			if (!update.exito) return respuestaError(res, 500, "ERROR_ME_GUSTA_LIBRO", update.mensaje);
		}

		return respuestaOk(res, 200, "LIBRO_ME_GUSTA_OK", { id_libro: idLibro, id_usuario: idUsuario, me_gusta: true });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_ME_GUSTA_LIBRO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function quitarMeGustaLibro(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const idLibro = Number(req.params.id ?? req.body.id_libro);
		const idUsuario = Number(req.params.usuarioId ?? req.body.id_usuario);

		if (Number.isNaN(idLibro)) return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
		if (Number.isNaN(idUsuario)) return respuestaError(res, 400, "ID_USUARIO_INVALIDO");

		if (getSesionID(req) !== idUsuario) return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");

		conexion = new ConexionBD();

		const relacion = await conexion.listarRegistros(
			"libro_usuario",
			{ id_libro: idLibro, id_usuario: idUsuario },
			"",
			1,
			"id_libro, id_usuario, me_gusta_libro",
		);

		if (!relacion.exito) return respuestaError(res, 500, "ERROR_QUITAR_ME_GUSTA_LIBRO", relacion.mensaje);

		if (relacion.datos && relacion.datos.length > 0) {
			const update = await conexion.actualizarRegistro(
				"libro_usuario",
				{ me_gusta_libro: 0 },
				{ id_libro: idLibro, id_usuario: idUsuario },
			);
			if (!update.exito) return respuestaError(res, 500, "ERROR_QUITAR_ME_GUSTA_LIBRO", update.mensaje);
		}

		return respuestaOk(res, 200, "LIBRO_ME_GUSTA_QUITADO_OK", { id_libro: idLibro, id_usuario: idUsuario, me_gusta: false });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_QUITAR_ME_GUSTA_LIBRO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function obtenerEstadoLibroUsuario(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const idLibro = Number(req.params.id ?? req.body.id_libro);
		const idUsuario = Number(req.params.usuarioId ?? req.body.id_usuario);

		if (Number.isNaN(idLibro)) return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
		if (Number.isNaN(idUsuario)) return respuestaError(res, 400, "ID_USUARIO_INVALIDO");

		if (getSesionID(req) !== idUsuario) return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");

		conexion = new ConexionBD();

		const libroRows = await conexion.listarRegistros("libro", { id_libro: idLibro }, "", 1, "id_libro");
		if (!libroRows.exito || !libroRows.datos || libroRows.datos.length === 0) return respuestaError(res, 404, "NO_ENCONTRADO_LIBRO");

		const relacion = await conexion.listarRegistros(
			"libro_usuario",
			{ id_libro: idLibro, id_usuario: idUsuario },
			"",
			1,
			"me_gusta_libro",
		);

		if (!relacion.exito) return respuestaError(res, 500, "ERROR_OBTENER_ESTADO_LIBRO", relacion.mensaje);

		const meGusta = Boolean(relacion.datos && relacion.datos.length > 0 && relacion.datos[0].me_gusta_libro);
		return respuestaOk(res, 200, "LIBRO_ESTADO_USUARIO_OK", { data: { meGusta } });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_ESTADO_LIBRO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

/**
 * Borrar un libro existente.
 * @param req Objeto de solicitud de Express, con el ID del libro a borrar en req.params.id o req.body.id_libro.
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON indicando si el libro fue borrado y cuántos registros fueron afectados, o un error si ocurrió algún problema.
 */
export async function borrarLibro(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionBD | null = null;
	try {
		if (!asegurarRol(req, res, 2)) return null;

		const idRaw = req.params.id ?? req.body.id_libro;
		const id = parsePositiveInt(idRaw);
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
		}

		conexionAbierta = new ConexionBD();
		const afectados = (await conexionAbierta.borrarRegistro("libro", { id_libro: id })).datos.affectedRows;
		if (afectados === 0) {
			return respuestaError(res, 404, "ERROR_OBTENER_LIBRO");
		}
		return respuestaOk(res, 200, "LIBRO_BORRADO_OK", { borrado: true, afectados });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_BORRAR_LIBRO", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}
