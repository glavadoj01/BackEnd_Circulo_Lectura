import express from "express";
import { corsConfig } from "../config/cors.js";
import { authMiddleware } from "../utils/authMiddleware.js";
import rutasConexionBD from "../routes/rutasConexionBD.routes.js";
import rutaDefault from "../routes/rutaDefault.routes.js";
import rutasPrivadas from "../routes/rutasPrivadas.routes.js";

/**
 * Crea y configura una instancia de servidor Express con middleware para CORS y rutas definidas.
 * @returns Una instancia de Express configurada para manejar solicitudes HTTP.
 */
export function crearServidor(): express.Express {
	// Crear una instancia de Express
	const app = express();
	// Middleware para parsear JSON
	app.use(express.json());
	// Habilitar CORS con la configuración personalizada
	app.use(corsConfig);
	// Registrar las rutas Públicas del router de conexión a la base de datos
	app.use(rutasConexionBD);
	// Middleware de autenticación para proteger rutas
	app.use(authMiddleware);
	// Registrar las rutas protegidas del router de conexión a la base de datos
	app.use(rutasPrivadas);
	// Registrar el router para rutas no definidas (ruta por defecto)
	app.use(rutaDefault);
	// Retornar la instancia de la aplicación Express configurada
	return app;
}
