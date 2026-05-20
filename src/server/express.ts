import express from 'express';
import { corsConfig } from '../config/cors.js';
import conexionRouter from '../routes/conexionBD.routes.js';
import { authMiddleware } from '../utils/authMiddleware.js';

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
  // Middleware de autenticación para proteger rutas
  app.use(authMiddleware);
  // Registrar las rutas del router de conexión a la base de datos
  app.use(conexionRouter);
  // Retornar la instancia de la aplicación Express configurada
  return app;
}
