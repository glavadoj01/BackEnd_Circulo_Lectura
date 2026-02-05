import { Router } from "express";
import { crearUsuario, actualizarUsuario, obtenerUsuarios, borrarUsuario } from "../Controllers/usuarios.controller.js";
import path from "path";

// Creación del router de usuarios
const usuariosRouter = Router();

// Definición de las rutas para usuarios
usuariosRouter.post("/usuarios", crearUsuario);

usuariosRouter.get("/usuarios", obtenerUsuarios);

usuariosRouter.put("/usuarios/:id", actualizarUsuario);

usuariosRouter.delete("/usuarios/:id", borrarUsuario);

// Ruta de inicio
usuariosRouter.get("/", (_req, res) => {
	res.sendFile(path.resolve("./html/inicio.html"));
});

// Redirección de rutas no definidas a la página de inicio
usuariosRouter.use((_req, res) => {
	res.status(301).redirect("/");
});

export default usuariosRouter;
