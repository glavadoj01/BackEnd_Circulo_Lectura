import { Response } from "express";
import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { ConexionBD } from "../../services/conexionBD.service.js";
import { getSesionID } from "../../utils/authorization.utils.js";
import { parsePositiveInt } from "../../utils/validation.utils.js";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";

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

export async function crearComentarioEvento(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const id_evento = parsePositiveInt(req.params.id);
		const id_usuario = getSesionID(req);
		const idUsuarioParam = parsePositiveInt(req.params.usuarioId);
		const { texto_comentario, calificacion_comentario, id_com_respuesta } = req.body;
		const textoLimpio = sanitizarTexto(texto_comentario, 2500);
		const calificacionLimpia = sanitizarCalificacion(calificacion_comentario);
		const idComentarioRespuesta =
			id_com_respuesta !== undefined && id_com_respuesta !== null ? parsePositiveInt(id_com_respuesta) : null;

		const tieneTexto = textoLimpio.length >= 1;
		const tieneCalificacion = calificacionLimpia !== null;

		if (
			Number.isNaN(id_evento) ||
			id_usuario === null ||
			Number.isNaN(idUsuarioParam) ||
			idUsuarioParam !== id_usuario ||
			!tieneTexto ||
			(tieneCalificacion && (calificacionLimpia < 0 || calificacionLimpia > 5)) ||
			(idComentarioRespuesta !== null && Number.isNaN(idComentarioRespuesta))
		) {
			return respuestaError(res, 400, "DATOS_INVALIDOS");
		}

		const datos: Record<string, string | number> = {
			id_evento,
			id_usuario,
			texto_comentario: textoLimpio,
		};
		if (tieneCalificacion) datos.calificacion_comentario = calificacionLimpia;
		if (idComentarioRespuesta !== null) {
			datos.id_com_respuesta = idComentarioRespuesta;
		}

		conexion = new ConexionBD();
		const resultado = await conexion.insertarRegistro("evento_comentario", datos);
		if (!resultado.exito) {
			return respuestaError(res, 500, "ERROR_CREAR_COMENTARIO_EVENTO", resultado.mensaje);
		}

		if (tieneCalificacion && Number(resultado.datos) > 0) {
			const limpiarCalificaciones = await conexion.actualizarRegistro(
				"evento_comentario",
				{ calificacion_comentario: null as any },
				{
					id_evento,
					id_usuario,
					calificacion_comentario: { operador: "IS NOT NULL", valor: null as any },
					id_eventoComentario: { operador: "<>", valor: Number(resultado.datos) },
				},
			);
			if (!limpiarCalificaciones.exito) {
				await conexion.borrarRegistro("evento_comentario", { id_eventoComentario: Number(resultado.datos) });
				return respuestaError(res, 500, "ERROR_CREAR_COMENTARIO_EVENTO", limpiarCalificaciones.mensaje);
			}
		}

		return respuestaOk(res, 201, "COMENTARIO_EVENTO_CREADO_OK", {
			id_eventoComentario: resultado.datos,
			id_evento,
			id_usuario,
			texto_comentario: datos.texto_comentario,
			calificacion_comentario: tieneCalificacion ? calificacionLimpia : null,
			id_com_respuesta: datos.id_com_respuesta ?? null,
		});
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_CREAR_COMENTARIO_EVENTO", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
