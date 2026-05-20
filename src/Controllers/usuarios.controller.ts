import { Request, Response } from 'express';
import { ConexionBD } from '../services/conexionBD.service.js';
import { parsePositiveInt } from '../utils/validation.utils.js';
import { CodigoRespuesta, respuestaError, respuestaOk } from '../utils/validationMessages.utils.js';
import { ConexionUsuarios } from '../services/conexionUsuarios.service.js';
import bcrypt from 'bcrypt';
import { LoginService } from '../services/login.service.js';

const REGEX_EMAIL = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,15}$/;

const esCadenaValida = (v: any, min = 1) => typeof v === 'string' && v.trim().length >= min;

/**
 * Valida los datos de un usuario según el modelo de la BD.
 * @param usuario Objeto usuario a validar.
 * @returns {CodigoRespuesta | null} null si es válido, mensaje de error si no.
 */
const validarUsuario = (usuario: any, esActualizacion: boolean = false): CodigoRespuesta | null => {
  if (!usuario || typeof usuario !== 'object') return 'DATOS_INVALIDOS';

  if (!esActualizacion && !esCadenaValida(usuario.nombre_usuario, 2))
    return 'ERROR_USUARIO_NOMBRE_OBLIGATORIO';
  if (!esActualizacion && !REGEX_EMAIL.test(usuario.email_usuario))
    return 'ERROR_USUARIO_EMAIL_OBLIGATORIO';
  if (!esActualizacion && !esCadenaValida(usuario.nombre_real, 2))
    return 'ERROR_USUARIO_NOMBRE_REAL_OBLIGATORIO';

  if (usuario.apellido_usuario !== undefined && !esCadenaValida(usuario.apellido_usuario, 2)) {
    return 'ERROR_USUARIO_APELLIDO_INVALIDO';
  }

  if (usuario.password !== undefined && !REGEX_PASSWORD.test(String(usuario.password).trim())) {
    return 'ERROR_USUARIO_CONTRASEÑA_DEBIL';
  }

  return null;
};

/**
 * Construye el objeto de datos para la BD a partir del body (alta).
 * @param body Body de la request.
 * @returns Objeto listo para la BD.
 */
const construirDatosUsuario = (body: any): Record<string, any> => {
  const datos: Record<string, any> = {};

  datos.nombre_usuario = String(body.nombre_usuario).trim();
  datos.email_usuario = String(body.email_usuario).trim();
  datos.password = String(body.password ?? body.password_nueva).trim();
  datos.nombre_real = String(body.nombre_real).trim();

  if (body.apellido_usuario !== undefined) {
    datos.apellido_usuario = String(body.apellido_usuario).trim();
  }

  return datos;
};

/**
 * Construye el objeto de datos parcial para actualización.
 * Solo incluye los campos presentes en el body.
 * @param body Body normalizado.
 */
const construirDatosUsuarioParcial = (body: any): Record<string, any> => {
  const datos: Record<string, any> = {};

  if (body.nombre_usuario !== undefined) {
    datos.nombre_usuario = String(body.nombre_usuario).trim();
  }
  if (body.email_usuario !== undefined) {
    datos.email_usuario = String(body.email_usuario).trim();
  }
  if (body.nombre_real !== undefined) {
    datos.nombre_real = String(body.nombre_real).trim();
  }
  if (body.apellido_usuario !== undefined) {
    datos.apellido_usuario = String(body.apellido_usuario).trim();
  }

  return datos;
};

/**
 * Busca si ya existe un usuario con el email dado.
 * @param email Email a buscar.
 * @param conexion Evita tener que abrir una nueva conexión a la BD, se pasa como parámetro.
 * @returns Boolean indicando si ya existe un usuario con ese email.
 */
const buscarEmailExistente = async (
  email: string,
  conexion: ConexionBD,
  excluirId?: number,
): Promise<boolean> => {
  const condiciones: Record<string, any> = { email_usuario: email };
  if (excluirId !== undefined) {
    condiciones.id_usuario = { operador: '!=', valor: excluirId };
  }

  const resultado = await conexion.listarRegistros('usuario', condiciones, '', 1, 'id_usuario');
  return !!(resultado.datos && resultado.datos[0]);
};

/**
 * Busca si ya existe un usuario con el nombre de usuario dado.
 * Permite excluir un id_usuario (para actualización).
 * @param nombre_usuario Nombre de usuario a buscar.
 * @param conexion Instancia de ConexionBD.
 * @param excluirId Id de usuario a excluir de la búsqueda (opcional).
 * @returns Boolean indicando si ya existe un usuario con ese nombre.
 */
const buscarNombreUsuarioExistente = async (
  nombre_usuario: string,
  conexion: ConexionBD,
  excluirId?: number,
): Promise<boolean> => {
  const condiciones: Record<string, any> = { nombre_usuario };
  if (excluirId !== undefined) {
    condiciones.id_usuario = { operador: '!=', valor: excluirId };
  }

  const resultado = await conexion.listarRegistros('usuario', condiciones, '', 1, 'id_usuario');
  return !!(resultado.datos && resultado.datos[0]);
};

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

    // Generar hash de la contraseña antes de guardar en BD
    const hash = await bcrypt.hash(datosBD.password, 10);
    // Guardo el campo password_hash
    datosBD.password_hash = hash;
    // Elimino el campo password que no existe en la BD y no quiero guardar
    delete datosBD.password;

    conexionAbierta = new ConexionBD();
    // Validar unicidad de nombre_usuario y email_usuario
    if (await buscarNombreUsuarioExistente(datosBD.nombre_usuario, conexionAbierta)) {
      return respuestaError(res, 409, 'ERROR_USUARIO_NOMBRE_USUARIO_YA_EXISTE');
    }
    if (await buscarEmailExistente(datosBD.email_usuario, conexionAbierta)) {
      return respuestaError(res, 409, 'ERROR_USUARIO_EMAIL_YA_EXISTE');
    }

    datosBD.esAdministrador = 0; // Por defecto Usuario -> Administrador tiene ruta para actualizarlo
    const rowsData = await conexionAbierta.insertarRegistro('usuario', datosBD);
    if (!rowsData.exito) {
      return respuestaError(res, 500, 'ERROR_USUARIO_CREAR_USUARIO');
    }

    const insertId = rowsData.datos;
    //! POSTAMAN: COMENTAR ESTA LÍNEA SI SE USA POSTAM Y SE QUIERE VER EL HASH -> RECORODAR DESCOMENTARLA DE NUEVO!!!!!
    delete datosBD.password_hash; // No devuelvo el hash en la respuesta al FRONT
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
    const usuarios = await conexionAbierta.listarRegistros(
      'usuario',
      filtros,
      '',
      limit,
      'id_usuario, nombre_usuario, email_usuario, nombre_real, apellido_usuario, esAdministrador',
    );
    return respuestaOk(res, 200, 'USUARIOS_OBTENIDOS_OK', usuarios.datos);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_USUARIO_OBTENER_USUARIOS', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

const validarPaginacion = (q: any) => {
  // const page = q.page ? Math.max(Number(q.page), 1) : 1;
  const limit = q.limit ? Math.min(Number(q.limit), 50) : 50;

  // if (Number.isNaN(page) || page < 1 || Number.isNaN(limit) || limit < 1) {
  if (Number.isNaN(limit) || limit < 1) {
    throw new Error('ERROR_USUARIO_PARAMETROS_PAGINACION_INVALIDOS');
  }

  return limit;
};

const construirFiltros = (q: any): Record<string, any> => {
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
};

const asignarFiltroSimple = (
  q: any,
  filtros: Record<string, any>,
  campo: string,
  esNumero = false,
) => {
  const valor = q[campo];
  if (valor === undefined) return;

  if (esNumero) {
    const num = Number(valor);
    if (!Number.isNaN(num)) filtros[campo] = num;
  } else if (typeof valor === 'string') {
    filtros[campo] = valor;
  }
};

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
      'id_usuario, nombre_usuario, email_usuario, nombre_real, apellido_usuario, esAdministrador',
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
  let loginSrv: LoginService | null = null;
  try {
    const id = parsePositiveInt(req.params.id ?? req.body.id_usuario ?? Number.NaN);
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    console.log('[PUT User] ID USUARIO A ACTUALIZAR:', id);
    const body = req.body;
    console.log('[PUT User] BODY RECIBIDO:', body);
    // 1) Obtener usuario actual por ID para conocer su email real
    conexionAbierta = new ConexionBD();
    const resultadoUsuarioActual = await conexionAbierta.listarRegistros(
      'usuario',
      { id_usuario: id },
      '',
      1,
      'id_usuario, email_usuario',
    );
    console.log('[PUT User] RESULTADO OBTENER USUARIO ACTUAL:', resultadoUsuarioActual);
    if (!resultadoUsuarioActual.datos || resultadoUsuarioActual.datos.length === 0) {
      return respuestaError(res, 404, 'NO_ENCONTRADO_USUARIO');
    }
    const usuarioActual = resultadoUsuarioActual.datos[0];

    // 2) Validar password_actual contra el email actual del usuario (no contra el posible email nuevo)
    loginSrv = new LoginService();
    const resultadoLogin = await loginSrv.login(usuarioActual.email_usuario, body.password_actual);
    if (!resultadoLogin.ok) {
      return respuestaError(res, 400, 'ERROR_LOGIN_PASSWORD_INVALIDA');
    }
    console.log('[PUT User] RESULTADO LOGIN PASSWORD ACTUAL:', resultadoLogin);
    // 3) Normalizar body para validación (solo campos que realmente se quieren cambiar)
    const bodyNorm: any = {};
    if (body.nombre_usuario !== undefined) bodyNorm.nombre_usuario = body.nombre_usuario;
    if (body.email_usuario !== undefined) bodyNorm.email_usuario = body.email_usuario;
    if (body.nombre_real !== undefined) bodyNorm.nombre_real = body.nombre_real;
    if (body.apellido_usuario !== undefined) bodyNorm.apellido_usuario = body.apellido_usuario;

    if (body.password_nueva) {
      bodyNorm.password = body.password_nueva;
    }
    console.log('[PUT User] BODY NORMALIZADO PARA VALIDACIÓN:', bodyNorm);
    const errorValidacion = validarUsuario(bodyNorm, true);
    console.log('[PUT User] RESULTADO VALIDACIÓN BODY:', errorValidacion);
    if (errorValidacion) {
      return respuestaError(res, 400, errorValidacion);
    }

    // 4) Construir datos parciales para BD
    const datosBD = construirDatosUsuarioParcial(bodyNorm);

    if (body.password_nueva) {
      const hashNuevo = await bcrypt.hash(String(body.password_nueva).trim(), 10);
      datosBD.password_hash = hashNuevo;
    }

    // 5) Validar unicidad si se actualiza nombre_usuario o email_usuario (excluyendo el propio id)
    if (datosBD.nombre_usuario) {
      const usuarioExistente = await buscarNombreUsuarioExistente(
        datosBD.nombre_usuario,
        conexionAbierta,
        id,
      );
      if (usuarioExistente) {
        return respuestaError(res, 409, 'ERROR_USUARIO_NOMBRE_USUARIO_YA_EXISTE');
      }
    }
    if (datosBD.email_usuario) {
      const emailExistente = await buscarEmailExistente(datosBD.email_usuario, conexionAbierta, id);
      if (emailExistente) {
        return respuestaError(res, 409, 'ERROR_USUARIO_EMAIL_YA_EXISTE');
      }
    }

    // 6) Ejecutar actualización
    const resultadoUpdate = await conexionAbierta.actualizarRegistro('usuario', datosBD, {
      id_usuario: id,
    });
    const afectados = resultadoUpdate.datos;

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
