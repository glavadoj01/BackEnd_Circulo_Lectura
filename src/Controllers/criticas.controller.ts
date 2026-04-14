import { Request, Response } from 'express';
import { LibroCritica } from '../Interfaces/modelosBD/modelosBD.js';
import { ConexionBD } from '../Services/conexionBD.service.js';
import { parseCalificacion, parsePositiveInt } from '../Utils/validation.utils.js';
import { respuestaError, respuestaOk } from '../Utils/validationMessages.utils.js';

/**
 * Valida los datos de una crítica.
 * @param critica Objeto crítica a validar.
 * @param esActualizacion Si es true, permite campos opcionales.
 * @returns {boolean} true si es válido, false si no.
 */
function validarCritica(critica: any, esActualizacion = false): boolean {
  if (!critica || typeof critica !== 'object') return false;
  if (!esActualizacion) {
    if (
      isNaN(parsePositiveInt(critica.id_libro)) ||
      isNaN(parsePositiveInt(critica.id_usuario)) ||
      isNaN(parseCalificacion(critica.calificacion_libro))
    ) {
      return false;
    }
  }
  if (critica.titulo_critica !== undefined && typeof critica.titulo_critica !== 'string')
    return false;
  if (critica.texto_critica !== undefined && typeof critica.texto_critica !== 'string')
    return false;
  if (
    critica.calificacion_libro !== undefined &&
    (isNaN(parseCalificacion(critica.calificacion_libro)) ||
      parseCalificacion(critica.calificacion_libro) < 1 ||
      parseCalificacion(critica.calificacion_libro) > 5)
  )
    return false;
  return true;
}

/**
 * Construye el objeto de datos para la BD a partir del body.
 * @param body Body de la request.
 * @param esActualizacion Si es true, solo incluye campos presentes.
 * @returns Objeto listo para la BD.
 */
function construirDatosCritica(body: any, esActualizacion = false): Partial<LibroCritica> {
  const datos: Partial<LibroCritica> = {};
  if (!esActualizacion || body.id_libro !== undefined) {
    datos.id_libro = parsePositiveInt(body.id_libro);
  }
  if (!esActualizacion || body.id_usuario !== undefined) {
    datos.id_usuario = parsePositiveInt(body.id_usuario);
  }
  if (body.titulo_critica !== undefined) {
    datos.titulo_critica = String(body.titulo_critica);
  }
  if (body.texto_critica !== undefined) {
    datos.texto_critica = String(body.texto_critica);
  }
  if (body.calificacion_libro !== undefined) {
    datos.calificacion_libro = parseCalificacion(body.calificacion_libro);
  }
  return datos;
}

/**
 * Crear nueva crítica para un libro.
 * @param req Objeto de solicitud de Express, con los datos de la crítica en req.body.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con la crítica creada o un error si ocurrió algún problema.
 */
async function crearCritica(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const datos = construirDatosCritica(req.body);
    if (!validarCritica(datos)) {
      return respuestaError(res, 400, 'CAMPOS_OBLIGATORIOS');
    }
    conexionAbierta = new ConexionBD();
    const resultado = await conexionAbierta.insertarRegistro('libro_critica', datos, false);
    if (resultado.datos.affectedRows > 0 || resultado.datos.insertId) {
      return respuestaOk(
        res,
        201,
        'CRITICA_CREADA_OK',
        { critica: { id_libro: datos.id_libro, id_usuario: datos.id_usuario } },
        { incluirMensaje: false },
      );
    } else {
      return respuestaError(res, 500, 'ERROR_CREAR_CRITICA');
    }
  } catch (error: any) {
    return respuestaError(res, 500, error.message || 'ERROR_CREAR_CRITICA');
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Obtener críticas de un libro.
 * @param req Objeto de solicitud de Express, con el id_libro en req.params.id.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con las críticas y frecuencias, o un error si ocurrió algún problema.
 */
async function obtenerCriticasLibro(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const idLibro = parsePositiveInt(req.params.id);
    if (isNaN(idLibro)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }
    conexionAbierta = new ConexionBD();
    const resultado = await conexionAbierta.listarRegistros('libro_critica', { id_libro: idLibro });
    const criticas: LibroCritica[] = resultado.datos
      .map((critica: any) => ({
        ...critica,
        calificacion_libro: Number(critica.calificacion_libro),
      }))
      .sort((a: any, b: any) => {
        const fechaA = new Date(a.fecha_critica).getTime();
        const fechaB = new Date(b.fecha_critica).getTime();
        return fechaA - fechaB;
      });

    // Calcular frecuencias de notas (calificacion_libro)
    const maxNota = 5;
    const frecuencias: number[] = Array(maxNota).fill(0);
    for (const critica of criticas) {
      const nota = Number(critica.calificacion_libro);
      if (!isNaN(nota) && nota >= 1 && nota <= maxNota) {
        frecuencias[nota - 1]++;
      }
    }

    return respuestaOk(
      res,
      200,
      'CRITICAS_OBTENIDAS_OK',
      { criticas, frecuencias },
      { incluirMensaje: false },
    );
  } catch (error: any) {
    return respuestaError(res, 500, error.message || 'ERROR_OBTENER_CRITICAS');
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Actualizar crítica de un libro.
 * @param req Objeto de solicitud de Express, con el id_libro en req.params.id, id_usuario en req.params.usuarioId y datos a actualizar en req.body.
 * @param res Objeto de respuesta de Express.
 * @returns JSON indicando si la crítica fue actualizada, o un error si ocurrió algún problema.
 */
async function actualizarCritica(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const idLibro = parsePositiveInt(req.params.id);
    const idUsuario = parsePositiveInt(req.params.usuarioId);
    if (isNaN(idLibro)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }
    if (isNaN(idUsuario)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    const datos = construirDatosCritica(req.body, true);
    if (!validarCritica({ ...datos, id_libro: idLibro, id_usuario: idUsuario }, true)) {
      return respuestaError(res, 400, 'NO_HAY_CAMPOS_ACTUALIZAR');
    }
    if (Object.keys(datos).length === 0) {
      return respuestaError(res, 400, 'NO_HAY_CAMPOS_ACTUALIZAR');
    }
    conexionAbierta = new ConexionBD();
    const resultado = await conexionAbierta.actualizarRegistro('libro_critica', datos, {
      id_libro: idLibro,
      id_usuario: idUsuario,
    });
    if (resultado.datos.affectedRows === 0) {
      return respuestaError(res, 404, 'CRITICA_NO_ENCONTRADA');
    }
    return respuestaOk(res, 200, 'CRITICA_ACTUALIZADA_OK', undefined, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, error.message || 'ERROR_ACTUALIZAR_CRITICA');
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Borrar crítica de un libro.
 * @param req Objeto de solicitud de Express, con el id_libro en req.params.id y id_usuario en req.params.usuarioId.
 * @param res Objeto de respuesta de Express.
 * @returns JSON indicando si la crítica fue borrada, o un error si ocurrió algún problema.
 */
async function borrarCritica(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const idLibro = parsePositiveInt(req.params.id);
    const idUsuario = parsePositiveInt(req.params.usuarioId);
    if (isNaN(idLibro)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }
    if (isNaN(idUsuario)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    conexionAbierta = new ConexionBD();
    const resultado = await conexionAbierta.borrarRegistro('libro_critica', {
      id_libro: idLibro,
      id_usuario: idUsuario,
    });
    if (resultado.datos.affectedRows === 0) {
      return respuestaError(res, 404, 'CRITICA_NO_ENCONTRADA');
    }
    return respuestaOk(res, 200, 'CRITICA_BORRADA_OK', undefined, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, error.message || 'ERROR_BORRAR_CRITICA');
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

export { crearCritica, obtenerCriticasLibro, actualizarCritica, borrarCritica };
