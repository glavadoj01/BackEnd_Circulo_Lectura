import { Response } from "express";
import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { ConexionBD } from "../../services/conexionBD.service.js";
import { asegurarPropietarioAdmin, getSesionID } from "../../utils/authorization.utils.js";
import { ListaBD } from "../../interfaces/modelosBD/modelosBD.js";
import { respuestaOk, respuestaError } from "../../utils/validationMessages.utils.js";

// Crear una nueva lista
export async function crearLista(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const datos: Partial<ListaBD> = req.body.lista ? req.body.lista : req.body;
		if (!datos.nombre_lista || typeof datos.nombre_lista !== "string" || datos.nombre_lista.trim().length < 2) {
			return respuestaError(res, 400, "CAMPOS_OBLIGATORIOS");
		}

		const idCrd = getSesionID(req);
		if (!idCrd) return respuestaError(res, 401, "ERROR_USUARIO_NO_AUTENTICADO");
		datos.id_usuarioCrd = idCrd;

		conexion = new ConexionBD();
		const insertId = (await conexion.insertarRegistro("lista", datos)).datos.insertId;
		return respuestaOk(res, 201, "LISTA_CREADA_OK", { data: { id_lista: insertId, ...datos } });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_CREAR_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

// Actualizar una lista
export async function actualizarLista(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const id = Number(req.params.id ?? req.body.id_lista);
		const datos: Partial<ListaBD> =
			typeof req.body.lista === "object" && req.body.lista !== null ? req.body.lista : req.body;
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		conexion = new ConexionBD();
		// Verificar propietario o rol mínimo (moderador)
		const lista = (await conexion.listarRegistros("lista", { id_lista: id }, "", 1, "id_usuarioCrd")).datos[0];
		if (!lista) return respuestaError(res, 404, "ERROR_ACTUALIZAR_LISTA", "Lista no encontrada");
		if (!asegurarPropietarioAdmin(req, res, Number(lista.id_usuarioCrd), 1)) return null;

		const afectados = (await conexion.actualizarRegistro("lista", datos, { id_lista: id })).datos.affectedRows;
		if (afectados === 0) {
			return respuestaError(res, 404, "ERROR_ACTUALIZAR_LISTA", "Lista no encontrada");
		}
		return respuestaOk(res, 200, "LISTA_ACTUALIZADA_OK", { actualizado: true, afectados });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_ACTUALIZAR_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

// Borrar una lista
export async function borrarLista(req: AuthRequest, res: Response) {
	let conexion: ConexionBD | null = null;
	try {
		const id = Number(req.params.id ?? req.body.id_lista);
		if (Number.isNaN(id)) {
			return respuestaError(res, 400, "ID_LISTA_INVALIDO");
		}
		conexion = new ConexionBD();
		const lista = (await conexion.listarRegistros("lista", { id_lista: id }, "", 1, "id_usuarioCrd")).datos[0];
		if (!lista) return respuestaError(res, 404, "ERROR_BORRAR_LISTA", "Lista no encontrada");
		if (!asegurarPropietarioAdmin(req, res, Number(lista.id_usuarioCrd), 1)) return null;

		const afectados = (await conexion.borrarRegistro("lista", { id_lista: id })).datos.affectedRows;
		if (afectados === 0) {
			return respuestaError(res, 404, "ERROR_BORRAR_LISTA", "Lista no encontrada");
		}
		return respuestaOk(res, 200, "LISTA_BORRADA_OK", { borrado: true, afectados });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_BORRAR_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
