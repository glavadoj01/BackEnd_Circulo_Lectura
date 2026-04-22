import { Request, Response } from 'express';
import { ConexionBD } from '../Services/conexionBD.service.js';
import { respuestaOk, respuestaError } from '../Utils/validationMessages.utils.js';

export async function obtenerGeneros(_req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    conexion = new ConexionBD();
    const result = await conexion.listarRegistros(
      'genero',
      {},
      'nombre_genero ASC',
      0,
      'id_genero, nombre_genero',
    );
    if (!result.exito) return respuestaError(res, 500, 'ERROR_OBTENER_GENEROS', result.mensaje);
    return respuestaOk(res, 200, 'GENEROS_OBTENIDOS_OK', result.datos);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_GENEROS', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}
