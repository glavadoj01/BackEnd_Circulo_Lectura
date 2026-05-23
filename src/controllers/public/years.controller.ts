import { Request, Response } from "express";
import { ConexionBD } from "../../services/conexionBD.service.js";
import { respuestaOk, respuestaError } from "../../utils/validationMessages.utils.js";

export async function obtenerYears(_req: Request, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		conexion = new ConexionBD();
		const result = await conexion.listarRegistros("libro", {}, "year_publicacion DESC", 0, "DISTINCT year_publicacion");
		if (!result.exito) return respuestaError(res, 500, "ERROR_OBTENER_YEARS", result.mensaje);
		return respuestaOk(res, 200, "YEARS_OBTENIDOS_OK", result.datos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_YEARS", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
