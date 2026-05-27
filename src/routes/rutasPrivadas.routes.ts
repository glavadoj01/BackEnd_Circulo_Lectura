import { Router } from "express";
import { logoutAction } from "../controllers/private/auth.controller.js";
import {
	crearComentarioLista,
	actualizarComentarioLista,
	borrarComentarioLista,
} from "../controllers/private/comentariosLista.controller.js";
import { crearCritica, actualizarCritica, borrarCritica } from "../controllers/private/criticas.controller.js";
import {
	crearLibro,
	actualizarLibro,
	borrarLibro,
	marcarMeGustaLibro,
	quitarMeGustaLibro,
	obtenerEstadoLibroUsuario,
} from "../controllers/private/libros.controller.js";
import { agregarLibroALista, eliminarLibroDeLista } from "../controllers/private/librosLista.controller.js";
import {
	crearLista,
	actualizarLista,
	borrarLista,
	seguirLista,
	dejarSeguirLista,
	marcarMeGustaLista,
	quitarMeGustaLista,
	obtenerEstadoListaUsuario,
} from "../controllers/private/listas.controller.js";
import {
	crearEvento,
	actualizarEvento,
	borrarEvento,
	seguirEvento,
	dejarSeguirEvento,
	marcarMeGustaEvento,
	quitarMeGustaEvento,
	obtenerEstadoEventoUsuario,
} from "../controllers/private/eventos.controller.js";
import {
	obtenerUsuarios,
	obtenerUsuario,
	actualizarUsuario,
	borrarUsuario,
} from "../controllers/private/usuarios.controller.js";
import { requireAdmin, requireAuth } from "../utils/requireAuth.js";
import { crearAutor } from "../controllers/public/autores.controller.js";

const rutasPrivadas = Router();

// Rutas de autenticación
rutasPrivadas.post("/auth/logout", requireAuth, logoutAction);
//! REMINDER
// TODO
rutasPrivadas.post("/admin/panel", requireAdmin);

// Rutas Libro
rutasPrivadas.post("/libro", requireAuth, crearLibro);
rutasPrivadas.put("/libro/:id", requireAuth, actualizarLibro);
rutasPrivadas.delete("/libro/:id", requireAuth, borrarLibro);

rutasPrivadas.post("/autores", requireAuth, crearAutor);

rutasPrivadas.post("/libro/:id/critica", requireAuth, crearCritica);
rutasPrivadas.put("/libro/:id/critica/usuario/:usuarioId", requireAuth, actualizarCritica);
rutasPrivadas.delete("/libro/:id/critica/usuario/:usuarioId", requireAuth, borrarCritica);

// Me gusta libro
rutasPrivadas.post("/libro/:id/me-gusta/usuario/:usuarioId", requireAuth, marcarMeGustaLibro);
rutasPrivadas.delete("/libro/:id/me-gusta/usuario/:usuarioId", requireAuth, quitarMeGustaLibro);
rutasPrivadas.get("/libro/:id/estado/usuario/:usuarioId", requireAuth, obtenerEstadoLibroUsuario);

// Rutas Listas
rutasPrivadas.post("/lista", requireAuth, crearLista);
rutasPrivadas.put("/lista/:id", requireAuth, actualizarLista);
rutasPrivadas.delete("/lista/:id", requireAuth, borrarLista);

rutasPrivadas.post("/lista/:id/comentario", requireAuth, crearComentarioLista);
rutasPrivadas.put("/lista/:id/comentario/:comentarioId", requireAuth, actualizarComentarioLista);
rutasPrivadas.delete("/lista/:id/comentario/:comentarioId", requireAuth, borrarComentarioLista);

rutasPrivadas.post("/lista/:id/libro", requireAuth, agregarLibroALista);
rutasPrivadas.delete("/lista/:id/libro/:libroId", requireAuth, eliminarLibroDeLista);

rutasPrivadas.post("/lista/:id/seguir/usuario/:usuarioId", requireAuth, seguirLista);
rutasPrivadas.delete("/lista/:id/seguir/usuario/:usuarioId", requireAuth, dejarSeguirLista);
rutasPrivadas.post("/lista/:id/me-gusta/usuario/:usuarioId", requireAuth, marcarMeGustaLista);
rutasPrivadas.delete("/lista/:id/me-gusta/usuario/:usuarioId", requireAuth, quitarMeGustaLista);
rutasPrivadas.get("/lista/:id/estado/usuario/:usuarioId", requireAuth, obtenerEstadoListaUsuario);

// Rutas Usuarios
rutasPrivadas.get("/usuarios", requireAdmin, obtenerUsuarios);
rutasPrivadas.put("/usuario/:id", requireAuth, actualizarUsuario);
rutasPrivadas.delete("/usuario/:id", requireAuth, borrarUsuario);

// Rutas Usuarios
rutasPrivadas.get("/usuario/:id", requireAuth, obtenerUsuario);

// Rutas Eventos
rutasPrivadas.post("/evento", requireAuth, crearEvento);
rutasPrivadas.put("/evento/:id", requireAuth, actualizarEvento);
rutasPrivadas.delete("/evento/:id", requireAuth, borrarEvento);
rutasPrivadas.post("/evento/:id/seguir/usuario/:usuarioId", requireAuth, seguirEvento);
rutasPrivadas.delete("/evento/:id/seguir/usuario/:usuarioId", requireAuth, dejarSeguirEvento);
rutasPrivadas.post("/evento/:id/me-gusta/usuario/:usuarioId", requireAuth, marcarMeGustaEvento);
rutasPrivadas.delete("/evento/:id/me-gusta/usuario/:usuarioId", requireAuth, quitarMeGustaEvento);
rutasPrivadas.get("/evento/:id/estado/usuario/:usuarioId", requireAuth, obtenerEstadoEventoUsuario);

export default rutasPrivadas;
