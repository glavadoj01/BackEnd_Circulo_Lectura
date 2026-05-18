import { Request, Response } from 'express';
import { ConexionBD } from '../services/conexionBD.service.js';
import { respuestaOk, respuestaError } from '../utils/validationMessages.utils.js';

export async function obtenerAutores(_req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    conexion = new ConexionBD();
    const result = await conexion.listarRegistros(
      'autor',
      {},
      'nombre_autor ASC, apellido_autor ASC',
      0,
      'id_autor, nombre_autor, apellido_autor',
    );
    if (!result.exito) return respuestaError(res, 500, 'ERROR_OBTENER_AUTORES', result.mensaje);
    return respuestaOk(res, 200, 'AUTORES_OBTENIDOS_OK', result.datos);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_AUTORES', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}
