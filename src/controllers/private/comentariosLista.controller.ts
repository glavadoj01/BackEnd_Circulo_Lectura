import { Response } from "express";
import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";
import { ConexionListas } from "../../services/conexionListas.service.js";
import { asegurarPropietarioAdmin, getSesionID } from "../../utils/authorization.utils.js";

// ================= MÉTODOS: COMENTARIOS DE LISTA =================
export async function crearComentarioLista(req: AuthRequest, res: Response) {
	let conexion: ConexionListas | null = null;
	try {
		const id_lista = Number(req.params.id);
		const { titulo_comentario, texto_comentario, id_com_respuesta } = req.body;
		const id_usuario = getSesionID(req);
		if (
			Number.isNaN(id_lista) ||
			id_usuario === null ||
			typeof texto_comentario !== "string" ||
			texto_comentario.trim().length < 1 ||
			(titulo_comentario !== undefined && typeof titulo_comentario !== "string")
		) {
			return respuestaError(res, 400, "DATOS_INVALIDOS");
		}
		conexion = new ConexionListas();
		const datos: any = { id_lista, id_usuario, texto_comentario };
		if (titulo_comentario !== undefined) datos.titulo_comentario = titulo_comentario;
		if (id_com_respuesta !== undefined) datos.id_com_respuesta = id_com_respuesta;
		const result = await conexion.insertarRegistro("lista_comentario", datos);
		if (!result.exito) {
			return respuestaError(res, 500, "ERROR_CREAR_COMENTARIO_LISTA", result.mensaje);
		}
		return respuestaOk(res, 201, "COMENTARIO_LISTA_CREADO_OK", {
			id_lista,
			id_usuario,
			titulo_comentario,
			texto_comentario,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_CREAR_COMENTARIO_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function actualizarComentarioLista(req: AuthRequest, res: Response) {
	let conexion: ConexionListas | null = null;
	try {
		const id_listaComentario = Number(req.params.comentarioId);
		const { titulo_comentario, texto_comentario } = req.body;
		if (
			Number.isNaN(id_listaComentario) ||
			typeof texto_comentario !== "string" ||
			texto_comentario.trim().length < 1 ||
			(titulo_comentario !== undefined && typeof titulo_comentario !== "string")
		) {
			return respuestaError(res, 400, "DATOS_INVALIDOS");
		}
		conexion = new ConexionListas();
		const comentarioRows = await conexion.listarRegistros(
			"lista_comentario",
			{ id_listaComentario },
			"",
			1,
			"id_usuario",
		);
		const comentario = comentarioRows.exito && Array.isArray(comentarioRows.datos) ? comentarioRows.datos[0] : null;
		if (!comentario) return respuestaError(res, 404, "NO_ENCONTRADO_COMENTARIO");
		if (!asegurarPropietarioAdmin(req, res, Number(comentario.id_usuario), 1)) return null;
		const datos: any = { texto_comentario };
		if (titulo_comentario !== undefined) datos.titulo_comentario = titulo_comentario;
		const result = await conexion.actualizarRegistro("lista_comentario", datos, {
			id_listaComentario,
		});
		if (!result.exito || result.datos === 0) {
			return respuestaError(res, 404, "ERROR_OBTENER_COMENTARIOS_LISTA", result.mensaje);
		}
		return respuestaOk(res, 200, "COMENTARIO_LISTA_ACTUALIZADO_OK", {
			id_listaComentario,
			titulo_comentario,
			texto_comentario,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_ACTUALIZAR_COMENTARIO_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function borrarComentarioLista(req: AuthRequest, res: Response) {
	let conexion: ConexionListas | null = null;
	try {
		const id_listaComentario = Number(req.params.comentarioId);
		if (Number.isNaN(id_listaComentario)) {
			return respuestaError(res, 400, "ID_COMENTARIO_INVALIDO");
		}
		conexion = new ConexionListas();
		const comentarioRows = await conexion.listarRegistros(
			"lista_comentario",
			{ id_listaComentario },
			"",
			1,
			"id_usuario",
		);
		const comentario = comentarioRows.exito && Array.isArray(comentarioRows.datos) ? comentarioRows.datos[0] : null;
		if (!comentario) return respuestaError(res, 404, "NO_ENCONTRADO_COMENTARIO");
		if (!asegurarPropietarioAdmin(req, res, Number(comentario.id_usuario), 1)) return null;
		const result = await conexion.borrarRegistro("lista_comentario", { id_listaComentario });
		if (!result.exito || result.datos === 0) {
			return respuestaError(res, 404, "ERROR_OBTENER_COMENTARIOS_LISTA", result.mensaje);
		}
		return respuestaOk(res, 200, "COMENTARIO_LISTA_BORRADO_OK", { id_listaComentario });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_BORRAR_COMENTARIO_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
