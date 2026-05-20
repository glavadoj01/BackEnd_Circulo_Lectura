import { Request, Response, NextFunction } from 'express';
import { respuestaError } from './validationMessages.utils.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return respuestaError(res, 401, 'ERROR_USUARIO_NO_AUTENTICADO');
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.esAdministrador) {
    return respuestaError(res, 403, 'ERROR_USUARIO_NO_AUTORIZADO');
  }
  next();
}
