import { Response } from "express";
import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { ConexionBD } from "../../services/conexionBD.service.js";
import { ConexionLibros } from "../../services/conexionLibros.service.js";
import { LibroBD } from "../../interfaces/modelosBD/modelosBD.js";
import { parsePositiveInt } from "../../utils/validation.utils.js";
import {
	respuestaOk,
	respuestaError,
	valorTextoSeguro,
	valorNumeroSeguro,
} from "../../utils/validationMessages.utils.js";
import { asegurarRol, getRolUsuario, getSesionID } from "../../utils/authorization.utils.js";

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
		console.log("[ProcesarAutores] Procesando autor:", autor);

		// Si viene un id_autor explícito, lo usamos directamente (vinculación a autor existente)
		if (autor && autor.id_autor && Number(autor.id_autor) > 0) {
			ids.push(Number(autor.id_autor));
			continue;
		}

		// Si viene un id_usuario (autor vinculado a un usuario), buscamos/creamos el autor asociado
		if (autor && autor.id_usuario && Number(autor.id_usuario) > 0) {
			const idUsuario = Number(autor.id_usuario);
			let encontradoUsuarioAutor = (
				await conexion.listarRegistros("autor", { id_usuario: idUsuario }, "", 1, "id_autor, id_usuario")
			).datos[0];
			if (encontradoUsuarioAutor !== undefined) {
				ids.push(encontradoUsuarioAutor.id_autor);
				continue;
			}
			// Si no existe autor ligado al usuario, intentar obtener datos del usuario para crear el autor
			const usuario = (await conexion.listarRegistros("usuario", { id_usuario: idUsuario }, "", 1, "nombre_real, apellido_usuario")).datos[0];
			if (usuario === undefined) throw new Error("AUTOR_DATOS_INVALIDOS");
			const nombre_autor = usuario.nombre_real ?? "";
			const apellido_autor = usuario.apellido_usuario ?? "";
			const idAutorCreado = (
				await conexion.insertarRegistro("autor", {
					id_usuario: idUsuario,
					nombre_autor: nombre_autor,
					apellido_autor: apellido_autor,
					pais_autor: "",
					esUsuario: true,
				})
			).datos.insertId;
			ids.push(idAutorCreado);
			continue;
		}

		// Finalmente, si no se recibió ningún id, procesamos por nombre/apellido (crear o buscar)
		if (!validarAutor(autor)) throw new Error("AUTOR_DATOS_INVALIDOS");
		const { nombre_autor, apellido_autor, pais_autor } = autor;
		let encontrado = (await conexion.listarRegistros("autor", { nombre_autor, apellido_autor }, "", 1, "id_autor")).datos[0];
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
		// Si el elemento ya es un id numérico
		if (typeof genero === "number" && Number(genero) > 0) {
			ids.push(Number(genero));
			continue;
		}

		// Si viene un objeto con id_genero
		if (genero && (genero.id_genero || genero.id)) {
			const id = Number(genero.id_genero ?? genero.id);
			if (!Number.isNaN(id) && id > 0) {
				ids.push(id);
				continue;
			}
		}

		// Si viene un string con el nombre del género
		if (typeof genero === "string") {
			const nombre_genero = genero.trim();
			if (nombre_genero.length <= 1) throw new Error("GENERO_DATOS_INVALIDOS");
			let encontradoStr = (await conexion.listarRegistros("genero", { nombre_genero }, "", 1, "id_genero")).datos[0];
			if (encontradoStr === undefined) {
				const idGenero = (
					await conexion.insertarRegistro("genero", {
						nombre_genero,
					})
				).datos.insertId;
				ids.push(idGenero);
			} else {
				ids.push(encontradoStr.id_genero);
			}
			continue;
		}

		// Si viene un objeto con nombre_genero
		if (genero && typeof genero.nombre_genero === "string") {
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
			continue;
		}

		// Cualquier otro caso es inválido
		throw new Error("GENERO_DATOS_INVALIDOS");
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
	let conexionDetalle: ConexionLibros | null = null;
	console.log("[ActualizarLibro] Solicitud recibida. Params:", req.params, "Body:", req.body);
	console.log("[ActualizarLibro] Autores:", req.body.autores, "Géneros:", req.body.generos);
	for (const [key, value] of Object.entries(req.body.libro.autores)) {
		console.log(`[ActualizarLibro] Procesando campo: ${key} Valor: ${value} Tipo: ${typeof value}`);
	}
	try {
		const idRaw = req.params.id ?? req.body.id_libro;
		const id = parsePositiveInt(idRaw);
		console.log("[ActualizarLibro] ID a actualizar:", id);
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
		}
		const datosRaw: Partial<LibroBD> =
			typeof req.body.libro === "object" && req.body.libro !== null ? req.body.libro : req.body;

		conexionDetalle = new ConexionLibros();
		const camposActualesRaw = await conexionDetalle.listarRegistros("libro", { id_libro: id }, "", 1);
		if (!camposActualesRaw.exito) return respuestaError(res, 500, "ERROR_OBTENER_LIBRO", camposActualesRaw.mensaje);
		let camposActuales: Partial<LibroBD> = camposActualesRaw.datos[0];
		let datosLibro: Partial<LibroBD> = {};
		if (datosRaw.titulo_libro !== undefined && datosRaw.titulo_libro !== camposActuales.titulo_libro) {
			datosLibro.titulo_libro = valorTextoSeguro(datosRaw.titulo_libro ?? "TITULO_LIBRO_INVALIDO");
		}
		if (datosRaw.codigo_isbn !== undefined && datosRaw.codigo_isbn !== camposActuales.codigo_isbn) {
			datosLibro.codigo_isbn = valorTextoSeguro(datosRaw.codigo_isbn ?? "CODIGO_ISBN_INVALIDO");
		}
		if (
			datosRaw.id_idioma_original !== undefined &&
			datosRaw.id_idioma_original !== camposActuales.id_idioma_original
		) {
			const idIdiomaOriginal = valorNumeroSeguro(datosRaw.id_idioma_original);
			if (idIdiomaOriginal && idIdiomaOriginal > 0) {
				datosLibro.id_idioma_original = idIdiomaOriginal;
			}
		}
		if (datosRaw.paginas !== undefined && datosRaw.paginas !== camposActuales.paginas) {
			const paginas = valorNumeroSeguro(datosRaw.paginas);
			if (paginas && paginas > 0) {
				datosLibro.paginas = paginas;
			}
		}
		if (datosRaw.year_publicacion !== undefined && datosRaw.year_publicacion !== camposActuales.year_publicacion) {
			const yearPublicacion = valorNumeroSeguro(datosRaw.year_publicacion);
			if (yearPublicacion && yearPublicacion > 0) {
				datosLibro.year_publicacion = yearPublicacion;
			}
		}
		if (datosRaw.sinopsis !== undefined && datosRaw.sinopsis !== camposActuales.sinopsis) {
			datosLibro.sinopsis = valorTextoSeguro(datosRaw.sinopsis ?? "").substring(0, 1000);
		}

		const detalleLibro = await conexionDetalle.obtenerDetalleLibro(id);
		if (!detalleLibro) {
			return respuestaError(res, 404, "ERROR_OBTENER_LIBRO");
		}
		console.log("[ActualizarLibro] Detalle libro obtenido:", detalleLibro);
		const idSesion = getSesionID(req);
		const rol = getRolUsuario(req);
		const esAutorVinculado = (detalleLibro.libro.autores ?? []).some(
			autor => autor.id_usuario !== undefined && autor.id_usuario === idSesion,
		);
		if (rol < 1 && !esAutorVinculado) {
			console.log(
				"[ActualizarLibro] Usuario no autorizado para actualizar este libro. Rol:",
				rol,
				"ID sesión:",
				idSesion,
				"Es autor vinculado:",
				esAutorVinculado,
			);
			return respuestaError(res, 403, "ERROR_USUARIO_NO_AUTORIZADO");
		}

		const tieneAutores = Object.prototype.hasOwnProperty.call(req.body.libro, "autores");
		const tieneGeneros = Object.prototype.hasOwnProperty.call(req.body.libro, "generos");
		console.log(
			"[ActualizarLibro] Datos a actualizar:",
			datosLibro,
			"Tiene autores?",
			tieneAutores,
			"Tiene géneros?",
			tieneGeneros,
		);
		if (Object.keys(datosLibro).length > 0) {
			const afectados = (await conexionDetalle.actualizarRegistro("libro", datosLibro, { id_libro: id })).datos;
			if (afectados === 0) {
				console.log("[ActualizarLibro] No se encontró el libro para actualizar. ID:", id);
				return respuestaError(res, 404, "ERROR_OBTENER_LIBRO");
			}
			console.log("[ActualizarLibro] Libro actualizado, filas afectadas:", afectados);
		}

		if (tieneAutores) {
			const autores = Array.isArray(req.body.libro.autores)
				? req.body.libro.autores.map((a: any) => ({
						id_autor: a.id_autor ? Number(a.id_autor) : undefined,
						id_usuario: a.id_usuario ? Number(a.id_usuario) : undefined,
						nombre_autor: a.nombre ? String(a.nombre).trim() : undefined,
						apellido_autor: a.apellido ? String(a.apellido).trim() : undefined,
					}))
				: [];
			console.log("[ActualizarLibro] Procesando autores, datos recibidos:", autores);
			const autoresIds = (await procesarAutores(conexionDetalle, autores)).map(id => Number(id));
			console.log("[ActualizarLibro] IDs de autores procesados:", autoresIds);
			await sincronizarAutores(conexionDetalle, id, autoresIds);
			console.log("[ActualizarLibro] Autores sincronizados.");
		}

		if (tieneGeneros) {
			const generos = Array.isArray(req.body.libro.generos)
				? req.body.libro.generos.map((g: any) => valorNumeroSeguro(g))
				: [];
			console.log("[ActualizarLibro] Procesando géneros, datos recibidos:", generos);
			const generosIds = await procesarGeneros(conexionDetalle, generos);
			await sincronizarGeneros(conexionDetalle, id, generosIds);
			console.log("[ActualizarLibro] Géneros sincronizados.");
		}

		return respuestaOk(res, 200, "LIBRO_ACTUALIZADO_OK", { actualizado: true });
	} catch (error: any) {
		console.error("[ActualizarLibro] Error al actualizar libro:", error);
		return respuestaError(res, 500, "ERROR_ACTUALIZAR_LIBRO", error.message);
	} finally {
		if (conexionDetalle) await conexionDetalle.close();
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
		if (!libroRows.exito || !libroRows.datos || libroRows.datos.length === 0)
			return respuestaError(res, 404, "NO_ENCONTRADO_LIBRO");

		const relacion = await conexion.listarRegistros(
			"libro_usuario",
			{ id_libro: idLibro, id_usuario: idUsuario },
			"",
			1,
			"id_libro, id_usuario, me_gusta_libro",
		);

		if (!relacion.exito) return respuestaError(res, 500, "ERROR_ME_GUSTA_LIBRO", relacion.mensaje);

		if (!relacion.datos || relacion.datos.length === 0) {
			const insert = await conexion.insertarRegistro("libro_usuario", {
				id_libro: idLibro,
				id_usuario: idUsuario,
				me_gusta_libro: 1,
			});
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

		return respuestaOk(res, 200, "LIBRO_ME_GUSTA_QUITADO_OK", {
			id_libro: idLibro,
			id_usuario: idUsuario,
			me_gusta: false,
		});
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
		if (!libroRows.exito || !libroRows.datos || libroRows.datos.length === 0)
			return respuestaError(res, 404, "NO_ENCONTRADO_LIBRO");

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
	let conexionDetalle: ConexionLibros | null = null;
	try {
		const idRaw = req.params.id ?? req.body.id_libro;
		const id = parsePositiveInt(idRaw);
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
		}

		conexionDetalle = new ConexionLibros();
		const detalleLibro = await conexionDetalle.obtenerDetalleLibro(id);
		if (!detalleLibro) {
			return respuestaError(res, 404, "ERROR_OBTENER_LIBRO");
		}
		const idSesion = getSesionID(req);
		const rol = getRolUsuario(req);
		const esAutorVinculado = (detalleLibro.libro.autores ?? []).some(
			autor => autor.id_usuario !== undefined && autor.id_usuario === idSesion,
		);
		if (rol < 1 && !esAutorVinculado) {
			return respuestaError(res, 403, "ERROR_USUARIO_NO_AUTORIZADO");
		}

		const afectados = (await conexionDetalle.borrarRegistro("libro", { id_libro: id })).datos.affectedRows;
		if (afectados === 0) {
			return respuestaError(res, 404, "ERROR_OBTENER_LIBRO");
		}
		return respuestaOk(res, 200, "LIBRO_BORRADO_OK", { borrado: true, afectados });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_BORRAR_LIBRO", error.message);
	} finally {
		if (conexionDetalle) await conexionDetalle.close();
	}
}
