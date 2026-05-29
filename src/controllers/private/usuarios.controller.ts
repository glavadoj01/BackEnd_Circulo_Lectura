import { Response } from "express";
import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { ConexionBD } from "../../services/conexionBD.service.js";
import { parsePositiveInt } from "../../utils/validation.utils.js";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";
import { asegurarPropietarioAdmin, getRolUsuario } from "../../utils/authorization.utils.js";
import { ConexionUsuarios } from "../../services/conexionUsuarios.service.js";
import bcrypt from "bcrypt";
import { LoginService } from "../../services/login.service.js";
import {
	validarPaginacion,
	construirFiltros,
	validarActualizacionUsuario,
	construirDatosUsuarioParcial,
	buscarNombreUsuarioExistente,
	buscarEmailExistente,
} from "../../utils/utils.usuario.js";

/**
 * Obtener usuarios con/sin filtros de búsqueda y paginación.
 * @param req Objeto de solicitud de Express, con posibles filtros en req.query.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con un array de usuarios que coinciden con los filtros, o un error si ocurrió algún problema.
 */
export async function obtenerUsuarios(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionBD | null = null;
	try {
		const q = req.query;
		const limit = validarPaginacion(q);
		const filtros = construirFiltros(req.query);

		conexionAbierta = new ConexionBD();
		const usuarios = await conexionAbierta.listarRegistros(
			"usuario",
			filtros,
			"",
			limit,
			"id_usuario, nombre_usuario, email_usuario, nombre_real, apellido_usuario, fecha_registro_usuario, esAdministrador",
		);
		return respuestaOk(res, 200, "USUARIOS_OBTENIDOS_OK", usuarios.datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_USUARIO_OBTENER_USUARIOS", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

/**
 * Actualizar un usuario existente.
 * @param req Objeto de solicitud de Express, con el ID del usuario a actualizar en req.params.id o req.body.id_usuario, y los datos a actualizar en req.body.
 * @param res Objeto de respuesta de Express.
 * @returns JSON indicando si el usuario fue actualizado y cuántos registros fueron afectados, o un error si ocurrió algún problema o si el usuario no fue encontrado.
 */
export async function actualizarUsuario(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionBD | null = null;
	let loginSrv: LoginService | null = null;
	try {
		const id = parsePositiveInt(req.params.id ?? req.body.id_usuario ?? Number.NaN);
		console.log("[PUT User] ID USUARIO RECIBIDO:", id);
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}
		if (!asegurarPropietarioAdmin(req, res, id, 1)) return respuestaError(res, 403, "ERROR_USUARIO_NO_AUTORIZADO");
		const esModerador = getRolUsuario(req) === 2;
		console.log("[PUT User] ROL USUARIO:", esModerador ? "MODERADOR" : "NO MODERADOR");
		console.log("[PUT User] ID USUARIO A ACTUALIZAR:", id);
		const body = req.body;
		console.log("[PUT User] BODY RECIBIDO:", body);
		// 1) Obtener usuario actual por ID para conocer su email real
		conexionAbierta = new ConexionBD();
		const resultadoUsuarioActual = await conexionAbierta.listarRegistros(
			"usuario",
			{ id_usuario: id },
			"",
			1,
			"id_usuario, email_usuario",
		);
		console.log("[PUT User] RESULTADO OBTENER USUARIO ACTUAL:", resultadoUsuarioActual);
		if (!resultadoUsuarioActual.datos || resultadoUsuarioActual.datos.length === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADO_USUARIO");
		}
		const usuarioActual = resultadoUsuarioActual.datos[0];

		// 2) Si el usuario se actualiza a sí mismo, validar password_actual contra el email actual.
		if (!esModerador) {
			loginSrv = new LoginService();
			const resultadoLogin = await loginSrv.validarPassword(usuarioActual.email_usuario, body.password_actual);
			if (!resultadoLogin) {
				return respuestaError(res, 400, "ERROR_LOGIN_PASSWORD_INVALIDA");
			}
			console.log("[PUT User] RESULTADO LOGIN PASSWORD ACTUAL:", resultadoLogin);
		}
		// 3) Normalizar body para validación (solo campos que realmente se quieren cambiar)
		const bodyNorm: any = {};
		if (body.datosBasicos?.nombre_usuario !== undefined) bodyNorm.nombre_usuario = body.datosBasicos.nombre_usuario;
		if (body.datosBasicos?.email_usuario !== undefined) bodyNorm.email_usuario = body.datosBasicos.email_usuario;
		if (body.datosBasicos?.nombre_real !== undefined) bodyNorm.nombre_real = body.datosBasicos.nombre_real;
		if (body.datosBasicos?.apellido_usuario !== undefined)
			bodyNorm.apellido_usuario = body.datosBasicos.apellido_usuario;

		if (!esModerador && body?.password_nueva) {
			bodyNorm.password = body.password_nueva;
		}
		console.log("[PUT User] BODY NORMALIZADO PARA VALIDACIÓN:", bodyNorm);
		const errorValidacion = validarActualizacionUsuario(bodyNorm);
		console.log("[PUT User] RESULTADO VALIDACIÓN BODY:", errorValidacion);
		if (errorValidacion) {
			return respuestaError(res, 400, errorValidacion);
		}

		// 4) Construir datos parciales para BD
		const datosBD = construirDatosUsuarioParcial(bodyNorm);

		if (body.password_nueva && body.password_nueva_confirmacion) {
			if (body.password_nueva !== body.password_nueva_confirmacion) {
				return respuestaError(res, 400, "ERROR_PASSWORDS_NO_COINCIDEN");
			}

			const hashNuevo = await bcrypt.hash(String(body.password_nueva).trim(), 10);
			datosBD.password_hash = hashNuevo;
		}

		// 5) Validar unicidad si se actualiza nombre_usuario o email_usuario (excluyendo el propio id)
		if (datosBD.nombre_usuario) {
			const usuarioExistente = await buscarNombreUsuarioExistente(datosBD.nombre_usuario, conexionAbierta, id);
			if (usuarioExistente) {
				return respuestaError(res, 409, "ERROR_USUARIO_NOMBRE_USUARIO_YA_EXISTE");
			}
		}
		if (datosBD.email_usuario) {
			const emailExistente = await buscarEmailExistente(datosBD.email_usuario, conexionAbierta, id);
			if (emailExistente) {
				return respuestaError(res, 409, "ERROR_USUARIO_EMAIL_YA_EXISTE");
			}
		}

		// 6) Ejecutar actualización
		const resultadoUpdate = await conexionAbierta.actualizarRegistro("usuario", datosBD, {
			id_usuario: id,
		});
		const afectados = resultadoUpdate.datos;

		if (afectados === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADO_USUARIO");
		}

		return respuestaOk(res, 200, "USUARIO_ACTUALIZADO_OK", { actualizado: true, afectados });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_USUARIO_ACTUALIZAR_USUARIO", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

/**
 * Borrar un usuario existente.
 * @param req Objeto de solicitud de Express, con el ID del usuario a borrar en req.params.id o req.body.id_usuario.
 * @param res Objeto de respuesta de Express.
 * @returns JSON indicando si el usuario fue borrado y cuántos registros fueron afectados, o un error si ocurrió algún problema.
 */
export async function borrarUsuario(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionBD | null = null;
	try {
		const idRaw = req.params.id ?? req.body.id_usuario;
		const id = parsePositiveInt(idRaw);
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}
		if (!asegurarPropietarioAdmin(req, res, id, 1)) return respuestaError(res, 403, "ERROR_USUARIO_NO_AUTORIZADO");
		conexionAbierta = new ConexionBD();

		// Borrar Tablas Secundarias

		const afectados = (await conexionAbierta.borrarRegistro("usuario", { id_usuario: id })).datos;
		if (afectados === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADO_USUARIO");
		}
		return respuestaOk(res, 200, "USUARIO_BORRADO_OK", { borrado: true, afectados });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_USUARIO_BORRAR_USUARIO", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

export async function obtenerLibrosLeidosUsuario(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionUsuarios | null = null;
	try {
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		conexionAbierta = new ConexionUsuarios();
		const datos = await conexionAbierta.obtenerLibrosLeidosPendientes(id, 1);

		return respuestaOk(res, 200, "LIBROS_LEIDOS_OK", datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_LIBROS_LEIDOS", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

export async function obtenerLibrosPendientesUsuario(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionUsuarios | null = null;
	try {
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		conexionAbierta = new ConexionUsuarios();
		const datos = await conexionAbierta.obtenerLibrosLeidosPendientes(id, 0);

		return respuestaOk(res, 200, "LIBROS_PENDIENTES_OK", datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_LIBROS_PENDIENTES", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

export async function obtenerListasCreadasUsuario(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionUsuarios | null = null;
	console.log("[GET Listas Creadas Usuario] ID USUARIO:", req.params.id);
	console.log("[GET Listas Creadas Usuario] req Recibida:", req.user);
	console.log("[GET Listas Creadas Usuario] Authorization Header:", req.headers["authorization"]);

	try {
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		conexionAbierta = new ConexionUsuarios();

		const idListasCreadas = await conexionAbierta.listarRegistros("lista", { id_usuarioCrd: id }, "", 0, "id_lista");

		const datos = await conexionAbierta.obtenerListasPorIds(idListasCreadas.datos.map((l: any) => l.id_lista));

		return respuestaOk(res, 200, "LISTAS_CREADAS_OK", datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_LISTAS_CREADAS", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

export async function obtenerListasSeguidasUsuario(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionUsuarios | null = null;
	try {
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		conexionAbierta = new ConexionUsuarios();

		const idListasSeguidas = await conexionAbierta.listarRegistros(
			"lista_usuario",
			{ id_usuario: id },
			"",
			0,
			"id_lista",
		);

		const datos = await conexionAbierta.obtenerListasPorIds(idListasSeguidas.datos.map((lu: any) => lu.id_lista));

		return respuestaOk(res, 200, "LISTAS_SEGUIDAS_OK", datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_LISTAS_SEGUIDAS", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

export async function obtenerEventosCreadosUsuario(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionUsuarios | null = null;
	try {
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		conexionAbierta = new ConexionUsuarios();
		const datos = await conexionAbierta.obtenerEventosCreados(id);

		return respuestaOk(res, 200, "EVENTOS_CREADOS_OK", datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_EVENTOS_CREADOS", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

export async function obtenerEventosAsistidosUsuario(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionUsuarios | null = null;
	try {
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		conexionAbierta = new ConexionUsuarios();
		const datos = await conexionAbierta.obtenerEventosAsistidos(id);

		return respuestaOk(res, 200, "EVENTOS_ASISTIDOS_OK", datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_EVENTOS_ASISTIDOS", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

export async function obtenerCriticasUsuario(req: AuthRequest, res: Response) {
	let conexionAbierta: ConexionUsuarios | null = null;
	try {
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}

		conexionAbierta = new ConexionUsuarios();
		const datos = await conexionAbierta.obtenerCriticasUsuario(id);

		return respuestaOk(res, 200, "USUARIO_CRITICAS_OK", datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_CRITICAS_USUARIO", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}
