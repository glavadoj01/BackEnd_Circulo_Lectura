import { Request, Response } from 'express';
import { respuestaError, respuestaOk } from '../Utils/validationMessages.utils.js';
import { ConexionListas } from '../Services/conexionListas.service.js';

// ================= MÉTODOS: LIBROS EN LISTA =================
export async function obtenerLibrosDeLista(req: Request, res: Response) {
  let conexion: ConexionListas | null = null;
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_LISTA_INVALIDO');
    }
    conexion = new ConexionListas();
    const libros = await conexion.obtenerLibrosDeListaResumen(id);
    return respuestaOk(res, 200, 'LIBROS_LISTA_OK', libros);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LIBROS_LISTA', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function agregarLibroALista(req: Request, res: Response) {
  let conexion: ConexionListas | null = null;
  try {
    const id_lista = Number(req.params.id);
    const id_libro = Number(req.body.id_libro);
    if (Number.isNaN(id_lista) || Number.isNaN(id_libro)) {
      return respuestaError(
        res,
        400,
        'DATOS_INVALIDOS',
        'ID de lista o libro no es un número válido',
      );
    }
    conexion = new ConexionListas();
    const result = await conexion.insertarRegistro('lista_contenido', { id_lista, id_libro });
    if (!result.exito) {
      return respuestaError(res, 500, 'ERROR_AGREGAR_LIBRO_LISTA', result.mensaje);
    }
    return respuestaOk(res, 201, 'LIBRO_AGREGADO_LISTA_OK', { id_lista, id_libro });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_AGREGAR_LIBRO_LISTA', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function eliminarLibroDeLista(req: Request, res: Response) {
  let conexion: ConexionListas | null = null;
  try {
    const id_lista = Number(req.params.id);
    const id_libro = Number(req.params.libroId);
    if (Number.isNaN(id_lista) || Number.isNaN(id_libro)) {
      return respuestaError(
        res,
        400,
        'DATOS_INVALIDOS',
        'ID de lista o libro no es un número válido',
      );
    }
    conexion = new ConexionListas();
    const result = await conexion.borrarRegistro('lista_contenido', { id_lista, id_libro });
    if (!result.exito || result.datos === 0) {
      return respuestaError(
        res,
        404,
        'ERROR_BORRAR_LIBRO_LISTA',
        'Libro no encontrado en la lista',
      );
    }
    return respuestaOk(res, 200, 'LIBRO_ELIMINADO_LISTA_OK', { id_lista, id_libro });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_BORRAR_LIBRO_LISTA', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}
