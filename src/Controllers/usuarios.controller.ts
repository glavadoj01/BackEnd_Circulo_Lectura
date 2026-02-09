// Importar modelos y servicio de conexión
import { Request, Response } from "express";
import { UsuarioBD } from "../Interfaces/modelosBD/modelosBD.js";
import { ConexionBD, getConexionConfigFromEnv } from "../Services/conexionBD.service.js";

/**
 * Crear un nuevo usuario
 */
async function crearUsuario(req: Request, res: Response) {
	let conexionAbierta = null as ConexionBD | null;

	try {
		conexionAbierta = new ConexionBD(getConexionConfigFromEnv());
		const datos: Partial<UsuarioBD> = req.body;
		// Validación mínima
		if (!datos.nombre_usuario || !datos.nombre_real) {
			return res.status(400).json({ error: "Faltan campos obligatorios" });
		}
		// Insertar en la BD
		const insertId = await conexionAbierta.insertarRegistro("usuarios", datos);
		res.status(201).json({ id_usuario: insertId, ...datos });
	} catch (error) {
		res.status(500).json({ error: "Error al crear usuario", detalle: (error as Error).message });
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
		conexionAbierta = new ConexionBD(getConexionConfigFromEnv());
		// Manejo flexible de filtros por query params
		const filtrosRaw = req.query.filtros;
		let filtros: Record<string, any> = {};
		if (typeof filtrosRaw === "string") {
			try {
				filtros = JSON.parse(filtrosRaw);
			} catch {
				return res.status(400).json({ error: "Filtros mal formateados" });
			}
		} else if (typeof filtrosRaw === "object" && filtrosRaw !== null) {
			filtros = filtrosRaw as Record<string, any>;
		}
		const orden = (req.query.orden as string) || "";
		const limite = parseInt(req.query.limite as string) || 0;
		const columnas = (req.query.columnas as string) || "*";
		const usuarios: UsuarioBD[] = await conexionAbierta.listarRegistros(
			"usuario",
			filtros,
			orden,
			limite,
			columnas,
		);
		res.json(usuarios);
	} catch (error) {
		res.status(500).json({ error: "Error al obtener usuarios", detalle: (error as Error).message });
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
		conexionAbierta = new ConexionBD(getConexionConfigFromEnv());
		const id = req.params.id || req.body.id_usuario;
		const datos: Partial<UsuarioBD> = req.body;
		if (!id) {
			return res.status(400).json({ error: "Falta el id del usuario" });
		}
		const afectados = await conexionAbierta.actualizarRegistro("usuarios", datos, { id_usuario: id });
		if (afectados === 0) {
			return res.status(404).json({ error: "Usuario no encontrado" });
		}
		res.json({ actualizado: true, afectados });
	} catch (error) {
		res.status(500).json({ error: "Error al actualizar usuario", detalle: (error as Error).message });
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
		conexionAbierta = new ConexionBD(getConexionConfigFromEnv());
		const id = req.params.id || req.body.id_usuario;
		if (!id) {
			return res.status(400).json({ error: "Falta el id del usuario" });
		}
		const afectados = await conexionAbierta.borrarRegistro("usuarios", { id_usuario: id });
		if (afectados === 0) {
			return res.status(404).json({ error: "Usuario no encontrado" });
		}
		res.json({ borrado: true, afectados });
	} catch (error) {
		res.status(500).json({ error: "Error al borrar usuario", detalle: (error as Error).message });
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

// Exportación de las funciones del controlador
export { crearUsuario, obtenerUsuarios, actualizarUsuario, borrarUsuario };
