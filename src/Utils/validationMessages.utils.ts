import { Response } from 'express';

const VALIDACION_MENSAJES = {
  CAMPOS_OBLIGATORIOS: 'Faltan campos obligatorios',
  ID_LIBRO_INVALIDO: 'ID de libro inválido',
  ID_USUARIO_INVALIDO: 'ID de usuario inválido',
  FILTROS_MAL_FORMATEADOS: 'Filtros mal formateados',
  FALTA_ID_USUARIO: 'Falta el id del usuario',
  PAGINACION_REQUIERE_AMBOS: 'Paginación inválida: se requieren ambos parámetros page y limit',
  PARAMETRO_PAGE_INVALIDO: 'Parámetro page inválido',
  PARAMETRO_LIMIT_INVALIDO: 'Parámetro limit inválido',
  CALIFICACION_RANGO: 'La calificación debe estar entre 1 y 5',
  NO_HAY_CAMPOS_ACTUALIZAR: 'No hay campos para actualizar',
  FILTRO_NO_PERMITIDO: 'Filtro no permitido',
  RUTA_NO_ENCONTRADA: 'Ruta no encontrada',
  PARAMETROS_PAGINACION_INVALIDOS: 'Parámetros de paginación inválidos',
} as const;

const ERROR_MENSAJES = {
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
  ERROR_CREAR_CRITICA: 'Error al crear crítica',
  ERROR_OBTENER_CRITICAS: 'Error al obtener críticas',
  ERROR_ACTUALIZAR_CRITICA: 'Error al actualizar crítica',
  ERROR_BORRAR_CRITICA: 'Error al borrar crítica',
  ERROR_RESETEAR_API: 'Error al resetear la API',
} as const;

const CATALOGO_MENSAJES = {
  LIBRO_NO_ENCONTRADO: 'Libro no encontrado',
  LIBRO_CREADO_OK: 'Libro creado exitosamente',
  LIBROS_OBTENIDOS_OK: 'Libros obtenidos exitosamente',
  LIBRO_OBTENIDO_OK: 'Libro obtenido exitosamente',
  LIBRO_ACTUALIZADO_OK: 'Libro actualizado exitosamente',
  LIBRO_BORRADO_OK: 'Libro borrado exitosamente',
  TOTAL_LIBROS_OBTENIDO_OK: 'Total de libros obtenido exitosamente',
  USUARIO_NO_ENCONTRADO: 'Usuario no encontrado',
  USUARIO_CREADO_OK: 'Usuario creado exitosamente',
  USUARIOS_OBTENIDOS_OK: 'Usuarios obtenidos exitosamente',
  USUARIO_ACTUALIZADO_OK: 'Usuario actualizado exitosamente',
  USUARIO_BORRADO_OK: 'Usuario borrado exitosamente',
  CRITICA_NO_ENCONTRADA: 'Crítica no encontrada',
  CRITICA_CREADA_OK: 'Crítica creada exitosamente',
  CRITICAS_OBTENIDAS_OK: 'Críticas obtenidas exitosamente',
  CRITICA_ACTUALIZADA_OK: 'Crítica actualizada exitosamente',
  CRITICA_BORRADA_OK: 'Crítica borrada exitosamente',
  API_RESETEADA_OK: 'API reseteada exitosamente',
} as const;

const DETALLE_MENSAJES = {} as const;

const CONFIRMACION_MENSAJES = {} as const;

const MENSAJES_ESTANDARIZADOS = {
  ...ERROR_MENSAJES,
  ...VALIDACION_MENSAJES,
  ...CATALOGO_MENSAJES,
  ...DETALLE_MENSAJES,
  ...CONFIRMACION_MENSAJES,
} as const;

type CodigoRespuesta = keyof typeof MENSAJES_ESTANDARIZADOS;

function construirErrorResponse(
  codigo: CodigoRespuesta,
  detalleAdicional?: string | Record<string, unknown>,
) {
  const base = {
    code: codigo,
    message: MENSAJES_ESTANDARIZADOS[codigo],
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
      message: MENSAJES_ESTANDARIZADOS[codigo],
    });
  }

  if (!incluirMensaje) {
    return res.status(statusCode).json(payload);
  }

  if (Array.isArray(payload)) {
    return res.status(statusCode).json({
      message: MENSAJES_ESTANDARIZADOS[codigo],
      data: payload,
    });
  }

  if (payload !== null && typeof payload === 'object') {
    return res.status(statusCode).json({
      message: MENSAJES_ESTANDARIZADOS[codigo],
      ...(payload as Record<string, unknown>),
    });
  }

  return res.status(statusCode).json({
    message: MENSAJES_ESTANDARIZADOS[codigo],
    data: payload,
  });
}
