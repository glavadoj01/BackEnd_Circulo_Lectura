import { Request, Response } from 'express';
import { ConexionBD } from '../Services/conexionBD.service.js';
import { parsePositiveInt } from '../Utils/validation.utils.js';
import { respuestaError, respuestaOk } from '../Utils/validationMessages.utils.js';
import { ConexionUsuarios } from '../Services/conexionUsuarios.service.js';

/**
 * Valida los datos de un usuario.
 * @param usuario Objeto usuario a validar.
 * @param esActualizacion Si es true, permite campos opcionales.
 * @returns {boolean} true si es válido, false si no.
 */
function validarUsuario(usuario: any, esActualizacion = false): boolean {
  if (!usuario || typeof usuario !== 'object') return false;
  if (!esActualizacion) {
    if (
      typeof usuario.nombre_usuario !== 'string' ||
      usuario.nombre_usuario.trim().length < 2 ||
      typeof usuario.nombre_real !== 'string' ||
      usuario.nombre_real.trim().length < 2
    ) {
      return false;
    }
  }
  if (usuario.apellido_usuario !== undefined && typeof usuario.apellido_usuario !== 'string')
    return false;
  if (usuario.esAdministrador !== undefined && typeof usuario.esAdministrador !== 'boolean')
    return false;
  return true;
}

/**
 * Construye el objeto de datos para la BD a partir del body.
 * @param body Body de la request.
 * @param esActualizacion Si es true, solo incluye campos presentes.
 * @returns Objeto listo para la BD.
 */
function construirDatosUsuario(
  body: any,
  esActualizacion = false,
): Record<string, string | boolean> {
  const datos: Record<string, string | boolean> = {};
  if (!esActualizacion || body.nombre_usuario !== undefined) {
    datos.nombre_usuario = String(body.nombre_usuario).trim();
  }
  if (!esActualizacion || body.nombre_real !== undefined) {
    datos.nombre_real = String(body.nombre_real).trim();
  }
  if (body.apellido_usuario !== undefined) {
    datos.apellido_usuario = String(body.apellido_usuario).trim();
  }
  if (body.esAdministrador !== undefined) {
    datos.esAdministrador = Boolean(body.esAdministrador);
  }
  return datos;
}

/**
 * Crear un nuevo usuario.
 * @param req Objeto de solicitud de Express, con los datos del usuario en req.body.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con el ID del usuario creado y los datos ingresados, o un error si ocurrió algún problema.
 */
async function crearUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const body = req.body;
    if (!validarUsuario(body)) {
      return respuestaError(res, 400, 'CAMPOS_OBLIGATORIOS');
    }
    const datosBD = construirDatosUsuario(body);
    conexionAbierta = new ConexionBD();
    const insertId = (await conexionAbierta.insertarRegistro('usuario', datosBD)).datos.insertId;
    return respuestaOk(
      res,
      201,
      'USUARIO_CREADO_OK',
      { id_usuario: insertId, ...datosBD },
      { incluirMensaje: false },
    );
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_CREAR_USUARIO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Obtener usuarios con/sin filtros de búsqueda.
 * @param req Objeto de solicitud de Express, con posibles filtros en req.query.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con un array de usuarios que coinciden con los filtros, o un error si ocurrió algún problema.
 */
async function obtenerUsuarios(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const filtrosRaw = req.query.filtros;
    let filtros: Record<string, any> = {};
    if (typeof filtrosRaw === 'string') {
      try {
        filtros = JSON.parse(filtrosRaw);
      } catch {
        return respuestaError(res, 400, 'FILTROS_MAL_FORMATEADOS');
      }
    } else if (typeof filtrosRaw === 'object' && filtrosRaw !== null) {
      filtros = filtrosRaw as Record<string, any>;
    }
    const orden = (req.query.orden as string) || '';
    const limite = parsePositiveInt(req.query.limite) || 0;
    const columnas = (req.query.columnas as string) || '*';

    conexionAbierta = new ConexionBD();
    const resultado = await conexionAbierta.listarRegistros(
      'usuario',
      filtros,
      orden,
      limite,
      columnas,
    );
    return respuestaOk(res, 200, 'USUARIO_OBTENIDO_OK', resultado.datos[0], {
      incluirMensaje: false,
    });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_USUARIO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Actualizar un usuario existente.
 * @param req Objeto de solicitud de Express, con el ID del usuario a actualizar en req.params.id o req.body.id_usuario, y los datos a actualizar en req.body.
 * @param res Objeto de respuesta de Express.
 * @returns JSON indicando si el usuario fue actualizado y cuántos registros fueron afectados, o un error si ocurrió algún problema o si el usuario no fue encontrado.
 */
async function actualizarUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const idRaw = req.params.id ?? req.body.id_usuario;
    const id = parsePositiveInt(idRaw);
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    if (!validarUsuario(req.body, true)) {
      return respuestaError(res, 400, 'NO_HAY_CAMPOS_ACTUALIZAR');
    }
    const datosBD = construirDatosUsuario(req.body, true);
    if (Object.keys(datosBD).length === 0) {
      return respuestaError(res, 400, 'NO_HAY_CAMPOS_ACTUALIZAR');
    }
    conexionAbierta = new ConexionBD();
    const afectados = (
      await conexionAbierta.actualizarRegistro('usuario', datosBD, { id_usuario: id })
    ).datos.affectedRows;
    if (afectados === 0) {
      return respuestaError(res, 404, 'ERROR_ACTUALIZAR_USUARIO', 'Usuario no encontrado');
    }
    return respuestaOk(
      res,
      200,
      'USUARIO_ACTUALIZADO_OK',
      { actualizado: true, afectados },
      { incluirMensaje: false },
    );
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_ACTUALIZAR_USUARIO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Borrar un usuario existente.
 * @param req Objeto de solicitud de Express, con el ID del usuario a borrar en req.params.id o req.body.id_usuario.
 * @param res Objeto de respuesta de Express.
 * @returns JSON indicando si el usuario fue borrado y cuántos registros fueron afectados, o un error si ocurrió algún problema.
 */
async function borrarUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const idRaw = req.params.id ?? req.body.id_usuario;
    const id = parsePositiveInt(idRaw);
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    conexionAbierta = new ConexionBD();
    const afectados = (await conexionAbierta.borrarRegistro('usuario', { id_usuario: id })).datos
      .affectedRows;
    if (afectados === 0) {
      return respuestaError(res, 404, 'ERROR_BORRAR_USUARIO', 'Usuario no encontrado');
    }
    return respuestaOk(
      res,
      200,
      'USUARIO_BORRADO_OK',
      { borrado: true, afectados },
      { incluirMensaje: false },
    );
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_BORRAR_USUARIO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

async function obtenerLibrosLeidosUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionUsuarios | null = null;
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }

    conexionAbierta = new ConexionUsuarios();
    const datos = await conexionAbierta.obtenerLibrosLeidosPendientes(id, 1);

    return respuestaOk(res, 200, 'LIBROS_LEIDOS_OK', datos, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LIBROS_LEIDOS', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

async function obtenerLibrosPendientesUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionUsuarios | null = null;
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }

    conexionAbierta = new ConexionUsuarios();
    const datos = await conexionAbierta.obtenerLibrosLeidosPendientes(id, 0);

    return respuestaOk(res, 200, 'LIBROS_PENDIENTES_OK', datos, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LIBROS_PENDIENTES', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

async function obtenerListasCreadasUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionUsuarios | null = null;
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    conexionAbierta = new ConexionUsuarios();

    const idListasCreadas = await conexionAbierta.listarRegistros(
      'lista',
      { id_usuarioCrd: id },
      '',
      0,
      'id_lista',
    );

    const datos = await conexionAbierta.obtenerListasPorIds(
      idListasCreadas.datos.map((l: any) => l.id_lista),
    );

    return respuestaOk(res, 200, 'LISTAS_CREADAS_OK', datos, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LISTAS_CREADAS', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

async function obtenerListasSeguidasUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionUsuarios | null = null;
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    conexionAbierta = new ConexionUsuarios();

    const idListasSeguidas = await conexionAbierta.listarRegistros(
      'lista_usuario',
      {
        id_usuario: id,
        me_gusta_lista: 1,
      },
      '',
      0,
      'id_lista',
    );

    const datos = await conexionAbierta.obtenerListasPorIds(
      idListasSeguidas.datos.map((lu: any) => lu.id_lista),
    );

    return respuestaOk(res, 200, 'LISTAS_SEGUIDAS_OK', datos, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LISTAS_SEGUIDAS', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

async function obtenerEventosCreadosUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionUsuarios | null = null;
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }

    conexionAbierta = new ConexionUsuarios();
    const datos = await conexionAbierta.obtenerEventosCreados(id);

    return respuestaOk(res, 200, 'EVENTOS_CREADOS_OK', datos, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_EVENTOS_CREADOS', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

async function obtenerEventosAsistidosUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionUsuarios | null = null;
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }

    conexionAbierta = new ConexionUsuarios();
    const datos = await conexionAbierta.obtenerEventosAsistidos(id);

    return respuestaOk(res, 200, 'EVENTOS_ASISTIDOS_OK', datos, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_EVENTOS_ASISTIDOS', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

async function obtenerCriticasUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionUsuarios | null = null;
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }

    conexionAbierta = new ConexionUsuarios();
    const datos = await conexionAbierta.obtenerCriticasUsuario(id);

    return respuestaOk(res, 200, 'USUARIO_CRITICAS_OK', datos, { incluirMensaje: false });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_CRITICAS_USUARIO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

export {
  crearUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  borrarUsuario,
  obtenerLibrosLeidosUsuario,
  obtenerLibrosPendientesUsuario,
  obtenerListasCreadasUsuario,
  obtenerListasSeguidasUsuario,
  obtenerEventosCreadosUsuario,
  obtenerEventosAsistidosUsuario,
  obtenerCriticasUsuario,
};
