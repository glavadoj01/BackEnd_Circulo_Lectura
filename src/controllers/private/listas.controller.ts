import { Response } from "express";
import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { ConexionBD } from "../../services/conexionBD.service.js";
import { ConexionListas } from "../../services/conexionListas.service.js";
import { asegurarPropietarioAdmin, getSesionID } from "../../utils/authorization.utils.js";
import { ListaBD } from "../../interfaces/modelosBD/modelosBD.js";
import { respuestaOk, respuestaError } from "../../utils/validationMessages.utils.js";

export async function crearLista(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const datos: Partial<ListaBD> = req.body.lista ? req.body.lista : req.body;
		if (!datos.nombre_lista || typeof datos.nombre_lista !== "string" || datos.nombre_lista.trim().length < 2) {
			return respuestaError(res, 400, "CAMPOS_OBLIGATORIOS");
		}

		const idCrd = getSesionID(req);
		if (!idCrd) {
			return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");
		}
		datos.id_usuarioCrd = idCrd;

		conexion = new ConexionBD();
		const insert = await conexion.insertarRegistro("lista", datos as Record<string, string | number | boolean | Date>);
		if (!insert.exito) {
			const mensaje = String(insert.mensaje || "");
			if (mensaje.toLowerCase().includes("duplicate entry")) {
				return respuestaError(res, 409, "ERROR_CREAR_LISTA", "Ya existe una lista con ese nombre");
			}
			return respuestaError(res, 500, "ERROR_CREAR_LISTA", mensaje || "No se pudo crear la lista");
		}
		const insertId = Number(insert.datos);
		if (!Number.isFinite(insertId) || insertId <= 0) {
			return respuestaError(res, 500, "ERROR_CREAR_LISTA", "No se obtuvo un id válido para la lista");
		}
		return respuestaOk(res, 201, "LISTA_CREADA_OK", { id_lista: insertId, ...datos });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_CREAR_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function actualizarLista(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const id = Number(req.params.id ?? req.body.id_lista);
		const datos: Partial<ListaBD> =
			typeof req.body.lista === "object" && req.body.lista !== null ? req.body.lista : req.body;
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		conexion = new ConexionBD();
		// Verificar propietario o rol mínimo (moderador)
		const lista = (await conexion.listarRegistros("lista", { id_lista: id }, "", 1, "id_usuarioCrd")).datos[0];
		if (!lista) return respuestaError(res, 404, "ERROR_ACTUALIZAR_LISTA", "Lista no encontrada");
		if (!asegurarPropietarioAdmin(req, res, Number(lista.id_usuarioCrd), 1)) return null;

		const afectados = (await conexion.actualizarRegistro("lista", datos, { id_lista: id })).datos.affectedRows;
		if (afectados === 0) {
			return respuestaError(res, 404, "ERROR_ACTUALIZAR_LISTA", "Lista no encontrada");
		}
		return respuestaOk(res, 200, "LISTA_ACTUALIZADA_OK", { actualizado: true, afectados });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_ACTUALIZAR_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function borrarLista(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const id = Number(req.params.id ?? req.body.id_lista);
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		conexion = new ConexionBD();
		const lista = (await conexion.listarRegistros("lista", { id_lista: id }, "", 1, "id_usuarioCrd")).datos[0];
		if (!lista) return respuestaError(res, 404, "ERROR_BORRAR_LISTA", "Lista no encontrada");
		if (!asegurarPropietarioAdmin(req, res, Number(lista.id_usuarioCrd), 1)) return null;

		const afectados = (await conexion.borrarRegistro("lista", { id_lista: id })).datos.affectedRows;
		if (afectados === 0) {
			return respuestaError(res, 404, "ERROR_BORRAR_LISTA", "Lista no encontrada");
		}
		return respuestaOk(res, 200, "LISTA_BORRADA_OK", { borrado: true, afectados });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_BORRAR_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function seguirLista(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const idLista = Number(req.params.id ?? req.body.id_lista);
		const idUsuario = Number(req.params.usuarioId ?? req.body.id_usuario);

		if (Number.isNaN(idLista)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		if (Number.isNaN(idUsuario)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		if (getSesionID(req) !== idUsuario) {
			return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");
		}

		conexion = new ConexionBD();

		const lista = await conexion.listarRegistros("lista", { id_lista: idLista }, "", 1, "id_lista");
		if (!lista.exito || !lista.datos || lista.datos.length === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADA_LISTA");
		}

		const relacion = await conexion.listarRegistros(
			"lista_usuario",
			{ id_lista: idLista, id_usuario: idUsuario },
			"",
			1,
			"id_lista, id_usuario, me_gusta_lista",
		);

		if (!relacion.exito) {
			return respuestaError(res, 500, "ERROR_SEGUIR_LISTA", relacion.mensaje);
		}

		if (!relacion.datos || relacion.datos.length === 0) {
			const insercion = await conexion.insertarRegistro("lista_usuario", {
				id_lista: idLista,
				id_usuario: idUsuario,
				me_gusta_lista: 0,
			});
			if (!insercion.exito) {
				return respuestaError(res, 500, "ERROR_SEGUIR_LISTA", insercion.mensaje);
			}
		}

		return respuestaOk(res, 200, "LISTA_SEGUIDA_OK", {
			id_lista: idLista,
			id_usuario: idUsuario,
			seguida: true,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_SEGUIR_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

// Dejar de seguir una lista (marca me_gusta_lista = 0)
export async function dejarSeguirLista(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const idLista = Number(req.params.id ?? req.body.id_lista);
		const idUsuario = Number(req.params.usuarioId ?? req.body.id_usuario);

		if (Number.isNaN(idLista)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		if (Number.isNaN(idUsuario)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		if (getSesionID(req) !== idUsuario) {
			return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");
		}

		conexion = new ConexionBD();

		const lista = await conexion.listarRegistros("lista", { id_lista: idLista }, "", 1, "id_lista");
		if (!lista.exito || !lista.datos || lista.datos.length === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADA_LISTA");
		}

		const relacion = await conexion.listarRegistros(
			"lista_usuario",
			{ id_lista: idLista, id_usuario: idUsuario },
			"",
			1,
			"id_lista, id_usuario, me_gusta_lista",
		);

		if (!relacion.exito) {
			return respuestaError(res, 500, "ERROR_DEJAR_SEGUIR_LISTA", relacion.mensaje);
		}

		if (relacion.datos && relacion.datos.length > 0) {
			const actualizacion = await conexion.actualizarRegistro(
				"lista_usuario",
				{ me_gusta_lista: 0 },
				{ id_lista: idLista, id_usuario: idUsuario },
			);
			if (!actualizacion.exito) {
				return respuestaError(res, 500, "ERROR_DEJAR_SEGUIR_LISTA", actualizacion.mensaje);
			}
		}

		return respuestaOk(res, 200, "LISTA_DEJADA_SEGUIR_OK", {
			id_lista: idLista,
			id_usuario: idUsuario,
			seguida: false,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_DEJAR_SEGUIR_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function marcarMeGustaLista(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const idLista = Number(req.params.id ?? req.body.id_lista);
		const idUsuario = Number(req.params.usuarioId ?? req.body.id_usuario);

		if (Number.isNaN(idLista)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		if (Number.isNaN(idUsuario)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		if (getSesionID(req) !== idUsuario) {
			return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");
		}

		conexion = new ConexionBD();
		const relacion = await conexion.listarRegistros(
			"lista_usuario",
			{ id_lista: idLista, id_usuario: idUsuario },
			"",
			1,
			"id_lista, id_usuario, me_gusta_lista",
		);

		if (!relacion.exito || !relacion.datos || relacion.datos.length === 0) {
			return respuestaError(res, 409, "ERROR_SEGUIR_LISTA", "El usuario debe seguir la lista antes de marcar me gusta");
		}

		const actualizacion = await conexion.actualizarRegistro(
			"lista_usuario",
			{ me_gusta_lista: 1 },
			{ id_lista: idLista, id_usuario: idUsuario },
		);
		if (!actualizacion.exito) {
			return respuestaError(res, 500, "ERROR_ME_GUSTA_LISTA", actualizacion.mensaje);
		}

		return respuestaOk(res, 200, "LISTA_ME_GUSTA_OK", {
			id_lista: idLista,
			id_usuario: idUsuario,
			me_gusta: true,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_ME_GUSTA_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function quitarMeGustaLista(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const idLista = Number(req.params.id ?? req.body.id_lista);
		const idUsuario = Number(req.params.usuarioId ?? req.body.id_usuario);

		if (Number.isNaN(idLista)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		if (Number.isNaN(idUsuario)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		if (getSesionID(req) !== idUsuario) {
			return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");
		}

		conexion = new ConexionBD();
		const relacion = await conexion.listarRegistros(
			"lista_usuario",
			{ id_lista: idLista, id_usuario: idUsuario },
			"",
			1,
			"id_lista, id_usuario, me_gusta_lista",
		);

		if (!relacion.exito || !relacion.datos || relacion.datos.length === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADA_LISTA");
		}

		const actualizacion = await conexion.actualizarRegistro(
			"lista_usuario",
			{ me_gusta_lista: 0 },
			{ id_lista: idLista, id_usuario: idUsuario },
		);
		if (!actualizacion.exito) {
			return respuestaError(res, 500, "ERROR_QUITAR_ME_GUSTA_LISTA", actualizacion.mensaje);
		}

		return respuestaOk(res, 200, "LISTA_ME_GUSTA_QUITADO_OK", {
			id_lista: idLista,
			id_usuario: idUsuario,
			me_gusta: false,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_QUITAR_ME_GUSTA_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function obtenerEstadoListaUsuario(req: AuthRequest, res: Response) {
	let conexionListas: ConexionListas | null = null;
	try {
		const idLista = Number(req.params.id ?? req.body.id_lista);
		const idUsuario = Number(req.params.usuarioId ?? req.body.id_usuario);

		if (Number.isNaN(idLista)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		if (Number.isNaN(idUsuario)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		if (getSesionID(req) !== idUsuario) {
			return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");
		}

		conexionListas = new ConexionListas();
		const lista = await conexionListas.listarRegistros("lista", { id_lista: idLista }, "", 1, "id_lista");
		if (!lista.exito || !lista.datos || lista.datos.length === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADA_LISTA");
		}

		const detalle = await conexionListas.obtenerEstadoListaUsuario(idLista, idUsuario);
		return respuestaOk(res, 200, "LISTA_ESTADO_USUARIO_OK", detalle);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_LISTA", error.message);
	} finally {
		if (conexionListas) await conexionListas.close();
	}
}
