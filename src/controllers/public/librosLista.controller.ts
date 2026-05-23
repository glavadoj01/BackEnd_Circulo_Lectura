import { Request, Response } from "express";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";
import { ConexionListas } from "../../services/conexionListas.service.js";

// ================= MÉTODOS: LIBROS EN LISTA =================
export async function obtenerLibrosDeLista(req: Request, res: Response) {
	let conexion: ConexionListas | null = null;
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		conexion = new ConexionListas();
		const libros = await conexion.obtenerLibrosDeListaResumen(id);
		return respuestaOk(res, 200, "LIBROS_LISTA_OK", libros);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_LIBROS_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
