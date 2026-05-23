import { Router } from "express";
import { respuestaError } from "../utils/validationMessages.utils.js";

const rutaDefault = Router();
// Redirección/Respuesta de rutas no definidas
rutaDefault.use((_req, res) => {
	respuestaError(res, 404, "RUTA_NO_ENCONTRADA");
});

export default rutaDefault;
