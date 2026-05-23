import { ConexionBD } from "../../services/conexionBD.service.js";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";

export async function resetearAPI(_req: any, res: any) {
	let conexionAbierta = null as ConexionBD | null;
	try {
		conexionAbierta = new ConexionBD();
		const resultado = await conexionAbierta.resetearApi();
		if (resultado.exito) {
			return respuestaOk(res, 200, "API_RESETEADA_OK");
		} else {
			return respuestaError(res, 500, "ERROR_RESETEAR_API", resultado.mensaje);
		}
	} catch (error) {
		console.error("Error al resetear la API:", error);
		return respuestaError(res, 500, "ERROR_RESETEAR_API", (error as Error).message);
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}
