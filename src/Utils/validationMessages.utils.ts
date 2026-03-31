import { Response } from 'express';

const VALIDATION_MESSAGES = {
  CAMPOS_OBLIGATORIOS: 'Faltan campos obligatorios',
  ID_LIBRO_INVALIDO: 'ID de libro invalido',
  ID_USUARIO_INVALIDO: 'ID de usuario invalido',
  FILTROS_MAL_FORMATEADOS: 'Filtros mal formateados',
  FALTA_ID_USUARIO: 'Falta el id del usuario',
  PAGINACION_REQUIERE_AMBOS: 'Paginacion invalida: se requieren ambos parametros page y limit',
  PARAMETRO_PAGE_INVALIDO: 'Parametro page invalido',
  PARAMETRO_LIMIT_INVALIDO: 'Parametro limit invalido',
  CALIFICACION_RANGO: 'La calificacion debe estar entre 1 y 5',
  NO_HAY_CAMPOS_ACTUALIZAR: 'No hay campos para actualizar',
  FILTRO_NO_PERMITIDO: 'Filtro no permitido',
  RUTA_NO_ENCONTRADA: 'Ruta no encontrada',
} as const;

const BUSINESS_MESSAGES = {
  LIBRO_NO_ENCONTRADO_EMOJI: 'Libro no encontrado 🔥',
  LIBRO_NO_ENCONTRADO: 'Libro no encontrado',
  CRITICA_NO_ENCONTRADA: 'Crítica no encontrada',
  USUARIO_NO_ENCONTRADO: 'Usuario no encontrado',

  ERROR_CREAR_LIBRO: 'Error al crear libro',
  ERROR_OBTENER_LIBROS: 'Error al obtener libros',
  ERROR_OBTENER_LIBRO: 'Error al obtener libro',
  ERROR_ACTUALIZAR_LIBRO: 'Error al actualizar libro',
  ERROR_BORRAR_LIBRO: 'Error al borrar libro',
  ERROR_TOTAL_LIBROS: 'Error al obtener total de libros',

  ERROR_CREAR_USUARIO: 'Error al crear usuario',
  ERROR_OBTENER_USUARIOS: 'Error al obtener usuarios',
  ERROR_ACTUALIZAR_USUARIO: 'Error al actualizar usuario',
  ERROR_BORRAR_USUARIO: 'Error al borrar usuario',

  API_RESETEADA_OK: 'API reseteada exitosamente',
  ERROR_RESETEAR_API: 'Error al resetear la API',

  ERROR_CREAR_CRITICA: 'Error al crear crítica',
  ERROR_OBTENER_CRITICAS: 'Error al obtener críticas',
  ERROR_ACTUALIZAR_CRITICA: 'Error al actualizar crítica',
  ERROR_BORRAR_CRITICA: 'Error al borrar crítica',

  CRITICA_CREADA_OK: 'Crítica creada exitosamente',
  CRITICAS_OBTENIDAS_OK: 'Críticas obtenidas exitosamente',
  CRITICA_ACTUALIZADA_OK: 'Crítica actualizada exitosamente',
  CRITICA_BORRADA_OK: 'Crítica borrada exitosamente',

  LIBRO_CREADO_OK: 'Libro creado exitosamente',
  LIBROS_OBTENIDOS_OK: 'Libros obtenidos exitosamente',
  LIBRO_OBTENIDO_OK: 'Libro obtenido exitosamente',
  LIBRO_ACTUALIZADO_OK: 'Libro actualizado exitosamente',
  LIBRO_BORRADO_OK: 'Libro borrado exitosamente',
  TOTAL_LIBROS_OBTENIDO_OK: 'Total de libros obtenido exitosamente',

  USUARIO_CREADO_OK: 'Usuario creado exitosamente',
  USUARIOS_OBTENIDOS_OK: 'Usuarios obtenidos exitosamente',
  USUARIO_ACTUALIZADO_OK: 'Usuario actualizado exitosamente',
  USUARIO_BORRADO_OK: 'Usuario borrado exitosamente',
} as const;

const MESSAGE_CATALOG = {
  ...VALIDATION_MESSAGES,
  ...BUSINESS_MESSAGES,
} as const;

type CodigoRespuesta = keyof typeof MESSAGE_CATALOG;

function construirErrorResponse(
  codigo: CodigoRespuesta,
  detalleAdicional?: string | Record<string, unknown>,
) {
  const base = {
    code: codigo,
    message: MESSAGE_CATALOG[codigo],
  };

  if (!detalleAdicional) {
    return { error: base };
  }

  if (typeof detalleAdicional === 'string') {
    return {
      error: {
        ...base,
        detalle: detalleAdicional,
      },
    };
  }

  return {
    error: {
      ...base,
      ...detalleAdicional,
    },
  };
}

export function respuestaError(
  res: Response,
  statusCode: number,
  codigo: CodigoRespuesta,
  detalleAdicional?: string | Record<string, unknown>,
) {
  return res.status(statusCode).json(construirErrorResponse(codigo, detalleAdicional));
}

export function respuestaOk(
  res: Response,
  statusCode: number,
  codigo: CodigoRespuesta,
  payload?: unknown,
  opciones?: { incluirMensaje?: boolean },
) {
  const incluirMensaje = opciones?.incluirMensaje ?? true;

  if (typeof payload === 'undefined') {
    return res.status(statusCode).json({
      message: MESSAGE_CATALOG[codigo],
    });
  }

  if (!incluirMensaje) {
    return res.status(statusCode).json(payload);
  }

  if (Array.isArray(payload)) {
    return res.status(statusCode).json({
      message: MESSAGE_CATALOG[codigo],
      data: payload,
    });
  }

  if (payload !== null && typeof payload === 'object') {
    return res.status(statusCode).json({
      message: MESSAGE_CATALOG[codigo],
      ...(payload as Record<string, unknown>),
    });
  }

  return res.status(statusCode).json({
    message: MESSAGE_CATALOG[codigo],
    data: payload,
  });
}
