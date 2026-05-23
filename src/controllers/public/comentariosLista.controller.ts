import { Request, Response } from "express";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";
import { ConexionListas } from "../../services/conexionListas.service.js";

// ================= MÉTODOS: COMENTARIOS DE LISTA =================
export async function obtenerComentariosLista(req: Request, res: Response) {
	let conexion: ConexionListas | null = null;
	try {
		const id_lista = Number(req.params.id);
		if (Number.isNaN(id_lista)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		conexion = new ConexionListas();
		const comentarios = await conexion.obtenerComentariosDeLista(id_lista);
		return respuestaOk(res, 200, "COMENTARIOS_LISTA_OK", comentarios);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_COMENTARIOS_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
