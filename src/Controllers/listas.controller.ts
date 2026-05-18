import { Request, Response } from 'express';
import { ConexionBD } from '../services/conexionBD.service.js';
import { ListaBD } from '../interfaces/modelosBD/modelosBD.js';
import { respuestaOk, respuestaError } from '../utils/validationMessages.utils.js';
import { ConexionListas } from '../services/conexionListas.service.js';

// Crear una nueva lista
export async function crearLista(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const datos: Partial<ListaBD> = req.body.lista ? req.body.lista : req.body;
    if (
      !datos.nombre_lista ||
      typeof datos.nombre_lista !== 'string' ||
      datos.nombre_lista.trim().length < 2
    ) {
      return respuestaError(res, 400, 'CAMPOS_OBLIGATORIOS');
    }
    conexion = new ConexionBD();
    const insertId = (await conexion.insertarRegistro('lista', datos)).datos.insertId;
    return respuestaOk(res, 201, 'LISTA_CREADA_OK', { data: { id_lista: insertId, ...datos } });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_CREAR_LISTA', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

// Obtener listas con/sin filtros y paginación
export async function obtenerListas(req: Request, res: Response) {
  let conexion: ConexionListas | null = null;
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Math.min(Number(req.query.limit), 50) : 20;
    if (Number.isNaN(page) || page < 1 || Number.isNaN(limit) || limit < 1) {
      return respuestaError(
        res,
        400,
        'PARAMETROS_PAGINACION_INVALIDOS',
        'Page y limit deben ser números enteros positivos',
      );
    }
    conexion = new ConexionListas();
    const listas = await conexion.obtenerCatalogoListas(page, limit);
    return respuestaOk(res, 200, 'LISTAS_OBTENIDAS_OK', listas);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LISTAS', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

/**
 * Obtener el total de listas.
 * @param _req Objeto de solicitud de Express (no se usa).
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON con el total de listas en la base de datos.
 */
export async function obtenerListasTotal(_req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    conexion = new ConexionBD();
    const total = (await conexion.listarRegistros('lista', {}, '', 0, 'COUNT(*) AS total')).datos;
    const totalListas = total[0]?.total ?? 0;
    return respuestaOk(res, 200, 'TOTAL_LISTAS_OBTENIDO_OK', { total: totalListas });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_TOTAL_LISTAS', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

// Obtener una lista por ID
export async function obtenerListaId(req: Request, res: Response) {
  let conexion: ConexionListas | null = null;
  try {
    const id = Number(req.query.id ?? req.params.id);
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_LISTA_INVALIDO');
    }
    conexion = new ConexionListas();
    const lista = await conexion.obtenerListaConCreadorPorId(id);
    if (!lista) {
      return respuestaError(res, 404, 'ERROR_OBTENER_LISTA', 'Lista no encontrada');
    }
    // Obtener los libros asociados en formato resumen
    const librosResumen = await conexion.obtenerLibrosDeListaResumen(id);
    return respuestaOk(res, 200, 'LISTA_OBTENIDA_OK', { ...lista, libros: librosResumen });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LISTA', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

// Actualizar una lista
export async function actualizarLista(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const id = Number(req.params.id ?? req.body.id_lista);
    const datos: Partial<ListaBD> =
      typeof req.body.lista === 'object' && req.body.lista !== null ? req.body.lista : req.body;
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_LISTA_INVALIDO');
    }
    conexion = new ConexionBD();
    const afectados = (await conexion.actualizarRegistro('lista', datos, { id_lista: id })).datos
      .affectedRows;
    if (afectados === 0) {
      return respuestaError(res, 404, 'ERROR_ACTUALIZAR_LISTA', 'Lista no encontrada');
    }
    return respuestaOk(res, 200, 'LISTA_ACTUALIZADA_OK', { actualizado: true, afectados });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_ACTUALIZAR_LISTA', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

// Borrar una lista
export async function borrarLista(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const id = Number(req.params.id ?? req.body.id_lista);
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_LISTA_INVALIDO');
    }
    conexion = new ConexionBD();
    const afectados = (await conexion.borrarRegistro('lista', { id_lista: id })).datos.affectedRows;
    if (afectados === 0) {
      return respuestaError(res, 404, 'ERROR_BORRAR_LISTA', 'Lista no encontrada');
    }
    return respuestaOk(res, 200, 'LISTA_BORRADA_OK', { borrado: true, afectados });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_BORRAR_LISTA', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}
