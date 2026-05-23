import { Response } from "express";
import type { AuthRequest } from "../interfaces/modelosApp/modelosApp.js";
import { respuestaError } from "./validationMessages.utils.js";

export function getSesionID(req: AuthRequest): number | null {
	return req?.user?.sesion?.id_usuario ?? null;
}

export function getRolUsuario(req: AuthRequest): number {
	const r = req?.user?.usuario?.esAdministrador;
	return typeof r === "number" ? r : Number(r) || 0;
}

export function asegurarRol(req: AuthRequest, res: Response, minRole = 1): boolean {
	const role = getRolUsuario(req);
	if (role >= minRole) return true;
	respuestaError(res, 403, "ERROR_USUARIO_NO_AUTORIZADO");
	return false;
}

export function asegurarPropietarioAdmin(req: AuthRequest, res: Response, ownerId: number, minRole = 1): boolean {
	const sessionId = getSesionID(req);
	if (sessionId === ownerId) return true;
	return asegurarRol(req, res, minRole);
}
