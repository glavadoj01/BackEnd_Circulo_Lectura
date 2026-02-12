import { Router } from "express";
import { crearUsuario, obtenerUsuarios, actualizarUsuario, borrarUsuario } from "../Controllers/usuarios.controller.js";
import {
	actualizarLibro,
	borrarLibro,
	crearLibro,
	obtenerLibros,
	obtenerLibroId,
} from "../Controllers/libros.controller.js";
import {
	actualizarCritica,
	borrarCritica,
	crearCritica,
	obtenerCriticasLibro,
} from "../Controllers/criticas.controller.js";
import { resetearAPI } from "../Controllers/resetAPI.controller.js";

// Creación del router Express para manejar las rutas de la API
const conexionRouter = Router();

conexionRouter.get("/resetAPI", resetearAPI);

// Definición de las rutas para usuarios
conexionRouter.post("/usuario", crearUsuario);
conexionRouter.get("/usuarios", obtenerUsuarios);
conexionRouter.put("/usuario/:id", actualizarUsuario);
conexionRouter.delete("/usuario/:id", borrarUsuario);

// Definicion de las rutas para libros
conexionRouter.post("/libro", crearLibro);
conexionRouter.get("/libro/:id", obtenerLibroId);
conexionRouter.get("/libros", obtenerLibros);
conexionRouter.put("/libro/:id", actualizarLibro);
conexionRouter.delete("/libro/:id", borrarLibro);

// Definición de rutas para criticas/reseñas de libros
conexionRouter.post("/libro/:id/critica", crearCritica);
conexionRouter.get("/libro/:id/criticas", obtenerCriticasLibro);
conexionRouter.put("/libro/:id/critica/:criticaId", actualizarCritica);
conexionRouter.delete("/libro/:id/critica/:criticaId", borrarCritica);

// Redirección/Respuesta de rutas no definidas
conexionRouter.use((_req, res) => {
	res.status(404).json({ error: "Ruta no encontrada" });
});

export default conexionRouter;
