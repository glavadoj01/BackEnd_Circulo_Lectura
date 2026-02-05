// Para el servidor Express
import express from "express";
import usuariosRouter from "./Routes/usuarios.routes.js";

// Para la páginas defaults
import path from "path"; // Para redireción de rutas a archivos estáticos

// Asociacion de metodos de express a la variable app
const app = express();
const usuariosRoutes = usuariosRouter;

// Middleware para servir archivos estáticos (HTML, CSS, JS, imágenes) (Explicado por IA)
app.use(express.static(path.resolve("html")));
app.use(express.static(path.resolve("img")));

// Middleware para parsear JSON
// En postman, seleccionar Body -> raw -> JSON => Enviar formato JSON
app.use(express.json());
app.use(usuariosRoutes);

// Para la conexión con MongoDB

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
	console.log("Actualización del Srv 😀");
	console.log("Servidor escuchando en el puerto 3000");
});
