import { Request, Response } from 'express';
import { EventoBD } from '../../interfaces/modelosBD/modelosBD.js';
import { ConexionBD } from '../../services/conexionBD.service.js';
import { parsePositiveInt } from '../../utils/validation.utils.js';
import { respuestaOk, respuestaError } from '../../utils/validationMessages.utils.js';

const esFechaValida = (valor: unknown): boolean => {
  if (valor === undefined || valor === null || valor === '') return false;
  const fecha = valor instanceof Date ? valor : new Date(String(valor));
  return !Number.isNaN(fecha.getTime());
};

const construirDatosEvento = (body: any, esActualizacion = false): Partial<EventoBD> => {
  const datos: Partial<EventoBD> = {};

  if (!esActualizacion || body.id_usuarioCrd !== undefined) {
    const idUsuarioCrd = parsePositiveInt(body.id_usuarioCrd);
    if (!Number.isNaN(idUsuarioCrd)) datos.id_usuarioCrd = idUsuarioCrd;
  }

  if (!esActualizacion || body.nombre_evento !== undefined) {
    if (typeof body.nombre_evento === 'string') datos.nombre_evento = body.nombre_evento.trim();
  }

  if (!esActualizacion || body.fecha_evento !== undefined) {
    if (esFechaValida(body.fecha_evento)) {
      datos.fecha_evento = body.fecha_evento;
    }
  }

  if (body.hora_evento !== undefined) {
    datos.hora_evento = String(body.hora_evento).trim();
  }

  if (body.direccion_evento !== undefined) {
    datos.direccion_evento = String(body.direccion_evento).trim();
  }

  if (!esActualizacion || body.descripcion_evento !== undefined) {
    if (typeof body.descripcion_evento === 'string') {
      datos.descripcion_evento = body.descripcion_evento.trim();
    }
  }

  return datos;
};

const validarEvento = (evento: Partial<EventoBD>, esActualizacion = false): boolean => {
  if (!evento || typeof evento !== 'object') return false;

  if (!esActualizacion) {
    if (
      Number.isNaN(parsePositiveInt(evento.id_usuarioCrd)) ||
      typeof evento.nombre_evento !== 'string' ||
      evento.nombre_evento.trim().length < 2 ||
      !esFechaValida(evento.fecha_evento) ||
      typeof evento.descripcion_evento !== 'string' ||
      evento.descripcion_evento.trim().length < 2
    ) {
      return false;
    }
  }

  if (evento.nombre_evento !== undefined && evento.nombre_evento.trim().length < 2) return false;
  if (evento.fecha_evento !== undefined && !esFechaValida(evento.fecha_evento)) return false;
  if (
    evento.descripcion_evento !== undefined &&
    typeof evento.descripcion_evento === 'string' &&
    evento.descripcion_evento.trim().length < 2
  ) {
    return false;
  }

  return true;
};

export async function crearEvento(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const body =
      req.body.evento && typeof req.body.evento === 'object' ? req.body.evento : req.body;
    const datos = construirDatosEvento(body);
    if (!validarEvento(datos)) {
      return respuestaError(res, 400, 'CAMPOS_OBLIGATORIOS');
    }

    conexion = new ConexionBD();
    const resultado = await conexion.insertarRegistro('evento', datos as Record<string, any>);

    return respuestaOk(res, 201, 'EVENTO_CREADO_OK', {
      id_evento: resultado.datos.insertId,
      ...datos,
    });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_CREAR_EVENTO', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function actualizarEvento(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
    if (Number.isNaN(idEvento)) {
      return respuestaError(res, 400, 'ID_EVENTO_INVALIDO');
    }

    const body =
      req.body.evento && typeof req.body.evento === 'object' ? req.body.evento : req.body;
    const datos = construirDatosEvento(body, true);
    if (Object.keys(datos).length === 0 || !validarEvento(datos, true)) {
      return respuestaError(res, 400, 'NO_HAY_CAMPOS_ACTUALIZAR');
    }

    conexion = new ConexionBD();
    const resultado = await conexion.actualizarRegistro('evento', datos as Record<string, any>, {
      id_evento: idEvento,
    });

    if (resultado.datos.affectedRows === 0) {
      return respuestaError(res, 404, 'NO_ENCONTRADO_EVENTO');
    }

    return respuestaOk(res, 200, 'EVENTO_ACTUALIZADO_OK', {
      actualizado: true,
      afectados: resultado.datos.affectedRows,
    });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_ACTUALIZAR_EVENTO', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}

export async function borrarEvento(req: Request, res: Response) {
  let conexion: ConexionBD | null = null;
  try {
    const idEvento = parsePositiveInt(req.params.id ?? req.body.id_evento);
    if (Number.isNaN(idEvento)) {
      return respuestaError(res, 400, 'ID_EVENTO_INVALIDO');
    }

    conexion = new ConexionBD();
    const resultado = await conexion.borrarRegistro('evento', { id_evento: idEvento });

    if (resultado.datos.affectedRows === 0) {
      return respuestaError(res, 404, 'NO_ENCONTRADO_EVENTO');
    }

    return respuestaOk(res, 200, 'EVENTO_BORRADO_OK', {
      borrado: true,
      afectados: resultado.datos.affectedRows,
    });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_BORRAR_EVENTO', error.message);
  } finally {
    if (conexion) await conexion.close();
  }
}
