import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ConexionBD } from "../../services/conexionBD.service.js";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";
import {
	validarUsuario,
	construirDatosUsuario,
	buscarNombreUsuarioExistente,
	buscarEmailExistente,
} from "../../utils/utils.usuario.js";
import { parsePositiveInt } from "../../utils/validation.utils.js";

export async function obtenerNombreUsuario(req: Request, res: Response) {
	let conexionAbierta: ConexionBD | null = null;
	try {
		const id = Number(req.params.id);
		if (!Number.isFinite(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}
		conexionAbierta = new ConexionBD();
		const datos = await conexionAbierta.listarRegistros("usuario", { id_usuario: id }, "", 1, "nombre_usuario");
		if (!datos.datos || datos.datos.length === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADO_USUARIO");
		}
		return respuestaOk(res, 200, "USUARIO_NOMBRE_OBTENIDO_OK", {
			nombre_usuario: datos.datos[0].nombre_usuario,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_USUARIO_NOMBRE", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

/**
 * Obtener un usuario por ID.
 * @param req Objeto de solicitud de Express, con el ID del usuario en req.params.id.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con los datos del usuario encontrado, o un error si no fue encontrado.
 */
export async function obtenerUsuario(req: Request, res: Response) {
	let conexionAbierta: ConexionBD | null = null;
	try {
		const id = parsePositiveInt(req.params.id);

		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
		}
		conexionAbierta = new ConexionBD();
		const resultado = await conexionAbierta.listarRegistros(
			"usuario",
			{ id_usuario: id },
			"",
			1,
			"id_usuario, nombre_usuario, email_usuario, nombre_real, apellido_usuario, fecha_registro_usuario, esAdministrador",
		);
		if (!resultado.datos || resultado.datos.length === 0) {
			return respuestaError(res, 404, "NO_ENCONTRADO_USUARIO");
		}
		return respuestaOk(res, 200, "USUARIO_OBTENIDO_OK", resultado.datos[0]);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_USUARIO_OBTENER_USUARIO", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

/**
 * Crear un nuevo usuario.
 * @param req Objeto de solicitud de Express, con los datos del usuario en req.body.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con el ID del usuario creado y los datos ingresados, o un error si ocurrió algún problema.
 */
export async function crearUsuario(req: Request, res: Response) {
	let conexionAbierta: ConexionBD | null = null;
	try {
		const body = req.body;
		const errorValidacion = validarUsuario(body);
		if (errorValidacion) {
			return respuestaError(res, 400, errorValidacion);
		}
		const datosBD = construirDatosUsuario(body);

		// Generar hash de la contraseña antes de guardar en BD
		const hash = await bcrypt.hash(datosBD.password, 10);
		// Guardo el campo password_hash
		datosBD.password_hash = hash;
		// Elimino el campo password que no existe en la BD y no quiero guardar
		delete datosBD.password;

		conexionAbierta = new ConexionBD();
		// Validar unicidad de nombre_usuario y email_usuario
		if (await buscarNombreUsuarioExistente(datosBD.nombre_usuario, conexionAbierta)) {
			return respuestaError(res, 409, "ERROR_USUARIO_NOMBRE_USUARIO_YA_EXISTE");
		}
		if (await buscarEmailExistente(datosBD.email_usuario, conexionAbierta)) {
			return respuestaError(res, 409, "ERROR_USUARIO_EMAIL_YA_EXISTE");
		}

		datosBD.esAdministrador = 0; // Por defecto Usuario -> Administrador tiene ruta para actualizarlo
		const rowsData = await conexionAbierta.insertarRegistro("usuario", datosBD);
		if (!rowsData.exito) {
			return respuestaError(res, 500, "ERROR_USUARIO_CREAR_USUARIO");
		}

		const insertId = rowsData.datos;
		//! POSTAMAN: COMENTAR ESTA LÍNEA SI SE USA POSTAM Y SE QUIERE VER EL HASH -> RECORODAR COMENTARLA DE NUEVO!!!!!
		delete datosBD.password_hash;
		delete datosBD.esAdministrador;
		return respuestaOk(res, 201, "USUARIO_CREADO_OK", { id_usuario: insertId, ...datosBD });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_USUARIO_CREAR_USUARIO", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}
