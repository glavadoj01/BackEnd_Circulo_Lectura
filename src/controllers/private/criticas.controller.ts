import { Response } from 'express';
import type { AuthRequest } from '../../interfaces/modelosApp/modelosApp.js';
import { LibroCritica } from '../../interfaces/modelosBD/modelosBD.js';
import { ConexionBD } from '../../services/conexionBD.service.js';
import { parseCalificacion, parsePositiveInt } from '../../utils/validation.utils.js';
import { respuestaError, respuestaOk } from '../../utils/validationMessages.utils.js';
import { asegurarPropietarioAdmin, getSesionID } from '../../utils/authorization.utils.js';

/**
 * Valida los datos de una crítica.
 * @param critica Objeto crítica a validar.
 * @param esActualizacion Si es true, permite campos opcionales.
 * @returns {boolean} true si es válido, false si no.
 */
const validarCritica = (critica: any, esActualizacion = false): boolean => {
  if (!critica || typeof critica !== 'object') return false;
  if (!esActualizacion) {
    if (
      Number.isNaN(parsePositiveInt(critica.id_libro)) ||
      Number.isNaN(parsePositiveInt(critica.id_usuario)) ||
      Number.isNaN(parseCalificacion(critica.calificacion_comentario))
    ) {
      return false;
    }
  }
  if (critica.titulo_comentario !== undefined && typeof critica.titulo_comentario !== 'string')
    return false;
  if (critica.texto_comentario !== undefined && typeof critica.texto_comentario !== 'string')
    return false;
  if (
    critica.calificacion_comentario !== undefined &&
    (Number.isNaN(parseCalificacion(critica.calificacion_comentario)) ||
      parseCalificacion(critica.calificacion_comentario) < 1 ||
      parseCalificacion(critica.calificacion_comentario) > 5)
  )
    return false;
  return true;
};

/**
 * Construye el objeto de datos para la BD a partir del body.
 * @param body Body de la request.
 * @param esActualizacion Si es true, solo incluye campos presentes.
 * @returns Objeto listo para la BD.
 */
const construirDatosCritica = (body: any, esActualizacion = false): Partial<LibroCritica> => {
  const datos: Partial<LibroCritica> = {};
  if (!esActualizacion || body.id_libro !== undefined) {
    datos.id_libro = parsePositiveInt(body.id_libro);
  }
  if (!esActualizacion || body.id_usuario !== undefined) {
    datos.id_usuario = parsePositiveInt(body.id_usuario);
  }
  if (body.titulo_comentario !== undefined) {
    datos.titulo_comentario = String(body.titulo_comentario);
  }
  if (body.texto_comentario !== undefined) {
    datos.texto_comentario = String(body.texto_comentario);
  }
  if (body.calificacion_comentario !== undefined) {
    datos.calificacion_comentario = parseCalificacion(body.calificacion_comentario);
  }
  return datos;
};

/**
 * Crear nueva crítica para un libro.
 * @param req Objeto de solicitud de Express, con los datos de la crítica en req.body.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con la crítica creada o un error si ocurrió algún problema.
 */
export async function crearCritica(req: AuthRequest, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const datos = construirDatosCritica(req.body);
    if (!validarCritica(datos)) {
      return respuestaError(res, 400, 'CAMPOS_OBLIGATORIOS');
    }
    const idUsuarioSesion = getSesionID(req);
    if (idUsuarioSesion === null) return respuestaError(res, 401, 'ERROR_USUARIO_NO_AUTENTICADO');
    datos.id_usuario = idUsuarioSesion;
    conexionAbierta = new ConexionBD();
    const resultado = await conexionAbierta.insertarRegistro('libro_critica', datos, false);
    if (resultado.datos.affectedRows > 0 || resultado.datos.insertId) {
      return respuestaOk(res, 201, 'CRITICA_CREADA_OK', {
        critica: { id_libro: datos.id_libro, id_usuario: datos.id_usuario },
      });
    } else {
      return respuestaError(res, 500, 'ERROR_CREAR_CRITICA', resultado.mensaje);
    }
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_CREAR_CRITICA', error.message);
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
export async function actualizarCritica(req: AuthRequest, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const idLibro = parsePositiveInt(req.params.id);
    const idUsuario = getSesionID(req);
    if (Number.isNaN(idLibro)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }
    if (!idUsuario) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    if (!asegurarPropietarioAdmin(req, res, idUsuario, 1)) return null;
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
      return respuestaError(res, 404, 'ERROR_OBTENER_CRITICAS', resultado.mensaje);
    }
    return respuestaOk(res, 200, 'CRITICA_ACTUALIZADA_OK', resultado.datos);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_ACTUALIZAR_CRITICA', error.message);
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
export async function borrarCritica(req: AuthRequest, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const idLibro = parsePositiveInt(req.params.id);
    const idUsuario = getSesionID(req);
    if (Number.isNaN(idLibro)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }
    if (!idUsuario) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    if (!asegurarPropietarioAdmin(req, res, idUsuario, 1)) return null;
    conexionAbierta = new ConexionBD();
    const resultado = await conexionAbierta.borrarRegistro('libro_critica', {
      id_libro: idLibro,
      id_usuario: idUsuario,
    });
    if (resultado.datos.affectedRows === 0) {
      return respuestaError(res, 404, 'ERROR_OBTENER_CRITICAS', resultado.mensaje);
    }
    return respuestaOk(res, 200, 'CRITICA_BORRADA_OK', resultado.datos);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_BORRAR_CRITICA', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}
