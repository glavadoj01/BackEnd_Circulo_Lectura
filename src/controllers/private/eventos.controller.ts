import { Response } from "express";
import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { EventoBD } from "../../interfaces/modelosBD/modelosBD.js";
import { parsePositiveInt } from "../../utils/validation.utils.js";
import { respuestaOk, respuestaError } from "../../utils/validationMessages.utils.js";
import { asegurarPropietarioAdmin, getSesionID } from "../../utils/authorization.utils.js";
import { ConexionEventos } from "../../services/conexionEventos.service.js";
import { ConexionBD } from "../../services/conexionBD.service.js";

const esFechaValida = (valor: unknown): boolean => {
	if (valor === undefined || valor === null || valor === "") return false;
	const fecha = valor instanceof Date ? valor : new Date(String(valor));
	return !Number.isNaN(fecha.getTime());
};

const construirDatosEvento = (body: any, esActualizacion = false): Partial<EventoBD> => {
	const datos: Partial<EventoBD> = {};

	if (!esActualizacion || body.id_usuarioCrd !== undefined) {
		const idUsuarioCrd = parsePositiveInt(body.id_usuarioCrd);
		if (!Number.isNaN(idUsuarioCrd)) datos.id_usuarioCrd = idUsuarioCrd;
	}

	if (!esActualizacion || body.nombre_evento !== undefined) {
		if (typeof body.nombre_evento === "string") datos.nombre_evento = body.nombre_evento.trim();
	}

	if (!esActualizacion || body.fecha_evento !== undefined) {
		if (esFechaValida(body.fecha_evento)) {
			datos.fecha_evento = body.fecha_evento.split("T")[0];
		}
	}

	if (body.hora_evento !== undefined) {
		datos.hora_evento = String(body.hora_evento).trim();
	}

	if (body.direccion_evento !== undefined) {
		datos.direccion_evento = String(body.direccion_evento).trim();
	}

	if (!esActualizacion || body.descripcion_evento !== undefined) {
		if (typeof body.descripcion_evento === "string") {
			datos.descripcion_evento = body.descripcion_evento.trim();
		}
	}

	return datos;
};

const validarEvento = (evento: Partial<EventoBD>, esActualizacion = false): boolean => {
	if (!evento || typeof evento !== "object") return false;

	if (!esActualizacion) {
		if (
			Number.isNaN(parsePositiveInt(evento.id_usuarioCrd)) ||
			typeof evento.nombre_evento !== "string" ||
			evento.nombre_evento.trim().length < 2 ||
			!esFechaValida(evento.fecha_evento) ||
			typeof evento.descripcion_evento !== "string" ||
			evento.descripcion_evento.trim().length < 2
		) {
			console.log("[validarEvento] Validación fallida - Campos obligatorios no válidos:", {
				id_usuarioCrd: evento.id_usuarioCrd,
				nombre_evento: evento.nombre_evento,
			});
			return false;
		}
	}

	if (evento.nombre_evento !== undefined && evento.nombre_evento.trim().length < 2) {
		console.log("[validarEvento] Validación fallida - Nombre del evento inválido:", evento.nombre_evento);
		return false;
	}
	if (evento.fecha_evento !== undefined && !esFechaValida(evento.fecha_evento)) {
		console.log("[validarEvento] Validación fallida - Fecha del evento inválida:", evento.fecha_evento);
		return false;
	}
	if (
		evento.descripcion_evento !== undefined &&
		typeof evento.descripcion_evento === "string" &&
		evento.descripcion_evento.trim().length < 2
	) {
		console.log("[validarEvento] Validación fallida - Descripción del evento inválida:", evento.descripcion_evento);
		return false;
	}

	return true;
};

export async function crearEvento(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	console.log("[crearEvento] Request recibida:", { body: req.body });
	console.log("[crearEvento] Usuario autenticado ID:", getSesionID(req));
	try {
		const body = req.body.evento && typeof req.body.evento === "object" ? req.body.evento : req.body;
		const datosRaw = { ...body, id_usuarioCrd: getSesionID(req) };
		console.log("[crearEvento] Datos crudos recibidos para creación de evento:", datosRaw);
		const datos = construirDatosEvento(datosRaw);
		console.log("[crearEvento] Datos procesados para creación de evento:", datos);
		if (!validarEvento(datos)) {
			console.log("[crearEvento] Validación de datos fallida:", datos);
			return respuestaError(res, 400, "CAMPOS_OBLIGATORIOS");
		}

		const idUsuarioSesion = getSesionID(req);
		if (idUsuarioSesion === null) {
			console.log("[crearEvento] Usuario no autenticado");
			return respuestaError(res, 401, "ERROR_USUARIO_NO_AUTENTICADO");
		}
		datos.id_usuarioCrd = idUsuarioSesion;

		conexion = new ConexionBD();
		const resultado = await conexion.insertarRegistro("evento", datos as Record<string, any>);
		console.log("[crearEvento] Resultado inserción en base de datos:", resultado);
		return respuestaOk(res, 201, "EVENTO_CREADO_OK", {
			id_evento: resultado.datos,
			...datos,
		});
	} catch (error: any) {
		console.error("[crearEvento] Error al crear evento:", error);
		return respuestaError(res, 500, "ERROR_CREAR_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function actualizarEvento(req: AuthRequest, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
		if (Number.isNaN(idEvento)) {
			return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		}

		const body = req.body.evento && typeof req.body.evento === "object" ? req.body.evento : req.body;
		const datos = construirDatosEvento(body, true);
		if (Object.keys(datos).length === 0 || !validarEvento(datos, true)) {
			return respuestaError(res, 400, "NO_HAY_CAMPOS_ACTUALIZAR");
		}

		conexion = new ConexionEventos();
		const evento = await conexion.listarRegistros("evento", { id_evento: idEvento }, "", 1, "id_usuarioCrd");
		const idCrd =
			evento.exito && Array.isArray(evento.datos) && evento.datos.length > 0 ? evento.datos[0].id_usuarioCrd : null;
		if (!evento) {
			return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");
		}
		if (!asegurarPropietarioAdmin(req, res, Number(idCrd), 1)) return null;

		const resultado = await conexion.actualizarRegistro("evento", datos as Record<string, any>, {
			id_evento: idEvento,
		});

		if (resultado.datos.affectedRows === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");
		}

		return respuestaOk(res, 200, "EVENTO_ACTUALIZADO_OK", {
			actualizado: true,
			afectados: resultado.datos.affectedRows,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_ACTUALIZAR_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function borrarEvento(req: AuthRequest, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
		if (Number.isNaN(idEvento)) {
			return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		}

		conexion = new ConexionEventos();
		const evento = await conexion.listarRegistros("evento", { id_evento: idEvento }, "", 1, "id_usuarioCrd");

		if (!evento) {
			return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");
		}
		const idCrd = evento.exito && Array.isArray(evento.datos) ? evento.datos[0] : null;
		if (!asegurarPropietarioAdmin(req, res, Number(idCrd), 1)) return null;

		const resultado = await conexion.borrarRegistro("evento", { id_evento: idEvento });

		if (resultado.datos.affectedRows === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");
		}

		return respuestaOk(res, 200, "EVENTO_BORRADO_OK", {
			borrado: true,
			afectados: resultado.datos.affectedRows,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_BORRAR_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

async function obtenerEventoExistente(conexion: ConexionEventos, idEvento: number): Promise<boolean> {
	const evento = await conexion.listarRegistros("evento", { id_evento: idEvento }, "", 1, "id_evento");
	return Boolean(evento.exito && evento.datos && evento.datos.length > 0);
}

export async function seguirEvento(req: AuthRequest, res: Response) {
	let conexion: ConexionEventos | null = null;
	console.log("[seguirEvento] Request recibida:", { params: req.params, body: req.body });
	try {
		const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
		const idUsuario = parsePositiveInt(req.params.usuarioId ?? req.body.id_usuario);
		console.log("[seguirEvento] ID Evento:", idEvento, "ID Usuario:", idUsuario);
		if (Number.isNaN(idEvento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		if (Number.isNaN(idUsuario)) return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		if (getSesionID(req) !== idUsuario) return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");

		conexion = new ConexionEventos();
		const existeEvento = await obtenerEventoExistente(conexion, idEvento);
		console.log("[seguirEvento] Existe evento:", existeEvento);
		if (!existeEvento) return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");

		await conexion.seguirEvento(idEvento, idUsuario);
		console.log("[seguirEvento] Usuario ahora sigue el evento");
		return respuestaOk(res, 200, "EVENTO_SEGUIDO_OK", {
			id_evento: idEvento,
			id_usuario: idUsuario,
			siguiendo: true,
		});
	} catch (error: any) {
		console.error("[seguirEvento] Error al seguir evento:", error);
		const codigo = error.message === "NO_ENCONTRADO_EVENTO" ? 404 : 500;
		return respuestaError(res, codigo, codigo === 404 ? "NO_ENCONTRADO_EVENTO" : "ERROR_SEGUIR_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function dejarSeguirEvento(req: AuthRequest, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
		const idUsuario = parsePositiveInt(req.params.usuarioId ?? req.body.id_usuario);
		if (Number.isNaN(idEvento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		if (Number.isNaN(idUsuario)) return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		if (getSesionID(req) !== idUsuario) return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");

		conexion = new ConexionEventos();
		const existeEvento = await obtenerEventoExistente(conexion, idEvento);
		if (!existeEvento) return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");

		await conexion.dejarSeguirEvento(idEvento, idUsuario);
		return respuestaOk(res, 200, "EVENTO_DEJADO_SEGUIR_OK", {
			id_evento: idEvento,
			id_usuario: idUsuario,
			siguiendo: false,
		});
	} catch (error: any) {
		const codigo = error.message === "NO_ENCONTRADO_EVENTO" ? 404 : 500;
		return respuestaError(
			res,
			codigo,
			codigo === 404 ? "NO_ENCONTRADO_EVENTO" : "ERROR_DEJAR_SEGUIR_EVENTO",
			error.message,
		);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function marcarMeGustaEvento(req: AuthRequest, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
		const idUsuario = parsePositiveInt(req.params.usuarioId ?? req.body.id_usuario);
		if (Number.isNaN(idEvento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		if (Number.isNaN(idUsuario)) return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		if (getSesionID(req) !== idUsuario) return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");

		conexion = new ConexionEventos();
		const existeEvento = await obtenerEventoExistente(conexion, idEvento);
		if (!existeEvento) return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");
		const relacion = await conexion.listarRegistros(
			"evento_usuario",
			{ id_evento: idEvento, id_usuario: idUsuario },
			"",
			1,
			"id_evento, id_usuario, asiste, me_gusta_evento",
		);
		if (!relacion.exito) return respuestaError(res, 500, "ERROR_ME_GUSTA_EVENTO", relacion.mensaje);
		if (!relacion.datos || relacion.datos.length === 0 || Number(relacion.datos[0].asiste ?? 0) !== 1) {
			return respuestaError(
				res,
				409,
				"ERROR_SEGUIR_EVENTO",
				"El usuario debe seguir el evento antes de marcar me gusta",
			);
		}

		await conexion.marcarMeGustaEvento(idEvento, idUsuario);
		return respuestaOk(res, 200, "EVENTO_ME_GUSTA_OK", {
			id_evento: idEvento,
			id_usuario: idUsuario,
			me_gusta: true,
		});
	} catch (error: any) {
		const codigo = error.message === "NO_ENCONTRADO_EVENTO" ? 404 : 500;
		return respuestaError(
			res,
			codigo,
			codigo === 404 ? "NO_ENCONTRADO_EVENTO" : "ERROR_ME_GUSTA_EVENTO",
			error.message,
		);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function quitarMeGustaEvento(req: AuthRequest, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
		const idUsuario = parsePositiveInt(req.params.usuarioId ?? req.body.id_usuario);
		if (Number.isNaN(idEvento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		if (Number.isNaN(idUsuario)) return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		if (getSesionID(req) !== idUsuario) return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");

		conexion = new ConexionEventos();
		const existeEvento = await obtenerEventoExistente(conexion, idEvento);
		if (!existeEvento) return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");

		await conexion.quitarMeGustaEvento(idEvento, idUsuario);
		return respuestaOk(res, 200, "EVENTO_ME_GUSTA_QUITADO_OK", {
			id_evento: idEvento,
			id_usuario: idUsuario,
			me_gusta: false,
		});
	} catch (error: any) {
		const codigo = error.message === "NO_ENCONTRADO_EVENTO" ? 404 : 500;
		return respuestaError(
			res,
			codigo,
			codigo === 404 ? "NO_ENCONTRADO_EVENTO" : "ERROR_QUITAR_ME_GUSTA_EVENTO",
			error.message,
		);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function obtenerEstadoEventoUsuario(req: AuthRequest, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
		const idUsuario = parsePositiveInt(req.params.usuarioId ?? req.body.id_usuario);
		if (Number.isNaN(idEvento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		if (Number.isNaN(idUsuario)) return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		if (getSesionID(req) !== idUsuario) return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");

		conexion = new ConexionEventos();
		const existeEvento = await obtenerEventoExistente(conexion, idEvento);
		if (!existeEvento) return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");

		const estado = await conexion.obtenerEstadoEventoUsuario(idEvento, idUsuario);
		return respuestaOk(res, 200, "EVENTO_ESTADO_USUARIO_OK", estado);
	} catch (error: any) {
		const codigo = error.message === "NO_ENCONTRADO_EVENTO" ? 404 : 500;
		return respuestaError(
			res,
			codigo,
			codigo === 404 ? "NO_ENCONTRADO_EVENTO" : "ERROR_OBTENER_ESTADO_EVENTO",
			error.message,
		);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function agregarLibrosAEvento(req: AuthRequest, res: Response) {
	console.log("[agregarLibrosAEvento] Request recibida:", { params: req.params, body: req.body });
	let conexion: ConexionBD | null = null;
	const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
	const idUsuario = parsePositiveInt(req.params.usuarioId ?? req.body.id_usuario);
	const idsLibros: number[] = Array.isArray(req.body.ids_libros)
		? req.body.ids_libros.map(parsePositiveInt)
		: [parsePositiveInt(req.body.id_libro)];

	if (Number.isNaN(idEvento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
	if (Number.isNaN(idUsuario)) return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
	if (idsLibros.some(isNaN)) return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
	if (getSesionID(req) !== idUsuario) return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");

	try {
		conexion = new ConexionBD();
		const evento = await conexion.listarRegistros("evento", { id_evento: idEvento }, "", 1, "id_usuarioCrd");
		if (!evento) {
			return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");
		}
		if (!asegurarPropietarioAdmin(req, res, Number(evento.datos[0].id_usuarioCrd), 1)) {
			return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");
		}
		let resultadoGlobal = true;
		await Promise.all(
			idsLibros.map(async idLibro => {
				const resultado = await conexion?.insertarRegistro("evento_contenido", {
					id_evento: idEvento,
					id_libro: idLibro,
				});
				if (!resultado?.exito) resultadoGlobal = false;
			}),
		);

		if (resultadoGlobal) return respuestaOk(res, 200, "AGREGAR_LIBRO_EVENTO_OK");
		else return respuestaError(res, 500, "ERROR_AGREGAR_LIBRO_EVENTO", "Error al agregar uno o más libros al evento");
	} catch (error: any) {
		conexion = new ConexionBD();
		return respuestaError(res, 500, "ERROR_AGREGAR_LIBRO_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function eliminarLibrosDeEvento(req: AuthRequest, res: Response) {
	console.log("[eliminarLibrosDeEvento] Request recibida:", { params: req.params, body: req.body });
	let conexion: ConexionBD | null = null;
	const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
	const idUsuario = parsePositiveInt(req.params.usuarioId ?? req.body.id_usuario);
	const idsLibros: number[] = Array.isArray(req.body.ids_libros)
		? req.body.ids_libros.map(parsePositiveInt)
		: [parsePositiveInt(req.body.id_libro)];
	if (Number.isNaN(idEvento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
	if (Number.isNaN(idUsuario)) return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
	if (idsLibros.some(isNaN)) return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
	if (getSesionID(req) !== idUsuario) return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");

	try {
		conexion = new ConexionBD();
		const evento = await conexion.listarRegistros("evento", { id_evento: idEvento }, "", 1, "id_usuarioCrd");
		if (!evento) {
			return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");
		}
		if (!asegurarPropietarioAdmin(req, res, Number(evento.datos[0].id_usuarioCrd), 1)) {
			return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");
		}
		let resultadoGlobal = true;
		await Promise.all(
			idsLibros.map(async idLibro => {
				const resultado = await conexion?.borrarRegistro("evento_contenido", {
					id_evento: idEvento,
					id_libro: idLibro,
				});
				if (!resultado?.exito) resultadoGlobal = false;
			}),
		);
		if (resultadoGlobal) return respuestaOk(res, 200, "ELIMINAR_LIBRO_EVENTO_OK");
		else
			return respuestaError(res, 500, "ERROR_ELIMINAR_LIBRO_EVENTO", "Error al eliminar uno o más libros del evento");
	} catch (error: any) {
		conexion = new ConexionBD();
		return respuestaError(res, 500, "ERROR_ELIMINAR_LIBRO_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
