import { Request, Response, NextFunction } from 'express';
import { ConexionBD } from '../services/conexionBD.service.js';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers['authorization'];

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ error: 'TOKEN_REQUERIDO' });
    }

    const conexion = new ConexionBD();
    const [rows]: any = await conexion.listarRegistros(
      'sesiones',
      {
        token: token,
        expira: { operador: '>', valor: new Date() },
      },
      '',
      1,
      '*',
    );

    if (!rows.exito || !rows.datos || rows.datos.length === 0) {
      return res.status(401).json({ error: 'TOKEN_INVALIDO' });
    }

    next();
  } catch (error) {
    console.error('[AUTH] Error en authMiddleware:', error);
    return res.status(500).json({ error: 'ERROR_INTERNO' });
  }
}
