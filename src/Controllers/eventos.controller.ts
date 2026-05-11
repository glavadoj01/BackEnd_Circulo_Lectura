import { Request, Response } from 'express';
import { ConexionEventos } from '../Services/conexionEventos.service.js';
import { respuestaOk, respuestaError } from '../Utils/validationMessages.utils.js';

export async function obtenerEventoId(req: Request, res: Response) {
  let conexion: ConexionEventos | null = null;
  try {
    const id_evento = Number(req.params.id);
    if (Number.isNaN(id_evento)) return respuestaError(res, 400, 'ID_EVENTO_INVALIDO');
    conexion = new ConexionEventos();
    const evento = await conexion.obtenerEventoPorId(id_evento);
    if (!evento) return respuestaError(res, 404, 'NO_ENCONTRADO_EVENTO');
    return respuestaOk(res, 200, 'EVENTO_OBTENIDO_OK', evento, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_EVENTO', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function obtenerAsistentesEvento(req: Request, res: Response) {
  let conexion: ConexionEventos | null = null;
  try {
    const id_evento = Number(req.params.id);
    if (Number.isNaN(id_evento)) return respuestaError(res, 400, 'ID_EVENTO_INVALIDO');
    conexion = new ConexionEventos();
    const asistentes = await conexion.obtenerAsistentesEvento(id_evento);
    return respuestaOk(res, 200, 'ASISTENTES_EVENTO_OK', asistentes, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_ASISTENTES_EVENTO', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function obtenerLibrosEvento(req: Request, res: Response) {
  let conexion: ConexionEventos | null = null;
  try {
    const id_evento = Number(req.params.id);
    if (Number.isNaN(id_evento)) return respuestaError(res, 400, 'ID_EVENTO_INVALIDO');
    conexion = new ConexionEventos();
    const libros = await conexion.obtenerLibrosEvento(id_evento);
    return respuestaOk(res, 200, 'LIBROS_EVENTO_OK', libros, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LIBROS_EVENTO', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function obtenerComentariosEvento(req: Request, res: Response) {
  let conexion: ConexionEventos | null = null;
  try {
    const id_evento = Number(req.params.id);
    if (Number.isNaN(id_evento)) return respuestaError(res, 400, 'ID_EVENTO_INVALIDO');
    conexion = new ConexionEventos();
    const comentarios = await conexion.obtenerComentariosEvento(id_evento);
    return respuestaOk(res, 200, 'COMENTARIOS_EVENTO_OK', comentarios, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_COMENTARIOS_EVENTO', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}
