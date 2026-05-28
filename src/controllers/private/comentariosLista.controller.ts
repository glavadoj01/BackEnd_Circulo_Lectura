import { Response } from "express";
import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";
import { ConexionListas } from "../../services/conexionListas.service.js";
import { asegurarPropietarioAdmin, getSesionID } from "../../utils/authorization.utils.js";
import { parsePositiveInt } from "../../utils/validation.utils.js";

const sanitizarTexto = (valor: unknown, max = 2500): string => {
	if (typeof valor !== "string") return "";
	return valor.replace(/\s+/g, " ").trim().slice(0, max);
};

const sanitizarCalificacion = (valor: unknown): number | null => {
	if (valor === undefined || valor === null || valor === "") return null;
	const numero = Number(valor);
	if (!Number.isFinite(numero)) return null;
	return Math.trunc(numero);
};

// ================= MÉTODOS: COMENTARIOS DE LISTA =================
export async function crearComentarioLista(req: AuthRequest, res: Response) {
	let conexion: ConexionListas | null = null;
	try {
		const id_lista = parsePositiveInt(req.params.id);
		const idUsuarioParam = parsePositiveInt(req.params.usuarioId);
		const { titulo_comentario, texto_comentario, id_com_respuesta, calificacion_comentario } = req.body;
		const id_usuario = getSesionID(req);
		const textoLimpio = sanitizarTexto(texto_comentario, 2500);
		const tituloLimpio = sanitizarTexto(titulo_comentario, 100);
		const calificacionLimpia = sanitizarCalificacion(calificacion_comentario);
		const idComentarioRespuesta =
			id_com_respuesta !== undefined && id_com_respuesta !== null ? parsePositiveInt(id_com_respuesta) : null;
		const tieneTexto = textoLimpio.length >= 1;
		const tieneCalif = calificacionLimpia !== null;
		if (
			Number.isNaN(id_lista) ||
			id_usuario === null ||
			Number.isNaN(idUsuarioParam) ||
			idUsuarioParam !== id_usuario ||
			(!tieneTexto && !tieneCalif) ||
			(tieneCalif && (calificacionLimpia < 0 || calificacionLimpia > 5)) ||
			(idComentarioRespuesta !== null && Number.isNaN(idComentarioRespuesta))
		) {
			return respuestaError(res, 400, "DATOS_INVALIDOS");
		}
		conexion = new ConexionListas();
		const datos: any = { id_lista, id_usuario };
		datos.texto_comentario = textoLimpio;
		if (tituloLimpio.length > 0) datos.titulo_comentario = tituloLimpio;
		if (idComentarioRespuesta !== null) datos.id_com_respuesta = idComentarioRespuesta;
		if (tieneCalif) datos.calificacion_comentario = calificacionLimpia;
		const result = await conexion.insertarRegistro("lista_comentario", datos);
		if (!result.exito) {
			return respuestaError(res, 500, "ERROR_CREAR_COMENTARIO_LISTA", result.mensaje);
		}

		if (tieneCalif && Number(result.datos) > 0) {
			const limpiarCalificaciones = await conexion.actualizarRegistro(
				"lista_comentario",
				{ calificacion_comentario: null as any },
				{
					id_lista,
					id_usuario,
					calificacion_comentario: { operador: "IS NOT NULL", valor: null as any },
					id_listaComentario: { operador: "<>", valor: Number(result.datos) },
				},
			);
			if (!limpiarCalificaciones.exito) {
				await conexion.borrarRegistro("lista_comentario", { id_listaComentario: Number(result.datos) });
				return respuestaError(res, 500, "ERROR_CREAR_COMENTARIO_LISTA", limpiarCalificaciones.mensaje);
			}
		}
		return respuestaOk(res, 201, "COMENTARIO_LISTA_CREADO_OK", {
			id_lista,
			id_usuario,
			titulo_comentario: tituloLimpio || null,
			texto_comentario: textoLimpio,
			calificacion_comentario: tieneCalif ? calificacionLimpia : null,
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
		const { titulo_comentario, texto_comentario, calificacion_comentario } = req.body;

		const calificacion = calificacion_comentario !== undefined ? Number(calificacion_comentario) : undefined;

		if (
			Number.isNaN(id_listaComentario) ||
			typeof texto_comentario !== "string" ||
			texto_comentario.trim().length < 1 ||
			(titulo_comentario !== undefined && typeof titulo_comentario !== "string") ||
			(calificacion !== undefined && (!calificacion || calificacion < 0 || calificacion > 5))
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
		if (calificacion !== undefined) datos.calificacion_comentario = calificacion;
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
			calificacion_comentario: calificacion,
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
		const id_usuarioCrd = parsePositiveInt(req.params.usuarioId);
		console.log("[BorrarComentarioLista] ID comentario:", id_listaComentario, "ID usuario:", id_usuarioCrd);
		if (Number.isNaN(id_listaComentario)) {
			return respuestaError(res, 400, "ID_COMENTARIO_INVALIDO");
		}
		if (!id_usuarioCrd) {
			return respuestaError(res, 400, "ID_USUARIO_INVALIDO");
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
		console.log("[BorrarComentarioLista] Comentario encontrado:", comentario);
		if (!comentario) return respuestaError(res, 404, "NO_ENCONTRADO_COMENTARIO");
		if (!asegurarPropietarioAdmin(req, res, Number(comentario.id_usuario), 1)) return null;
		const result = await conexion.borrarRegistro("lista_comentario", { id_listaComentario });
		if (!result.exito || result.datos.affectedRows === 0) {
			return respuestaError(res, 404, "ERROR_OBTENER_COMENTARIOS_LISTA", result.mensaje);
		}
		console.log("[BorrarComentarioLista] Resultado eliminación:", result);
		return respuestaOk(res, 200, "COMENTARIO_LISTA_BORRADO_OK", id_listaComentario);
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_BORRAR_COMENTARIO_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
