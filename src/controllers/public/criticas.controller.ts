import { Request, Response } from "express";
import { LibroCritica } from "../../interfaces/modelosBD/modelosBD.js";
import { ConexionBD } from "../../services/conexionBD.service.js";
import { parsePositiveInt } from "../../utils/validation.utils.js";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";

/**
 * Obtener críticas de un libro.
 * @param req Objeto de solicitud de Express, con el id_libro en req.params.id.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con las críticas y frecuencias, o un error si ocurrió algún problema.
 */
export async function obtenerCriticasLibro(req: Request, res: Response) {
	let conexionAbierta: ConexionBD | null = null;
	try {
		const idLibro = parsePositiveInt(req.params.id);
		if (Number.isNaN(idLibro)) {
			return respuestaError(res, 400, "ID_LIBRO_INVALIDO");
		}
		conexionAbierta = new ConexionBD();
		const resultado = await conexionAbierta.listarRegistros("libro_critica", { id_libro: idLibro });
		const criticas: LibroCritica[] = resultado.datos
			.map((critica: any) => ({
				...critica,
				calificacion_comentario: Number(critica.calificacion_comentario),
			}))
			.sort((a: any, b: any) => {
				const fechaA = new Date(a.fecha_comentario).getTime();
				const fechaB = new Date(b.fecha_comentario).getTime();
				return fechaA - fechaB;
			});

		// Calcular frecuencias de notas (calificacion_comentario)
		const maxNota = 5;
		const frecuencias: number[] = new Array(maxNota).fill(0);
		for (const critica of criticas) {
			const nota = Number(critica.calificacion_comentario);
			if (!Number.isNaN(nota) && nota >= 1 && nota <= maxNota) {
				frecuencias[nota - 1]++;
			}
		}

		return respuestaOk(res, 200, "CRITICAS_OBTENIDAS_OK", { criticas, frecuencias });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_OBTENER_CRITICAS", error.message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}
