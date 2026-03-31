// Importar modelos y servicio de conexión
import { Request, Response } from 'express';
import { LibroCritica } from '../Interfaces/modelosBD/modelosBD.js';
import { ConexionBD } from '../Services/conexionBD.service.js';
import { parseCalificacion, parsePositiveInt } from '../Utils/validation.utils.js';
import { respuestaError, respuestaOk } from '../Utils/validationMessages.utils.js';

/**
 * Crear nueva crítica para un libro
 */
async function crearCritica(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;
  try {
    const idLibro = parsePositiveInt(req.params.id);
    const idUsuario = parsePositiveInt(req.body.id_usuario);
    const tituloCritica = req.body.titulo_critica || '';
    const textoCritica = req.body.texto_critica || '';
    const calificacionLibro = parseCalificacion(req.body.calificacion_libro);
    if (isNaN(idLibro)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }
    if (isNaN(idUsuario)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    if (isNaN(calificacionLibro)) {
      return respuestaError(res, 400, 'CALIFICACION_RANGO');
    }
    const datos: Partial<LibroCritica> = {
      id_libro: idLibro,
      id_usuario: idUsuario,
      titulo_critica: tituloCritica,
      texto_critica: textoCritica,
      calificacion_libro: calificacionLibro,
    };

    conexionAbierta = new ConexionBD();
    const creadas = await conexionAbierta.insertarRegistro('libro_critica', datos, false);
    if (creadas > 0) {
      return respuestaOk(res, 201, 'CRITICA_CREADA_OK', {
        critica: {
          id_libro: idLibro,
          id_usuario: idUsuario,
        },
      });
    } else {
      return respuestaError(res, 500, 'ERROR_CREAR_CRITICA');
    }
  } catch (error) {
    console.error('Error al crear crítica:', error);
    return respuestaError(res, 500, 'ERROR_CREAR_CRITICA');
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Obtener críticas de un libro
 */
async function obtenerCriticasLibro(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;
  try {
    const idLibro = parsePositiveInt(req.params.id);
    if (isNaN(idLibro)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }

    // Obtener críticas del libro
    conexionAbierta = new ConexionBD();
    const criticasRaw: LibroCritica[] = await conexionAbierta.listarRegistros('libro_critica', {
      id_libro: idLibro,
    });
    const criticas = criticasRaw
      .map((critica) => ({
        ...critica,
        calificacion_libro:
          typeof critica.calificacion_libro === 'number'
            ? critica.calificacion_libro
            : Number(critica.calificacion_libro),
      }))
      .sort((a, b) => {
        const fechaA = new Date(a.fecha_critica).getTime();
        const fechaB = new Date(b.fecha_critica).getTime();
        return fechaA - fechaB;
      });

    // Calcular frecuencias de notas (calificacion_libro)
    const maxNota = 5;
    const frecuencias: number[] = Array(maxNota + 1).fill(0);
    for (const critica of criticas) {
      const nota = Number(critica.calificacion_libro);
      if (!isNaN(nota) && nota >= 1 && nota <= maxNota) {
        frecuencias[nota]++;
      }
    }

    return respuestaOk(
      res,
      200,
      'CRITICAS_OBTENIDAS_OK',
      {
        criticas,
        frecuencias,
      },
      { incluirMensaje: false },
    );
  } catch (error) {
    console.error('Error al obtener críticas:', error);
    return respuestaError(res, 500, 'ERROR_OBTENER_CRITICAS');
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Actualizar crítica de un libro
 */
async function actualizarCritica(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;
  try {
    const idLibro = parsePositiveInt(req.params.id);
    const idUsuario = parsePositiveInt(req.params.usuarioId);
    const tituloCritica = req.body.titulo_critica;
    const textoCritica = req.body.texto_critica;
    const calificacionLibro =
      req.body.calificacion_libro !== undefined
        ? parseCalificacion(req.body.calificacion_libro)
        : undefined;
    if (isNaN(idLibro)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }
    if (isNaN(idUsuario)) {
      return respuestaError(res, 400, 'ID_USUARIO_INVALIDO');
    }
    if (calificacionLibro !== undefined && isNaN(calificacionLibro)) {
      return respuestaError(res, 400, 'CALIFICACION_RANGO');
    }
    const datos: Partial<LibroCritica> = {};
    if (tituloCritica !== undefined) datos.titulo_critica = tituloCritica;
    if (textoCritica !== undefined) datos.texto_critica = textoCritica;
    if (calificacionLibro !== undefined) datos.calificacion_libro = calificacionLibro;
    if (Object.keys(datos).length === 0) {
      return respuestaError(res, 400, 'NO_HAY_CAMPOS_ACTUALIZAR');
    }

    conexionAbierta = new ConexionBD();
    const afectados = await conexionAbierta.actualizarRegistro('libro_critica', datos, {
      id_libro: idLibro,
      id_usuario: idUsuario,
    });
    if (afectados === 0) {
      return respuestaError(res, 404, 'CRITICA_NO_ENCONTRADA');
    }
    return respuestaOk(res, 200, 'CRITICA_ACTUALIZADA_OK');
  } catch (error) {
    console.error('Error al actualizar crítica:', error);
    return respuestaError(res, 500, 'ERROR_ACTUALIZAR_CRITICA');
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Borrar crítica de un libro
 */
async function borrarCritica(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;
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
    const afectados = await conexionAbierta.borrarRegistro('libro_critica', {
      id_libro: idLibro,
      id_usuario: idUsuario,
    });

    if (afectados === 0) {
      return respuestaError(res, 404, 'CRITICA_NO_ENCONTRADA');
    }
    return respuestaOk(res, 200, 'CRITICA_BORRADA_OK');
  } catch (error) {
    console.error('Error al borrar crítica:', error);
    return respuestaError(res, 500, 'ERROR_BORRAR_CRITICA');
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

export { crearCritica, obtenerCriticasLibro, actualizarCritica, borrarCritica };
