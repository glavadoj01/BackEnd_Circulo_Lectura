import { Response } from "express";

const VALIDACION_MENSAJES = {
	AGREGAR_LIBRO_EVENTO_OK: "Libro agregado al evento exitosamente",
	ELIMINAR_LIBRO_EVENTO_OK: "Libro eliminado del evento exitosamente",
	LOGIN_EXITOSO: "Login exitoso",
	LOGIN_EXITOSO_ADMIN: "Login exitoso - Administrador",
	LOGOUT_EXITOSO: "Logout exitoso",
	API_RESETEADA_OK: "API reseteada exitosamente",
	AUTORES_OBTENIDOS_OK: "Autores obtenidos exitosamente",
	ASISTENTES_EVENTO_OK: "Asistentes del evento obtenidos exitosamente",
	CRITICA_CREADA_OK: "Crítica creada exitosamente",
	CRITICAS_OBTENIDAS_OK: "Críticas obtenidas exitosamente",
	CRITICA_ACTUALIZADA_OK: "Crítica actualizada exitosamente",
	CRITICA_BORRADA_OK: "Crítica borrada exitosamente",
	COMENTARIO_EVENTO_ACTUALIZADO_OK: "Comentario del evento actualizado exitosamente",
	EVENTO_CREADO_OK: "Evento creado exitosamente",
	EVENTO_ACTUALIZADO_OK: "Evento actualizado exitosamente",
	EVENTO_BORRADO_OK: "Evento borrado exitosamente",
	IDIOMAS_OBTENIDOS_OK: "Idiomas obtenidos exitosamente",
	LISTA_CREADA_OK: "Lista creada exitosamente",
	LISTAS_OBTENIDAS_OK: "Listas obtenidas exitosamente",
	LISTA_OBTENIDA_OK: "Lista obtenida exitosamente",
	LISTA_ACTUALIZADA_OK: "Lista actualizada exitosamente",
	LISTA_BORRADA_OK: "Lista borrada exitosamente",
	LISTA_SEGUIDA_OK: "Lista seguida exitosamente",
	LISTA_DEJADA_SEGUIR_OK: "Lista dejada de seguir exitosamente",
	LISTA_ME_GUSTA_OK: "Me gusta de la lista marcado exitosamente",
	LISTA_ME_GUSTA_QUITADO_OK: "Me gusta de la lista quitado exitosamente",
	LISTA_ESTADO_USUARIO_OK: "Estado de lista para usuario obtenido exitosamente",
	EVENTO_SEGUIDO_OK: "Evento seguido exitosamente",
	EVENTO_DEJADO_SEGUIR_OK: "Evento dejado de seguir exitosamente",
	EVENTO_ME_GUSTA_OK: "Me gusta del evento marcado exitosamente",
	EVENTO_ME_GUSTA_QUITADO_OK: "Me gusta del evento quitado exitosamente",
	EVENTO_ESTADO_USUARIO_OK: "Estado de evento para usuario obtenido exitosamente",
	YEARS_OBTENIDOS_OK: "Años de publicación obtenidos exitosamente",
	EVENTOS_CREADOS_OK: "Eventos creados obtenidos exitosamente",
	EVENTOS_OBTENIDOS_OK: "Eventos obtenidos exitosamente",
	EVENTOS_ASISTIDOS_OK: "Eventos asistidos obtenidos exitosamente",
	EVENTO_OBTENIDO_OK: "Evento obtenido exitosamente",
	GENEROS_OBTENIDOS_OK: "Géneros obtenidos exitosamente",
	COMENTARIOS_EVENTO_OK: "Comentarios del evento obtenidos exitosamente",
	COMENTARIOS_LISTA_OK: "Comentarios de la lista obtenidos exitosamente",
	COMENTARIO_LISTA_CREADO_OK: "Comentario de la lista creado exitosamente",
	COMENTARIO_EVENTO_CREADO_OK: "Comentario del evento creado exitosamente",
	COMENTARIO_LISTA_ACTUALIZADO_OK: "Comentario de la lista actualizado exitosamente",
	COMENTARIO_LISTA_BORRADO_OK: "Comentario de la lista borrado exitosamente",
	LIBRO_CREADO_OK: "Libro creado exitosamente",
	LIBROS_OBTENIDOS_OK: "Libros obtenidos exitosamente",
	LIBRO_OBTENIDO_OK: "Libro obtenido exitosamente",
	LIBRO_ACTUALIZADO_OK: "Libro actualizado exitosamente",
	LIBRO_BORRADO_OK: "Libro borrado exitosamente",
	LIBRO_ME_GUSTA_OK: "Me gusta del libro marcado exitosamente",
	LIBRO_ME_GUSTA_QUITADO_OK: "Me gusta del libro quitado exitosamente",
	TOTAL_LIBROS_OBTENIDO_OK: "Total de libros obtenido exitosamente",
	TOTAL_LISTAS_OBTENIDO_OK: "Total de listas obtenido exitosamente",
	TOTAL_EVENTOS_OBTENIDO_OK: "Total de eventos obtenido exitosamente",
	LIBRO_AGREGADO_LISTA_OK: "Libro agregado a la lista exitosamente",
	LIBRO_ELIMINADO_LISTA_OK: "Libro eliminado de la lista exitosamente",
	LIBROS_EVENTO_OK: "Libros del evento obtenidos exitosamente",
	LIBROS_LISTA_OK: "Libros de la lista obtenidos exitosamente",
	LIBROS_LEIDOS_OK: "Libros leídos obtenidos exitosamente",
	LIBROS_PENDIENTES_OK: "Libros pendientes obtenidos exitosamente",
	LIBRO_ESTADO_USUARIO_OK: "Estado del libro para el usuario obtenido exitosamente",
	LISTAS_CREADAS_OK: "Listas creadas obtenidas exitosamente",
	LISTAS_SEGUIDAS_OK: "Listas seguidas obtenidas exitosamente",
	USUARIO_CREADO_OK: "Usuario creado exitosamente",
	USUARIO_CRITICAS_OK: "Críticas del usuario obtenidas exitosamente",
	USUARIO_OBTENIDO_OK: "Usuario obtenido exitosamente",
	USUARIOS_OBTENIDOS_OK: "Usuarios obtenidos exitosamente",
	USUARIO_ACTUALIZADO_OK: "Usuario actualizado exitosamente",
	USUARIO_BORRADO_OK: "Usuario borrado exitosamente",
	USUARIO_NOMBRE_OBTENIDO_OK: "Nombre de usuario obtenido exitosamente",
} as const;

const ERROR_MENSAJES = {
	ERROR_LOGIN_EMAIL_INVALIDO: "Email de login inválido",
	ERROR_LOGIN_PASSWORD_INVALIDA: "Password de login inválida",
	ERROR_LOGIN_TOKEN_FALTANTE: "Token de autenticación faltante o mal formado",
	ERROR_LOGIN_TOKEN_INVALIDO: "Token de autenticación inválido o expirado",
	ERROR_LOGIN_TOKEN_NO_CORRESPONDE: "El token de autenticación no corresponde al usuario indicado",
	ERROR_INTERNO: "Error interno del servidor",

	ERROR_PASSWORDS_NO_COINCIDEN: "Las contraseñas nuevas no coinciden",
	ERROR_USUARIO_NOMBRE_INVALIDO: "El nombre de usuario es inválido (debe tener al menos 2 caracteres)",
	ERROR_USUARIO_EMAIL_INVALIDO: "El email de usuario es inválido",
	ERROR_USUARIO_NOMBRE_REAL_INVALIDO: "El nombre real de usuario es inválido (debe tener al menos 2 caracteres)",

	ERROR_ACTUALIZAR_COMENTARIO_LISTA: "Error al actualizar comentario de la lista",
	ERROR_ACTUALIZAR_COMENTARIO_EVENTO: "Error al actualizar comentario del evento",
	ERROR_ACTUALIZAR_CRITICA: "Error al actualizar crítica",
	ERROR_ACTUALIZAR_EVENTO: "Error al actualizar evento",
	ERROR_ACTUALIZAR_LIBRO: "Error al actualizar libro",
	ERROR_ACTUALIZAR_LISTA: "Error al actualizar lista",
	ERROR_ACTUALIZAR_USUARIO: "Error al actualizar usuario",

	ERROR_CREAR_COMENTARIO_LISTA: "Error al crear comentario de la lista",
	ERROR_CREAR_COMENTARIO_EVENTO: "Error al crear comentario del evento",
	ERROR_CREAR_CRITICA: "Error al crear crítica",
	ERROR_CREAR_EVENTO: "Error al crear evento",
	ERROR_CREAR_LIBRO: "Error al crear libro",
	ERROR_CREAR_LISTA: "Error al crear lista",
	ERROR_SEGUIR_LISTA: "Error al seguir lista",
	ERROR_DEJAR_SEGUIR_LISTA: "Error al dejar de seguir lista",
	ERROR_ME_GUSTA_LISTA: "Error al marcar me gusta en lista",
	ERROR_QUITAR_ME_GUSTA_LISTA: "Error al quitar me gusta en lista",
	ERROR_SEGUIR_EVENTO: "Error al seguir evento",
	ERROR_DEJAR_SEGUIR_EVENTO: "Error al dejar de seguir evento",
	ERROR_ME_GUSTA_EVENTO: "Error al marcar me gusta en evento",
	ERROR_QUITAR_ME_GUSTA_EVENTO: "Error al quitar me gusta en evento",
	ERROR_CREAR_USUARIO: "Error al crear usuario",
	ERROR_AGREGAR_LIBRO_EVENTO: "Error al agregar libro al evento",
	ERROR_ELIMINAR_LIBRO_EVENTO: "Error al eliminar libro del evento",
	ERROR_ME_GUSTA_LIBRO: "Error al marcar me gusta en libro",
	ERROR_QUITAR_ME_GUSTA_LIBRO: "Error al quitar me gusta en libro",

	ERROR_EVENTO_COMENTARIO_NO_VALIDO: "Error al validar ID de evento o comentario",
	ERROR_EVENTO_COMENTARIO_NO_ENCONTRADO: "Error al encontrar el comentario del evento para eliminar",
	COMENTARIO_EVENTO_BORRADO_OK: "Comentario del evento borrado exitosamente",
	ERROR_BORRAR_COMENTARIO_EVENTO: "Error al borrar comentario del evento",

	ERROR_OBTENER_AUTORES: "Error al obtener los autores",
	ERROR_OBTENER_ASISTENTES_EVENTO: "Error al obtener los asistentes del evento",
	ERROR_OBTENER_ESTADO_EVENTO: "Error al obtener el estado del evento para el usuario",
	ERROR_OBTENER_COMENTARIOS_LISTA: "Error al obtener los comentarios de la lista",
	ERROR_OBTENER_COMENTARIOS_EVENTO: "Error al obtener los comentarios del evento",
	ERROR_OBTENER_CRITICAS: "Error al obtener críticas",
	ERROR_OBTENER_CRITICAS_USUARIO: "Error al obtener las críticas del usuario",
	ERROR_OBTENER_ESTADO_LIBRO: "Error al obtener el estado del libro para el usuario",
	ERROR_OBTENER_EVENTO: "Error al obtener el evento",
	ERROR_OBTENER_EVENTOS: "Error al obtener los eventos",
	ERROR_OBTENER_EVENTOS_CREADOS: "Error al obtener los eventos creados",
	ERROR_OBTENER_EVENTOS_ASISTIDOS: "Error al obtener los eventos asistidos",
	ERROR_OBTENER_TOTAL_EVENTOS: "Error al obtener el total de eventos",
	ERROR_OBTENER_GENEROS: "Error al obtener los géneros",
	ERROR_OBTENER_IDIOMAS: "Error al obtener los idiomas",
	ERROR_OBTENER_LIBROS: "Error al obtener libros",
	ERROR_OBTENER_LIBRO: "Error al obtener libro",
	ERROR_OBTENER_LIBROS_LEIDOS: "Error al obtener los libros leídos",
	ERROR_OBTENER_LIBROS_EVENTO: "Error al obtener los libros del evento",
	ERROR_OBTENER_LIBROS_LISTA: "Error al obtener los libros de la lista",
	ERROR_OBTENER_LIBROS_PENDIENTES: "Error al obtener los libros pendientes",
	ERROR_OBTENER_LISTAS: "Error al obtener listas",
	ERROR_OBTENER_LISTAS_CREADAS: "Error al obtener las listas creadas",
	ERROR_OBTENER_LISTAS_SEGUIDAS: "Error al obtener las listas seguidas",
	ERROR_OBTENER_LISTA: "Error al obtener lista",
	ERROR_OBTENER_LISTA_ESTADO_USUARIO: "Error al obtener el estado de la lista para el usuario",
	ERROR_OBTENER_USUARIO: "Error al obtener usuario",
	ERROR_OBTENER_USUARIO_NOMBRE: "Error al obtener el nombre de usuario",
	ERROR_OBTENER_USUARIOS: "Error al obtener usuarios",
	ERROR_OBTENER_YEARS: "Error al obtener los años de publicación",

	ERROR_BORRAR_CRITICA: "Error al borrar crítica",
	ERROR_BORRAR_COMENTARIO_LISTA: "Error al borrar comentario de la lista",
	ERROR_BORRAR_EVENTO: "Error al borrar evento",
	ERROR_BORRAR_LIBRO: "Error al borrar libro",
	ERROR_BORRAR_LIBRO_LISTA: "Error al eliminar libro de la lista",
	ERROR_BORRAR_LISTA: "Error al borrar lista",
	ERROR_BORRAR_USUARIO: "Error al borrar usuario",

	ERROR_RESETEAR_API: "Error al resetear la API",

	ERROR_TOTAL_LIBROS: "Error al obtener total de libros",
	ERROR_TOTAL_LISTAS: "Error al obtener total de listas",

	ERROR_AGREGAR_LIBRO_LISTA: "Error al agregar libro a la lista",

	ERROR_USUARIO_ACTUALIZAR_USUARIO: "Error al actualizar usuario",
	ERROR_USUARIO_BORRAR_USUARIO: "Error al borrar usuario",
	ERROR_USUARIO_CREAR_USUARIO: "Error al crear usuario",
	ERROR_USUARIO_OBTENER_CRITICAS: "Error al obtener críticas del usuario",
	ERROR_USUARIO_OBTENER_USUARIO: "Error al obtener usuario",
	ERROR_USUARIO_OBTENER_USUARIOS: "Error al obtener usuarios",
	ERROR_USUARIO_PARAMETROS_PAGINACION_INVALIDOS: "Parámetros de paginación inválidos",
	ERROR_USUARIO_EMAIL_YA_EXISTE: "El email de usuario ya existe",
	ERROR_USUARIO_NOMBRE_USUARIO_YA_EXISTE: "El nombre de usuario ya existe",

	ERROR_USUARIO_NOMBRE_OBLIGATORIO: "El nombre de usuario es obligatorio",
	ERROR_USUARIO_EMAIL_OBLIGATORIO: "El email de usuario es obligatorio",
	ERROR_USUARIO_NOMBRE_REAL_OBLIGATORIO: "El nombre real de usuario es obligatorio",
	ERROR_USUARIO_PASSWORD_OBLIGATORIA: "La contraseña de usuario es obligatoria",
	ERROR_USUARIO_CONTRASEÑA_DEBIL:
		"La contraseña de usuario es demasiado débil (Longitud mínima 10 | Al menos 1 minúscula | Al menos 1 mayúscula | Al menos 1 dígito| Al menos 1 carácter especial)",
	ERROR_USUARIO_APELLIDO_INVALIDO: "El apellido de usuario es inválido",
	ERROR_USUARIO_ESADMINISTRADOR_INVALIDO: "El campo esAdministrador es inválido",
	ERROR_USUARIO_NO_AUTENTICADO: "El usuario no está autenticado",
	ERROR_USUARIO_NO_AUTORIZADO: "El usuario no tiene permisos para realizar esta acción",
} as const;

const CATALOGO_MENSAJES = {
	NO_ENCONTRADO_LIBRO: "Libro no encontrado",
	NO_ENCONTRADO_USUARIO: "Usuario no encontrado",
	NO_ENCONTRADA_CRITICA: "Crítica no encontrada",
	NO_ENCONTRADA_LISTA: "Lista no encontrada",
	NO_ENCONTRADO_COMENTARIO: "Comentario no encontrado",
	NO_ENCONTRADO_LIBRO_EN_LISTA: "El libro no se encuentra en la lista",
	NO_ENCONTRADO_EVENTO: "Evento no encontrado",
	NO_ENCONTRADOS_EVENTOS: "No se encontraron eventos",

	CAMPOS_OBLIGATORIOS: "Faltan campos obligatorios",

	ID_COMENTARIO_INVALIDO: "ID de comentario inválido",
	ID_LIBRO_INVALIDO: "ID de libro inválido",
	ID_LISTA_INVALIDO: "ID de lista inválido",
	ID_USUARIO_INVALIDO: "ID de usuario inválido",
	ID_EVENTO_INVALIDO: "ID de evento inválido",

	FILTROS_MAL_FORMATEADOS: "Filtros mal formateados",
	FILTRO_NO_PERMITIDO: "Filtro no permitido",
	TIPO_EVENTO_INVALIDO: "Tipo de evento inválido",

	CALIFICACION_RANGO: "La calificación debe estar entre 1 y 5",
	NO_HAY_CAMPOS_ACTUALIZAR: "No hay campos para actualizar",
	RUTA_NO_ENCONTRADA: "Ruta no encontrada",
	PARAMETROS_PAGINACION_INVALIDOS: "Parámetros de paginación inválidos",
	DATOS_INVALIDOS: "Datos inválidos",
} as const;

const MENSAJES_ESTANDARIZADOS = {
	...ERROR_MENSAJES,
	...VALIDACION_MENSAJES,
	...CATALOGO_MENSAJES,
} as const;

export type CodigoRespuesta = keyof typeof MENSAJES_ESTANDARIZADOS;

function construirErrorResponse(codigo: CodigoRespuesta, detalleAdicional?: string | Record<string, unknown>) {
	const base = {
		code: codigo,
		message: MENSAJES_ESTANDARIZADOS[codigo],
	};

	if (!detalleAdicional) {
		return { error: base };
	}

	if (typeof detalleAdicional === "string") {
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
	res: Response, // Respuesta de Express
	statusCode: number, // Código de estado HTTP (200, 201, etc.)
	codigo: CodigoRespuesta, // Código de mensaje estandarizado para identificar la respuesta
	payload?: unknown, // Datos adicionales a incluir en la respuesta (opcional)
) {
	if (payload === undefined) {
		return res.status(statusCode).json({
			message: MENSAJES_ESTANDARIZADOS[codigo],
		});
	}

	if (
		Array.isArray(payload) ||
		typeof payload === "string" ||
		typeof payload === "number" ||
		typeof payload === "boolean"
	) {
		return res.status(statusCode).json({
			message: MENSAJES_ESTANDARIZADOS[codigo],
			data: payload,
		});
	}

	if (payload !== null && typeof payload === "object") {
		return res.status(statusCode).json({
			message: MENSAJES_ESTANDARIZADOS[codigo],
			data: payload as Record<string, unknown>,
		});
	}

	return res.status(statusCode).json({
		message: MENSAJES_ESTANDARIZADOS[codigo],
		data: payload,
	});
}

export function valorTextoSeguro(valor: unknown): string {
	if (typeof valor === "string") {
		const limpio = valor.trim();
		return limpio.length > 0 ? limpio : "";
	} else if (typeof valor === "number" || typeof valor === "boolean") {
		return String(valor);
	} else {
		return "";
	}
}

export function valorNumeroSeguro(valor: unknown): number | null {
	if (typeof valor === "number" && Number.isFinite(valor)) {
		return valor;
	} else if (typeof valor === "string") {
		const limpio = valor.trim();
		return limpio.length > 0 && !Number.isNaN(Number(limpio)) ? Number(limpio) : null;
	}
	return null;
}
