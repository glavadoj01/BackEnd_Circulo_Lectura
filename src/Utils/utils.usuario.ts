import { ConexionBD } from "../services/conexionBD.service.js";
import { CodigoRespuesta } from "./validationMessages.utils.js";

const REGEX_EMAIL = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,15}$/;

const esCadenaValida = (v: any, min = 1) => typeof v === "string" && v.trim().length >= min;

/**
 * Valida los datos de un usuario según el modelo de la BD.
 * @param usuario Objeto usuario a validar.
 * @returns {CodigoRespuesta | null} null si es válido, mensaje de error si no.
 */
export const validarUsuario = (usuario: any, esActualizacion: boolean = false): CodigoRespuesta | null => {
	if (!usuario || typeof usuario !== "object") return "DATOS_INVALIDOS";

	if (!esActualizacion && !esCadenaValida(usuario.nombre_usuario, 2)) return "ERROR_USUARIO_NOMBRE_OBLIGATORIO";
	if (!esActualizacion && !REGEX_EMAIL.test(usuario.email_usuario)) return "ERROR_USUARIO_EMAIL_OBLIGATORIO";
	if (!esActualizacion && !esCadenaValida(usuario.nombre_real, 2)) return "ERROR_USUARIO_NOMBRE_REAL_OBLIGATORIO";

	if (usuario.apellido_usuario !== undefined && !esCadenaValida(usuario.apellido_usuario, 2)) {
		return "ERROR_USUARIO_APELLIDO_INVALIDO";
	}

	if (usuario.password !== undefined && !REGEX_PASSWORD.test(String(usuario.password).trim())) {
		return "ERROR_USUARIO_CONTRASEÑA_DEBIL";
	}

	return null;
};

export const validarActualizacionUsuario = (usuario: any): CodigoRespuesta | null => {
	if (!usuario || typeof usuario !== "object") return "DATOS_INVALIDOS";

	if (usuario.nombre_usuario !== undefined && !esCadenaValida(usuario.nombre_usuario, 2)) {
		return "ERROR_USUARIO_NOMBRE_INVALIDO";
	}
	if (usuario.email_usuario !== undefined && !REGEX_EMAIL.test(usuario.email_usuario)) {
		return "ERROR_USUARIO_EMAIL_INVALIDO";
	}
	if (usuario.nombre_real !== undefined && !esCadenaValida(usuario.nombre_real, 2)) {
		return "ERROR_USUARIO_NOMBRE_REAL_INVALIDO";
	}
	if (usuario.apellido_usuario !== undefined && !esCadenaValida(usuario.apellido_usuario, 2)) {
		return "ERROR_USUARIO_APELLIDO_INVALIDO";
	}
	return null;
};

/**
 * Construye el objeto de datos para la BD a partir del body (alta).
 * @param body Body de la request.
 * @returns Objeto listo para la BD.
 */
export const construirDatosUsuario = (body: any): Record<string, any> => {
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
export const construirDatosUsuarioParcial = (body: any): Record<string, any> => {
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
export const buscarEmailExistente = async (
	email: string,
	conexion: ConexionBD,
	excluirId?: number,
): Promise<boolean> => {
	const condiciones: Record<string, any> = { email_usuario: email };
	if (excluirId !== undefined) {
		condiciones.id_usuario = { operador: "!=", valor: excluirId };
	}

	const resultado = await conexion.listarRegistros("usuario", condiciones, "", 1, "id_usuario");
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
export const buscarNombreUsuarioExistente = async (
	nombre_usuario: string,
	conexion: ConexionBD,
	excluirId?: number,
): Promise<boolean> => {
	const condiciones: Record<string, any> = { nombre_usuario };
	if (excluirId !== undefined) {
		condiciones.id_usuario = { operador: "!=", valor: excluirId };
	}

	const resultado = await conexion.listarRegistros("usuario", condiciones, "", 1, "id_usuario");
	return !!(resultado.datos && resultado.datos[0]);
};

export const validarPaginacion = (q: any) => {
	// const page = q.page ? Math.max(Number(q.page), 1) : 1;
	const limit = q.limit ? Math.min(Number(q.limit), 50) : 50;

	// if (Number.isNaN(page) || page < 1 || Number.isNaN(limit) || limit < 1) {
	if (Number.isNaN(limit) || limit < 1) {
		throw new Error("ERROR_USUARIO_PARAMETROS_PAGINACION_INVALIDOS");
	}

	return limit;
};

export const construirFiltros = (q: any): Record<string, any> => {
	const filtros: Record<string, any> = {};

	if (q.filtros) {
		try {
			Object.assign(filtros, JSON.parse(q.filtros as string));
		} catch {
			throw new Error("FILTROS_MAL_FORMATEADOS");
		}
	}

	asignarFiltroSimple(q, filtros, "id_usuario", true);
	asignarFiltroSimple(q, filtros, "nombre_usuario");
	asignarFiltroSimple(q, filtros, "email_usuario");
	asignarFiltroSimple(q, filtros, "nombre_real");
	asignarFiltroSimple(q, filtros, "apellido_usuario");

	if (q.esAdministrador !== undefined) {
		filtros.esAdministrador = q.esAdministrador;
	}

	return filtros;
};

export const asignarFiltroSimple = (q: any, filtros: Record<string, any>, campo: string, esNumero = false) => {
	const valor = q[campo];
	if (valor === undefined) return;

	if (esNumero) {
		const num = Number(valor);
		if (!Number.isNaN(num)) filtros[campo] = num;
	} else if (typeof valor === "string") {
		filtros[campo] = valor;
	}
};
