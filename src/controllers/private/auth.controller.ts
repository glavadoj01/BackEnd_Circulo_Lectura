import { Request, Response } from "express";
import { LoginService } from "../../services/login.service.js";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";

export async function loginAction(req: Request, res: Response) {
	const { email, password } = req.body;

	if (!email || !password) {
		return respuestaError(res, 400, "CAMPOS_OBLIGATORIOS");
	}

	try {
		const loginService = new LoginService();
		const result = await loginService.login(email, password);

		if (!result.ok) {
			if (result.error === "CREDENCIALES_EMAIL") {
				return respuestaError(res, 401, "ERROR_LOGIN_EMAIL_INVALIDO");
			}
			if (result.error === "CREDENCIALES_PASSWORD") {
				return respuestaError(res, 401, "ERROR_LOGIN_PASSWORD_INVALIDA");
			}
			return respuestaError(res, 500, "ERROR_INTERNO");
		}
		if (!result.esAdministrador) {
			return respuestaOk(res, 200, "LOGIN_EXITOSO", {
				token: result.token,
				id_usuario: result.id_usuario,
			});
		} else {
			return respuestaOk(res, 200, "LOGIN_EXITOSO_ADMIN", {
				token: result.token,
				id_usuario: result.id_usuario,
				esAdministrador: result.esAdministrador,
			});
		}
	} catch (error) {
		console.error("[CTRL]Error en loginAction:", error);
		return respuestaError(res, 500, "ERROR_INTERNO");
	}
}

export async function logoutAction(req: Request, res: Response) {
	const auth = req.header("Authorization");
	if (!auth?.startsWith("Bearer ")) {
		return respuestaError(res, 400, "ERROR_LOGIN_TOKEN_FALTANTE");
	}
	const token = auth.substring("Bearer ".length).trim();
	const conexion = new LoginService();
	try {
		await conexion.cerrarSesion(token);
		return respuestaOk(res, 200, "LOGOUT_EXITOSO");
	} finally {
		await conexion.close();
	}
}
