// Para el servidor Express
import express from "express";
import conexionRouter from "./Routes/conexionBD.routes.js";
import * as dotenv from "dotenv"; // Para gestion y carga de credenciales desde archivos .env
import cors from "cors"; // Para habilitar CORS y permitir peticiones desde el frontend
// Para la páginas defaults

// Asociacion de metodos de express a la variable app
const app = express();
dotenv.config({ path: "src/env/.env" });
const rutas = conexionRouter;

// Habilita CORS solo para el frontend en localhost:4200
app.use(
	cors({
		origin: "http://localhost:4200",
	}),
);

// Middleware para parsear JSON
// En postman, seleccionar Body -> raw -> JSON => Enviar formato JSON
app.use(express.json());
app.use(rutas);

// Para la conexión con MongoDB

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
	console.log("Actualización del Srv 😀");
	console.log("Servidor escuchando en el puerto 3000");
});
