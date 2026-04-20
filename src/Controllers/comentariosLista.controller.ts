import { Request, Response } from 'express';
import { ConexionBD } from '../Services/conexionBD.service.js';
import { respuestaError, respuestaOk } from '../Utils/validationMessages.utils.js';

// ================= MÉTODOS: COMENTARIOS DE LISTA =================
export async function obtenerComentariosLista(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const id_lista = Number(req.params.id);
    if (isNaN(id_lista)) {
      return respuestaError(res, 400, 'ID_LISTA_INVALIDO');
    }
    conexion = new ConexionBD();
    const comentarios = await conexion.obtenerComentariosDeLista(id_lista);
    return respuestaOk(res, 200, 'COMENTARIOS_LISTA_OK', comentarios, { incluirMensaje: false });
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_OBTENER_COMENTARIOS_LISTA', (error as Error).message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function crearComentarioLista(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const id_lista = Number(req.params.id);
    const { id_usuario, titulo_comentario, texto_comentario, id_com_respuesta } = req.body;
    if (
      isNaN(id_lista) ||
      isNaN(id_usuario) ||
      typeof texto_comentario !== 'string' ||
      texto_comentario.trim().length < 1 ||
      (titulo_comentario !== undefined && typeof titulo_comentario !== 'string')
    ) {
      return respuestaError(res, 400, 'DATOS_INVALIDOS');
    }
    conexion = new ConexionBD();
    const datos: any = { id_lista, id_usuario, texto_comentario };
    if (titulo_comentario !== undefined) datos.titulo_comentario = titulo_comentario;
    if (id_com_respuesta !== undefined) datos.id_com_respuesta = id_com_respuesta;
    const result = await conexion.insertarRegistro('lista_comentario', datos);
    if (!result.exito) {
      return respuestaError(res, 500, 'ERROR_CREAR_COMENTARIO_LISTA', result.mensaje);
    }
    return respuestaOk(
      res,
      201,
      'COMENTARIO_LISTA_CREADO_OK',
      { id_lista, id_usuario, titulo_comentario, texto_comentario },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_CREAR_COMENTARIO_LISTA', (error as Error).message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function actualizarComentarioLista(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const id_listaComentario = Number(req.params.comentarioId);
    const { titulo_comentario, texto_comentario } = req.body;
    if (
      isNaN(id_listaComentario) ||
      typeof texto_comentario !== 'string' ||
      texto_comentario.trim().length < 1 ||
      (titulo_comentario !== undefined && typeof titulo_comentario !== 'string')
    ) {
      return respuestaError(res, 400, 'DATOS_INVALIDOS');
    }
    conexion = new ConexionBD();
    const datos: any = { texto_comentario };
    if (titulo_comentario !== undefined) datos.titulo_comentario = titulo_comentario;
    const result = await conexion.actualizarRegistro(
      'lista_comentario',
      datos,
      { id_listaComentario },
    );
    if (!result.exito || result.datos === 0) {
      return respuestaError(res, 404, 'COMENTARIO_NO_ENCONTRADO');
    }
    return respuestaOk(
      res,
      200,
      'COMENTARIO_LISTA_ACTUALIZADO_OK',
      { id_listaComentario, titulo_comentario, texto_comentario },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_ACTUALIZAR_COMENTARIO_LISTA', (error as Error).message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function borrarComentarioLista(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const id_listaComentario = Number(req.params.comentarioId);
    if (isNaN(id_listaComentario)) {
      return respuestaError(res, 400, 'ID_COMENTARIO_INVALIDO');
    }
    conexion = new ConexionBD();
    const result = await conexion.borrarRegistro('lista_comentario', { id_listaComentario });
    if (!result.exito || result.datos === 0) {
      return respuestaError(res, 404, 'COMENTARIO_NO_ENCONTRADO');
    }
    return respuestaOk(
      res,
      200,
      'COMENTARIO_LISTA_BORRADO_OK',
      { id_listaComentario },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_BORRAR_COMENTARIO_LISTA', (error as Error).message);
  } finally {
    if (conexion) await conexion.close();
  }
}
