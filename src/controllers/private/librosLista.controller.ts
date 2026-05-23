import { Response } from "express";
import type { AuthRequest } from "../../interfaces/modelosApp/modelosApp.js";
import { respuestaError, respuestaOk } from "../../utils/validationMessages.utils.js";
import { ConexionListas } from "../../services/conexionListas.service.js";
import { asegurarPropietarioAdmin } from "../../utils/authorization.utils.js";

// ================= MÉTODOS: LIBROS EN LISTA =================
export async function agregarLibroALista(req: AuthRequest, res: Response) {
	let conexion: ConexionListas | null = null;
	try {
		const id_lista = Number(req.params.id);
		const id_libro = Number(req.body.id_libro);
		if (Number.isNaN(id_lista) || Number.isNaN(id_libro)) {
			return respuestaError(res, 400, "DATOS_INVALIDOS", "ID de lista o libro no es un número válido");
		}
		conexion = new ConexionListas();
		const listaRows = await conexion.listarRegistros("lista", { id_lista }, "", 1, "id_usuarioCrd");
		const lista = listaRows.exito && Array.isArray(listaRows.datos) ? listaRows.datos[0] : null;
		if (!lista) return respuestaError(res, 404, "ERROR_OBTENER_LISTA");
		if (!asegurarPropietarioAdmin(req, res, Number(lista.id_usuarioCrd), 1)) return null;

		const libroYaEnLista = await conexion.listarRegistros("lista_contenido", { id_lista, id_libro }, "", 1, "id_lista");
		if (libroYaEnLista.exito && Array.isArray(libroYaEnLista.datos) && libroYaEnLista.datos.length > 0) {
			return respuestaError(res, 409, "ERROR_AGREGAR_LIBRO_LISTA");
		}
		const result = await conexion.insertarRegistro("lista_contenido", { id_lista, id_libro });
		if (!result.exito) {
			return respuestaError(res, 500, "ERROR_AGREGAR_LIBRO_LISTA", result.mensaje);
		}
		return respuestaOk(res, 201, "LIBRO_AGREGADO_LISTA_OK", { id_lista, id_libro });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_AGREGAR_LIBRO_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}

export async function eliminarLibroDeLista(req: AuthRequest, res: Response) {
	let conexion: ConexionListas | null = null;
	try {
		const id_lista = Number(req.params.id);
		const id_libro = Number(req.params.libroId);
		if (Number.isNaN(id_lista) || Number.isNaN(id_libro)) {
			return respuestaError(res, 400, "DATOS_INVALIDOS", "ID de lista o libro no es un número válido");
		}
		conexion = new ConexionListas();
		const listaRows = await conexion.listarRegistros("lista", { id_lista }, "", 1, "id_usuarioCrd");
		const lista = listaRows.exito && Array.isArray(listaRows.datos) ? listaRows.datos[0] : null;
		if (!lista) return respuestaError(res, 404, "ERROR_OBTENER_LISTA");
		if (!asegurarPropietarioAdmin(req, res, Number(lista.id_usuarioCrd), 1)) return null;
		const result = await conexion.borrarRegistro("lista_contenido", { id_lista, id_libro });
		if (!result.exito || result.datos === 0) {
			return respuestaError(res, 404, "ERROR_BORRAR_LIBRO_LISTA", "Libro no encontrado en la lista");
		}
		return respuestaOk(res, 200, "LIBRO_ELIMINADO_LISTA_OK", { id_lista, id_libro });
	} catch (error: any) {
		return respuestaError(res, 500, "ERROR_BORRAR_LIBRO_LISTA", error.message);
	} finally {
		if (conexion) await conexion.close();
	}
}
