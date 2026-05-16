import { Request, Response } from 'express';
import { ConexionBD } from '../Services/conexionBD.service.js';
import { parsePositiveInt } from '../Utils/validation.utils.js';
import { CodigoRespuesta, respuestaError, respuestaOk } from '../Utils/validationMessages.utils.js';
import { ConexionUsuarios } from '../Services/conexionUsuarios.service.js';

/**
 * Valida los datos de un usuario según el modelo de la BD.
 * @param usuario Objeto usuario a validar.
 * @param esActualizacion Si es true, permite campos opcionales.
 * @returns {CodigoRespuesta | null} null si es válido, mensaje de error si no.
 */
function validarUsuario(usuario: any, esActualizacion = false): CodigoRespuesta | null {
  if (!usuario || typeof usuario !== 'object') return 'DATOS_INVALIDOS';
  if (!esActualizacion) {
    if (typeof usuario.nombre_usuario !== 'string' || usuario.nombre_usuario.trim().length < 2) {
      return 'ERROR_USUARIO_NOMBRE_OBLIGATORIO';
    }
    if (typeof usuario.email_usuario !== 'string' || usuario.email_usuario.trim().length < 5) {
      return 'ERROR_USUARIO_EMAIL_OBLIGATORIO';
    }
    if (typeof usuario.nombre_real !== 'string' || usuario.nombre_real.trim().length < 2) {
      return 'ERROR_USUARIO_NOMBRE_REAL_OBLIGATORIO';
    }
  }
  if (usuario.apellido_usuario !== undefined && typeof usuario.apellido_usuario !== 'string')
    return 'ERROR_USUARIO_APELLIDO_INVALIDO';
  if (usuario.esAdministrador !== undefined && ![0, 1, 2].includes(usuario.esAdministrador))
    return 'ERROR_USUARIO_ESADMINISTRADOR_INVALIDO';
  return null;
}

/**
 * Construye el objeto de datos para la BD a partir del body.
 * @param body Body de la request.
 * @param esActualizacion Si es true, solo incluye campos presentes.
 * @returns Objeto listo para la BD.
 */
function construirDatosUsuario(body: any, esActualizacion = false): Record<string, any> {
  const datos: Record<string, any> = {};
  if (!esActualizacion || body.nombre_usuario !== undefined) {
    datos.nombre_usuario = String(body.nombre_usuario).trim();
  }
  if (!esActualizacion || body.email_usuario !== undefined) {
    datos.email_usuario = String(body.email_usuario).trim();
  }
  if (!esActualizacion || body.nombre_real !== undefined) {
    datos.nombre_real = String(body.nombre_real).trim();
  }
  if (body.apellido_usuario !== undefined) {
    datos.apellido_usuario = String(body.apellido_usuario).trim();
  }
  if (body.esAdministrador !== undefined) {
    datos.esAdministrador = Number(body.esAdministrador);
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
    const errorValidacion = validarUsuario(body);
    if (errorValidacion) {
      return respuestaError(res, 400, errorValidacion);
    }
    const datosBD = construirDatosUsuario(body);
    conexionAbierta = new ConexionBD();
    // Validar unicidad de nombre_usuario y email_usuario
    const usuarioExistente = (
      await conexionAbierta.listarRegistros(
        'usuario',
        { nombre_usuario: datosBD.nombre_usuario },
        '',
        1,
        'id_usuario',
      )
    ).datos[0];
    if (usuarioExistente) {
      return respuestaError(res, 409, 'ERROR_USUARIO_NOMBRE_USUARIO_YA_EXISTE');
    }
    const emailExistente = (
      await conexionAbierta.listarRegistros(
        'usuario',
        { email_usuario: datosBD.email_usuario },
        '',
        1,
        'id_usuario',
      )
    ).datos[0];
    if (emailExistente) {
      return respuestaError(res, 409, 'ERROR_USUARIO_EMAIL_YA_EXISTE');
    }
    const insertId = (await conexionAbierta.insertarRegistro('usuario', datosBD)).datos.insertId;
    return respuestaOk(res, 201, 'USUARIO_CREADO_OK', { id_usuario: insertId, ...datosBD });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_USUARIO_CREAR_USUARIO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Obtener usuarios con/sin filtros de búsqueda y paginación.
 * @param req Objeto de solicitud de Express, con posibles filtros en req.query.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con un array de usuarios que coinciden con los filtros, o un error si ocurrió algún problema.
 */
async function obtenerUsuarios(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const q = req.query;
    const limit = validarPaginacion(q);
    const filtros = construirFiltros(req.query);

    conexionAbierta = new ConexionBD();
    const usuarios = await conexionAbierta.listarRegistros('usuario', filtros, '', limit, '*');
    return respuestaOk(res, 200, 'USUARIOS_OBTENIDOS_OK', usuarios.datos);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_USUARIO_OBTENER_USUARIOS', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

function validarPaginacion(q: any) {
  // const page = q.page ? Math.max(Number(q.page), 1) : 1;
  const limit = q.limit ? Math.min(Number(q.limit), 50) : 50;

  // if (Number.isNaN(page) || page < 1 || Number.isNaN(limit) || limit < 1) {
  if (Number.isNaN(limit) || limit < 1) {
    throw new Error('ERROR_USUARIO_PARAMETROS_PAGINACION_INVALIDOS');
  }

  return limit;
}

function construirFiltros(q: any): Record<string, any> {
  const filtros: Record<string, any> = {};

  if (q.filtros) {
    try {
      Object.assign(filtros, JSON.parse(q.filtros as string));
    } catch {
      throw new Error('FILTROS_MAL_FORMATEADOS');
    }
  }

  asignarFiltroSimple(q, filtros, 'id_usuario', true);
  asignarFiltroSimple(q, filtros, 'nombre_usuario');
  asignarFiltroSimple(q, filtros, 'email_usuario');
  asignarFiltroSimple(q, filtros, 'nombre_real');
  asignarFiltroSimple(q, filtros, 'apellido_usuario');

  if (q.esAdministrador !== undefined) {
    filtros.esAdministrador = q.esAdministrador;
  }

  return filtros;
}

function asignarFiltroSimple(
  q: any,
  filtros: Record<string, any>,
  campo: string,
  esNumero = false,
) {
  const valor = q[campo];
  if (valor === undefined) return;

  if (esNumero) {
    const num = Number(valor);
    if (!Number.isNaN(num)) filtros[campo] = num;
  } else if (typeof valor === 'string') {
    filtros[campo] = valor;
  }
}

/**
 * Obtener un usuario por ID.
 * @param req Objeto de solicitud de Express, con el ID del usuario en req.params.id.
 * @param res Objeto de respuesta de Express.
 * @returns JSON con los datos del usuario encontrado, o un error si no fue encontrado.
 */
async function obtenerUsuario(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const id = parsePositiveInt(req.params.id);
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    conexionAbierta = new ConexionBD();
    const resultado = await conexionAbierta.listarRegistros(
      'usuario',
      { id_usuario: id },
      '',
      1,
      '*',
    );
    if (!resultado.datos || resultado.datos.length === 0) {
      return respuestaError(res, 404, 'NO_ENCONTRADO_USUARIO');
    }
    return respuestaOk(res, 200, 'USUARIO_OBTENIDO_OK', resultado.datos[0]);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_USUARIO_OBTENER_USUARIO', error.message);
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
    const errorValidacion = validarUsuario(req.body, true);
    if (errorValidacion) {
      return respuestaError(res, 400, errorValidacion);
    }
    const datosBD = construirDatosUsuario(req.body, true);
    if (Object.keys(datosBD).length === 0) {
      return respuestaError(res, 400, 'NO_HAY_CAMPOS_ACTUALIZAR');
    }
    conexionAbierta = new ConexionBD();
    // Validar unicidad si se actualiza nombre_usuario o email_usuario
    if (datosBD.nombre_usuario) {
      const usuarioExistente = (
        await conexionAbierta.listarRegistros(
          'usuario',
          { nombre_usuario: datosBD.nombre_usuario },
          '',
          1,
          'id_usuario',
        )
      ).datos[0];
      if (usuarioExistente && usuarioExistente.id_usuario !== id) {
        return respuestaError(res, 409, 'ERROR_USUARIO_NOMBRE_USUARIO_YA_EXISTE');
      }
    }
    if (datosBD.email_usuario) {
      const emailExistente = (
        await conexionAbierta.listarRegistros(
          'usuario',
          { email_usuario: datosBD.email_usuario },
          '',
          1,
          'id_usuario',
        )
      ).datos[0];
      if (emailExistente && emailExistente.id_usuario !== id) {
        return respuestaError(res, 409, 'ERROR_USUARIO_EMAIL_YA_EXISTE');
      }
    }
    const afectados = (
      await conexionAbierta.actualizarRegistro('usuario', datosBD, { id_usuario: id })
    ).datos.affectedRows;
    if (afectados === 0) {
      return respuestaError(res, 404, 'NO_ENCONTRADO_USUARIO');
    }
    return respuestaOk(res, 200, 'USUARIO_ACTUALIZADO_OK', { actualizado: true, afectados });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_USUARIO_ACTUALIZAR_USUARIO', error.message);
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
      return respuestaError(res, 404, 'NO_ENCONTRADO_USUARIO');
    }
    return respuestaOk(res, 200, 'USUARIO_BORRADO_OK', { borrado: true, afectados });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_USUARIO_BORRAR_USUARIO', error.message);
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

    return respuestaOk(res, 200, 'LIBROS_LEIDOS_OK', datos);
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

    return respuestaOk(res, 200, 'LIBROS_PENDIENTES_OK', datos);
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

    return respuestaOk(res, 200, 'LISTAS_CREADAS_OK', datos);
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

    return respuestaOk(res, 200, 'LISTAS_SEGUIDAS_OK', datos);
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

    return respuestaOk(res, 200, 'EVENTOS_CREADOS_OK', datos);
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

    return respuestaOk(res, 200, 'EVENTOS_ASISTIDOS_OK', datos);
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

    return respuestaOk(res, 200, 'USUARIO_CRITICAS_OK', datos);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_CRITICAS_USUARIO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

async function obtenerNombreUsuario(req: Request, res: Response) {
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

export {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  borrarUsuario,
  obtenerLibrosLeidosUsuario,
  obtenerLibrosPendientesUsuario,
  obtenerListasCreadasUsuario,
  obtenerListasSeguidasUsuario,
  obtenerEventosCreadosUsuario,
  obtenerEventosAsistidosUsuario,
  obtenerCriticasUsuario,
  obtenerNombreUsuario,
};
