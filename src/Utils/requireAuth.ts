import { Response, NextFunction } from "express";
import { respuestaError } from "./validationMessages.utils.js";
import { AuthRequest } from "../interfaces/modelosApp/modelosApp.js";

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
	if (!req.user) {
		return respuestaError(res, 401, "ERROR_USUARIO_NO_AUTENTICADO");
	}
	next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
	if (req.user?.usuario?.esAdministrador !== 2) {
		return respuestaError(res, 403, "ERROR_USUARIO_NO_AUTORIZADO");
	}
	next();
}
