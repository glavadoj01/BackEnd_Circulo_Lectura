// Importar modelos y servicio de conexión
import { Request, Response } from "express";
import { LibroCritica } from "../Interfaces/modelosBD/modelosBD.js";
import { ConexionBD, getConexionConfigFromEnv } from "../Services/conexionBD.service.js";

/**
 * Crear nueva crítica para un libro
 */
async function crearCritica(req: Request, res: Response) {
	let conexionAbierta = null as ConexionBD | null;
	try {
		conexionAbierta = new ConexionBD(getConexionConfigFromEnv());
		const idLibroParam = req.params.id;
		const idLibro = parseInt(Array.isArray(idLibroParam) ? idLibroParam[0] : idLibroParam);
		const idUsuario = req.body.id_usuario;
		const tituloCritica = req.body.titulo_critica || "";
		const textoCritica = req.body.texto_critica || "";
		const calificacionLibro = req.body.calificacion_libro;
		if (isNaN(idLibro) || !idUsuario || calificacionLibro === undefined) {
			return res.status(400).json({ error: "Faltan campos obligatorios" });
		}
		const datos: Partial<LibroCritica> = {
			id_libro: idLibro,
			id_usuario: idUsuario,
			titulo_critica: tituloCritica,
			texto_critica: textoCritica,
			calificacion_libro: calificacionLibro,
		};

		const insertId = await conexionAbierta.insertarRegistro("libro_critica", datos);
		if (insertId > 0) {
			res.status(201).json({ message: "Crítica creada exitosamente", id_critica: insertId });
		} else {
			res.status(500).json({ error: "Error al crear crítica" });
		}
	} catch (error) {
		console.error("Error al crear crítica:", error);
		res.status(500).json({ error: "Error al crear crítica" });
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
		conexionAbierta = new ConexionBD(getConexionConfigFromEnv());
		const idLibroParam = req.params.id;
		const idLibro = parseInt(Array.isArray(idLibroParam) ? idLibroParam[0] : idLibroParam);
		if (isNaN(idLibro)) {
			return res.status(400).json({ error: "ID de libro inválido" });
		}

		// Obtener críticas del libro
		const criticas: LibroCritica[] = await conexionAbierta.listarRegistros("libro_critica", { id_libro: idLibro });

		// Calcular frecuencias de notas (calificacion_libro)
		const maxNota = 5;
		const frecuencias: number[] = Array(maxNota + 1).fill(0);
		for (const critica of criticas) {
			const nota =
				typeof critica.calificacion_libro === "number"
					? critica.calificacion_libro
					: parseInt(critica.calificacion_libro);
			if (!isNaN(nota) && nota >= 0 && nota <= maxNota) {
				frecuencias[nota]++;
			}
		}

		return res.status(200).json({
			criticas,
			frecuencias,
		});
	} catch (error) {
		console.error("Error al obtener críticas:", error);
		res.status(500).json({ error: "Error al obtener críticas" });
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
		conexionAbierta = new ConexionBD(getConexionConfigFromEnv());
		const idLibroParam = req.params.id;
		const idCriticaParam = req.params.criticaId;
		const idLibro = parseInt(Array.isArray(idLibroParam) ? idLibroParam[0] : idLibroParam);
		const idCritica = parseInt(Array.isArray(idCriticaParam) ? idCriticaParam[0] : idCriticaParam);
		const tituloCritica = req.body.titulo_critica;
		const textoCritica = req.body.texto_critica;
		const calificacionLibro = req.body.calificacion_libro;
		if (isNaN(idLibro) || isNaN(idCritica)) {
			return res.status(400).json({ error: "Faltan campos obligatorios" });
		}
		const datos: Partial<LibroCritica> = {};
		if (tituloCritica !== undefined) datos.titulo_critica = tituloCritica;
		if (textoCritica !== undefined) datos.texto_critica = textoCritica;
		if (calificacionLibro !== undefined) datos.calificacion_libro = calificacionLibro;

		const afectados = await conexionAbierta.actualizarRegistro("libro_critica", datos, {
			id_libro: idLibro,
			id_usuario: idCritica,
		});
		if (afectados === 0) {
			return res.status(404).json({ error: "Crítica no encontrada" });
		}
		return res.status(200).json({ message: "Crítica actualizada exitosamente" });
	} catch (error) {
		console.error("Error al actualizar crítica:", error);
		res.status(500).json({ error: "Error al actualizar crítica" });
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
		conexionAbierta = new ConexionBD(getConexionConfigFromEnv());
		const idLibroParam = req.params.id;
		const idCriticaParam = req.params.criticaId;
		const idLibro = parseInt(Array.isArray(idLibroParam) ? idLibroParam[0] : idLibroParam);
		const idCritica = parseInt(Array.isArray(idCriticaParam) ? idCriticaParam[0] : idCriticaParam);
		if (isNaN(idLibro) || isNaN(idCritica)) {
			return res.status(400).json({ error: "Faltan campos obligatorios" });
		}
		const afectados = await conexionAbierta.borrarRegistro("libro_critica", {
			id_libro: idLibro,
			id_usuario: idCritica,
		});
		if (afectados === 0) {
			return res.status(404).json({ error: "Crítica no encontrada" });
		}
		return res.status(200).json({ message: "Crítica borrada exitosamente" });
	} catch (error) {
		console.error("Error al borrar crítica:", error);
		res.status(500).json({ error: "Error al borrar crítica" });
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

export { crearCritica, obtenerCriticasLibro, actualizarCritica, borrarCritica };
