import { Request, Response } from 'express';
import { ConexionBD } from '../Services/conexionBD.service.js';
import { respuestaError, respuestaOk } from '../Utils/validationMessages.utils.js';

// ================= MÉTODOS: LIBROS EN LISTA =================
export async function obtenerLibrosDeLista(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return respuestaError(res, 400, 'ID_LISTA_INVALIDO');
    }
    conexion = new ConexionBD();
    const libros = await conexion.obtenerLibrosDeListaResumen(id);
    return respuestaOk(res, 200, 'LIBROS_LISTA_OK', libros, { incluirMensaje: false });
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LIBROS_LISTA', (error as Error).message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function agregarLibroALista(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const id_lista = Number(req.params.id);
    const id_libro = Number(req.body.id_libro);
    if (isNaN(id_lista) || isNaN(id_libro)) {
      return respuestaError(res, 400, 'ID_INVALIDO');
    }
    conexion = new ConexionBD();
    const result = await conexion.insertarRegistro('lista_contenido', { id_lista, id_libro });
    if (!result.exito) {
      return respuestaError(res, 500, 'ERROR_AGREGAR_LIBRO_LISTA', result.mensaje);
    }
    return respuestaOk(
      res,
      201,
      'LIBRO_AGREGADO_LISTA_OK',
      { id_lista, id_libro },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_AGREGAR_LIBRO_LISTA', (error as Error).message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function eliminarLibroDeLista(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const id_lista = Number(req.params.id);
    const id_libro = Number(req.params.libroId);
    if (isNaN(id_lista) || isNaN(id_libro)) {
      return respuestaError(res, 400, 'ID_INVALIDO');
    }
    conexion = new ConexionBD();
    const result = await conexion.borrarRegistro('lista_contenido', { id_lista, id_libro });
    if (!result.exito || result.datos === 0) {
      return respuestaError(res, 404, 'LIBRO_NO_ENCONTRADO_EN_LISTA');
    }
    return respuestaOk(
      res,
      200,
      'LIBRO_ELIMINADO_LISTA_OK',
      { id_lista, id_libro },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_ELIMINAR_LIBRO_LISTA', (error as Error).message);
  } finally {
    if (conexion) await conexion.close();
  }
}
