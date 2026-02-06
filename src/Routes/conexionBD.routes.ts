import { Router } from "express";
import { crearUsuario, obtenerUsuarios, actualizarUsuario, borrarUsuario } from "../Controllers/usuarios.controller.js";
import {
	actualizarLibro,
	borrarLibro,
	crearLibro,
	obtenerLibros,
	obtenerLibroId,
} from "../Controllers/libros.controller.js";

// Creación del router de usuarios
const conexionRouter = Router();

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

// Redirección de rutas no definidas a la página de inicio
conexionRouter.use((_req, res) => {
	res.status(404).json({ error: "Ruta no encontrada" });
});

export default conexionRouter;
