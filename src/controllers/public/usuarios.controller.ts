import { Request, Response } from 'express';
import { ConexionBD } from '../../services/conexionBD.service.js';
import { respuestaError, respuestaOk } from '../../utils/validationMessages.utils.js';

export async function obtenerNombreUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    conexionAbierta = new ConexionBD();
    const datos = await conexionAbierta.listarRegistros(
      'usuario',
      { id_usuario: id },
      '',
      1,
      'nombre_usuario',
    );
    if (!datos.datos || datos.datos.length === 0) {
      return respuestaError(res, 404, 'NO_ENCONTRADO_USUARIO');
    }
    return respuestaOk(res, 200, 'USUARIO_NOMBRE_OBTENIDO_OK', {
      nombre_usuario: datos.datos[0].nombre_usuario,
    });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_USUARIO_NOMBRE', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}
