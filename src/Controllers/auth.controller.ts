import { Request, Response } from 'express';
import { LoginService } from '../services/login.service.js';
import { respuestaError, respuestaOk } from '../utils/validationMessages.utils.js';

export async function loginAction(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return respuestaError(res, 400, 'CAMPOS_OBLIGATORIOS');
  }

  try {
    const loginService = new LoginService();
    const result = await loginService.login(email, password);

    if (!result.ok) {
      if (result.error === 'CREDENCIALES_EMAIL') {
        return respuestaError(res, 401, 'ERROR_LOGIN_EMAIL_INVALIDO');
      }
      if (result.error === 'CREDENCIALES_PASSWORD') {
        return respuestaError(res, 401, 'ERROR_LOGIN_PASSWORD_INVALIDA');
      }
      return respuestaError(res, 500, 'ERROR_INTERNO');
    }

    return respuestaOk(res, 200, 'LOGIN_EXITOSO', {
      token: result.token,
      id_usuario: result.id_usuario,
    });
  } catch (error) {
    console.error('[CTRL]Error en loginAction:', error);
    return respuestaError(res, 500, 'ERROR_INTERNO');
  }
}
