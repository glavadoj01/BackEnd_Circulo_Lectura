import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { Request, Response } from "express";
import { ConexionBD } from "../../services/conexionBD.service.js";
import { respuestaOk, respuestaError, valorTextoSeguro } from "../../utils/validationMessages.utils.js";
import { asegurarRol } from "../../utils/authorization.utils.js";

export async function obtenerAutores(_req: Request, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		conexion = new ConexionBD();
		const result = await conexion.listarRegistros(
			"autor",
			{},
			"nombre_autor ASC, apellido_autor ASC",
			0,
			"id_autor, nombre_autor, apellido_autor",
		);
		if (!result.exito) return respuestaError(res, 500, "ERROR_OBTENER_AUTORES", result.mensaje);
		return respuestaOk(res, 200, "AUTORES_OBTENIDOS_OK", result.datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_AUTORES", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function crearAutor(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		// Requiere al menos rol 1 (autenticado/admin según configuración)
		if (!asegurarRol(req, res, 1)) return null;

		const nombre = valorTextoSeguro(req.body.nombre_autor ?? req.body.nombre);
		const apellido = valorTextoSeguro(req.body.apellido_autor ?? req.body.apellido);

		if (!nombre || nombre.length <= 1 || !apellido || apellido.length <= 1) {
			return respuestaError(res, 400, "DATOS_INVALIDOS");
		}

		conexion = new ConexionBD();
		const insert = await conexion.insertarRegistro("autor", {
			nombre_autor: nombre,
			apellido_autor: apellido,
			pais_autor: req.body.pais_autor ?? "",
			esUsuario: false,
		});
		if (!insert.exito) return respuestaError(res, 500, "ERROR_CREAR_LIBRO", insert.mensaje);

		// `insertarRegistro` devuelve el id directamente en `insert.datos` cuando `devolverId` es true
		const id = insert.datos;
		return respuestaOk(res, 201, "AUTORES_OBTENIDOS_OK", { id_autor: id, nombre_autor: nombre, apellido_autor: apellido });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_AUTORES", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
