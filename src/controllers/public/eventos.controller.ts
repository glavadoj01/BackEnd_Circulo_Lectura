import { Request, Response } from "express";
import { ConexionEventos } from "../../services/conexionEventos.service.js";
import { respuestaOk, respuestaError } from "../../utils/validationMessages.utils.js";

export async function obtenerEventoId(req: Request, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const id_evento = Number(req.params.id);
		if (Number.isNaN(id_evento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		conexion = new ConexionEventos();
		const evento = await conexion.obtenerEventoPorId(id_evento);
		if (!evento) return respuestaError(res, 404, "NO_ENCONTRADO_EVENTO");
		return respuestaOk(res, 200, "EVENTO_OBTENIDO_OK", evento);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function obtenerAsistentesEvento(req: Request, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const id_evento = Number(req.params.id);
		if (Number.isNaN(id_evento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		conexion = new ConexionEventos();
		const asistentes = await conexion.obtenerAsistentesEvento(id_evento);
		return respuestaOk(res, 200, "ASISTENTES_EVENTO_OK", { asistentes });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_ASISTENTES_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function obtenerLibrosEvento(req: Request, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const id_evento = Number(req.params.id);
		if (Number.isNaN(id_evento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		conexion = new ConexionEventos();
		const libros = await conexion.obtenerLibrosEvento(id_evento);
		return respuestaOk(res, 200, "LIBROS_EVENTO_OK", { libros });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_LIBROS_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function obtenerComentariosEvento(req: Request, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const id_evento = Number(req.params.id);
		if (Number.isNaN(id_evento)) return respuestaError(res, 400, "ID_EVENTO_INVALIDO");
		conexion = new ConexionEventos();
		const comentarios = await conexion.obtenerComentariosEvento(id_evento);
		return respuestaOk(res, 200, "COMENTARIOS_EVENTO_OK", comentarios);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_COMENTARIOS_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function obtenerEventos(req: Request, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const tipo = (req.query.tipo as string) || "proximos";
		const pagina = Number(req.query.pagina) || 1;
		const limit = Number(req.query.limit) || 2;
		const busqueda = (req.query.busqueda as string) || "";

		if (tipo !== "proximos" && tipo !== "pasados") {
			return respuestaError(res, 400, "TIPO_EVENTO_INVALIDO");
		}

		conexion = new ConexionEventos();
		const eventos = await conexion.obtenerEventos(tipo as "proximos" | "pasados", pagina, limit, busqueda);

		if (!eventos || eventos.length === 0) {
			return respuestaOk(res, 200, "NO_ENCONTRADOS_EVENTOS", []);
		}
		return respuestaOk(res, 200, "EVENTOS_OBTENIDOS_OK", eventos);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_EVENTOS", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function obtenerTotalEventos(req: Request, res: Response) {
	let conexion: ConexionEventos | null = null;
	try {
		const tipo = (req.query.tipo as string) || "proximos";
		const busqueda = (req.query.busqueda as string) || "";

		if (tipo !== "proximos" && tipo !== "pasados") {
			return respuestaError(res, 400, "TIPO_EVENTO_INVALIDO");
		}

		conexion = new ConexionEventos();
		const total = await conexion.obtenerTotalEventos(tipo as "proximos" | "pasados", busqueda);

		return respuestaOk(res, 200, "TOTAL_EVENTOS_OBTENIDO_OK", { total });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_TOTAL_EVENTOS", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
