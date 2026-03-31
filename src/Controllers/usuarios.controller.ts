// Importar modelos y servicio de conexión
import { Request, Response } from 'express';
import { UsuarioBD } from '../Interfaces/modelosBD/modelosBD.js';
import { ConexionBD } from '../Services/conexionBD.service.js';
import { parsePositiveInt } from '../Utils/validation.utils.js';
import { respuestaError, respuestaOk } from '../Utils/validationMessages.utils.js';

/**
 * Crear un nuevo usuario
 */
async function crearUsuario(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;

  try {
    const datos: Partial<UsuarioBD> = req.body;
    // Validación mínima
    if (!datos.nombre_usuario || !datos.nombre_real) {
      return respuestaError(res, 400, 'CAMPOS_OBLIGATORIOS');
    }
    // Insertar en la BD
    conexionAbierta = new ConexionBD();
    const insertId = await conexionAbierta.insertarRegistro('usuario', datos);
    return respuestaOk(
      res,
      201,
      'USUARIO_CREADO_OK',
      { id_usuario: insertId, ...datos },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_CREAR_USUARIO', (error as Error).message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Obtener usuarios con/sin filtros de búsqueda
 */
async function obtenerUsuarios(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;

  try {
    // Manejo flexible de filtros por query params
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
    const limite = parseInt(req.query.limite as string) || 0;
    const columnas = (req.query.columnas as string) || '*';

    conexionAbierta = new ConexionBD();
    const usuarios: UsuarioBD[] = await conexionAbierta.listarRegistros(
      'usuario',
      filtros,
      orden,
      limite,
      columnas,
    );
    return respuestaOk(res, 200, 'USUARIOS_OBTENIDOS_OK', usuarios, { incluirMensaje: false });
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_OBTENER_USUARIOS', (error as Error).message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Actualizar un usuario existente
 */
async function actualizarUsuario(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;

  try {
    const idRaw = req.params.id ?? req.body.id_usuario;
    const id = parsePositiveInt(idRaw);
    const datos: Partial<UsuarioBD> = req.body;
    if (isNaN(id)) {
      return respuestaError(res, 400, 'FALTA_ID_USUARIO');
    }

    conexionAbierta = new ConexionBD();
    const afectados = await conexionAbierta.actualizarRegistro('usuario', datos, {
      id_usuario: id,
    });
    if (afectados === 0) {
      return respuestaError(res, 404, 'USUARIO_NO_ENCONTRADO');
    }
    return respuestaOk(
      res,
      200,
      'USUARIO_ACTUALIZADO_OK',
      { actualizado: true, afectados },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_ACTUALIZAR_USUARIO', (error as Error).message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Borrar un usuario existente
 */
async function borrarUsuario(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;

  try {
    const idRaw = req.params.id ?? req.body.id_usuario;
    const id = parsePositiveInt(idRaw);
    if (isNaN(id)) {
      return respuestaError(res, 400, 'FALTA_ID_USUARIO');
    }

    conexionAbierta = new ConexionBD();
    const afectados = await conexionAbierta.borrarRegistro('usuario', { id_usuario: id });
    if (afectados === 0) {
      return respuestaError(res, 404, 'USUARIO_NO_ENCONTRADO');
    }
    return respuestaOk(
      res,
      200,
      'USUARIO_BORRADO_OK',
      { borrado: true, afectados },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_BORRAR_USUARIO', (error as Error).message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

// Exportación de las funciones del controlador
export { crearUsuario, obtenerUsuarios, actualizarUsuario, borrarUsuario };
