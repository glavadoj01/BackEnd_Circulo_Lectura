import { Response, NextFunction } from "express";
import { ConexionBD } from "../services/conexionBD.service.js";
import { respuestaError } from "./validationMessages.utils.js";
import { AuthRequest } from "../interfaces/modelosApp/modelosApp.js";

const regexNumero = /^\d+$/;

const procesarIdUsuario = (url: string): number | null => {
	const partes = url.split("/");
	const idIn = partes[partes.length - 1];
	if (regexNumero.test(idIn)) {
		return parseInt(idIn, 10);
	}

	return null;
};

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		console.log("================================");
		// console.log("[AUTH] authMiddleware - INICIO");
		// console.log('[AUTH] authMiddleware - req recibida: ', req);
		const auth = req.header("Authorization");
		// console.log("[AUTH] authMiddleware - Authorization Header:", auth);
		if (!auth || !auth.startsWith("Bearer ")) {
			req.user = null;
			return next(); // público sin usuario
		}

		const token = auth.substring("Bearer ".length).trim();
		// console.log("[AUTH] authMiddleware - Token extraído:", token);
		if (!token) {
			req.user = null;
			return next();
		}

		const idIn = procesarIdUsuario(req.originalUrl);
		// console.log("[AUTH] authMiddleware - ID usuario procesado de URL:", idIn);

		const conexion = new ConexionBD();
		const rows: any = await conexion.listarRegistros(
			"sesiones",
			{
				token: token,
				expira: { operador: ">", valor: new Date() },
			},
			"",
			1,
			"*",
		);
		if (!rows.exito || !rows.datos || rows.datos.length === 0) {
			console.log("[AUTH] authMiddleware - Token inválido o expirado");
			return respuestaError(res, 401, "ERROR_LOGIN_TOKEN_INVALIDO");
		}
		// console.log("[AUTH] authMiddleware - Resultado consulta sesiones:", rows);

		const idSesion = rows.datos[0].id_usuario;
		// console.log("[AUTH] authMiddleware - ID sesión encontrada:", idSesion);

		const rowsUsuario: any = await conexion.listarRegistros(
			"usuario",
			{ id_usuario: rows.datos[0].id_usuario },
			"",
			1,
			"nombre_usuario, email_usuario, nombre_real, apellido_usuario, esAdministrador",
		);
		// console.log("[AUTH] authMiddleware - Resultado consulta usuario:", rowsUsuario);

		if (idSesion !== idIn) {
			console.log("[AUTH] authMiddleware - ID sesión no coincide con ID en URL");
			if (rowsUsuario.datos[0].esAdministrador !== 2) {
				return respuestaError(res, 403, "ERROR_LOGIN_TOKEN_NO_CORRESPONDE");
			}
			console.log("[AUTH] authMiddleware - Usuario es administrador, se permite acceso a ID diferente en URL");
		}

		if (!rowsUsuario.exito || !rowsUsuario.datos || rowsUsuario.datos.length === 0) {
			console.log("[AUTH] authMiddleware - Usuario no encontrado");
			return respuestaError(res, 401, "ERROR_USUARIO_OBTENER_USUARIO");
		}

		const sesion = rows.datos[0];
		const usuario = rowsUsuario.datos[0];

		const datosUsuario: Record<string, any> = {};
		datosUsuario.id_usuario = sesion.id_usuario;
		if (usuario.nombre_usuario) datosUsuario.nombre_usuario = usuario.nombre_usuario;
		if (usuario.email_usuario) datosUsuario.email_usuario = usuario.email_usuario;
		if (usuario.nombre_real) datosUsuario.nombre_real = usuario.nombre_real;
		if (usuario.apellido_usuario) datosUsuario.apellido_usuario = usuario.apellido_usuario;
		if (usuario.fecha_registro) datosUsuario.fecha_registro = usuario.fecha_registro;
		if (usuario.esAdministrador !== undefined && usuario.esAdministrador > 0) {
			datosUsuario.esAdministrador = usuario.esAdministrador;
		}
		console.log("[AUTH] authMiddleware - Datos usuario autenticado:", datosUsuario);
		req.user = {
			usuario: datosUsuario,
			sesion: {
				id_usuario: idSesion,
				token: sesion.token,
			},
		};

		next();
	} catch (error) {
		console.error("[AUTH] Error en authMiddleware:", error);
		return respuestaError(res, 500, "ERROR_INTERNO");
	} finally {
		console.log("[AUTH] authMiddleware - FIN");
		console.log("================================");
	}
}
