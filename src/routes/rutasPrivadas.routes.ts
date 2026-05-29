import { Router } from "express";
import { logoutAction } from "../controllers/private/auth.controller.js";
import {
	crearComentarioLista,
	actualizarComentarioLista,
	borrarComentarioLista,
} from "../controllers/private/comentariosLista.controller.js";
import {
	actualizarComentarioEvento,
	borrarComentarioEvento,
	crearComentarioEvento,
} from "../controllers/private/comentariosEvento.controller.js";
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
	eliminarLibrosDeEvento,
	agregarLibrosAEvento,
} from "../controllers/private/eventos.controller.js";
import { obtenerUsuarios, actualizarUsuario, borrarUsuario } from "../controllers/private/usuarios.controller.js";
import { requireAdmin, requireAuth } from "../utils/requireAuth.js";
import { crearAutor } from "../controllers/public/autores.controller.js";

const rutasPrivadas = Router();

// Rutas de autenticación
rutasPrivadas.post("/auth/logout/usuario/:usuarioId", requireAuth, logoutAction);
//! REMINDER
// TODO
rutasPrivadas.post("/admin/panel", requireAdmin);

// Rutas Libro
rutasPrivadas.post("/libro", requireAuth, crearLibro);
rutasPrivadas.put("/libro/:id/usuario/:usuarioId", requireAuth, actualizarLibro);
rutasPrivadas.delete("/libro/:id/usuario/:usuarioId", requireAuth, borrarLibro);

rutasPrivadas.post("/autores/usuario/:usuarioId", requireAuth, crearAutor);

rutasPrivadas.post("/libro/:id/critica/usuario/:usuarioId", requireAuth, crearCritica);
rutasPrivadas.put("/libro/:id/critica/usuario/:usuarioId", requireAuth, actualizarCritica);
rutasPrivadas.delete("/libro/:id/critica/usuario/:usuarioId", requireAuth, borrarCritica);

// Me gusta libro
rutasPrivadas.post("/libro/:id/me-gusta/usuario/:usuarioId", requireAuth, marcarMeGustaLibro);
rutasPrivadas.delete("/libro/:id/me-gusta/usuario/:usuarioId", requireAuth, quitarMeGustaLibro);
rutasPrivadas.get("/libro/:id/estado/usuario/:usuarioId", requireAuth, obtenerEstadoLibroUsuario);

// Rutas Listas
rutasPrivadas.post("/lista/usuario/:usuarioId", requireAuth, crearLista);
rutasPrivadas.put("/lista/:id/usuario/:usuarioId", requireAuth, actualizarLista);
rutasPrivadas.delete("/lista/:id/usuario/:usuarioId", requireAuth, borrarLista);

rutasPrivadas.post("/lista/:id/comentario/usuario/:usuarioId", requireAuth, crearComentarioLista);
rutasPrivadas.put("/lista/:id/comentario/:comentarioId/usuario/:usuarioId", requireAuth, actualizarComentarioLista);
rutasPrivadas.delete("/lista/:id/comentario/:comentarioId/usuario/:usuarioId", requireAuth, borrarComentarioLista);

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

// Rutas Eventos
rutasPrivadas.post("/evento/usuario/:usuarioId", requireAuth, crearEvento);
rutasPrivadas.put("/evento/:id/usuario/:usuarioId", requireAuth, actualizarEvento);
rutasPrivadas.delete("/evento/:id/usuario/:usuarioId", requireAuth, borrarEvento);

rutasPrivadas.post("/evento/:id/comentario/usuario/:usuarioId", requireAuth, crearComentarioEvento);
rutasPrivadas.put("/evento/:id/comentario/:comentarioId/usuario/:usuarioId", requireAuth, actualizarComentarioEvento);
rutasPrivadas.delete("/evento/:id/comentario/:comentarioId/usuario/:usuarioId", requireAuth, borrarComentarioEvento);

rutasPrivadas.post("/evento/:id/seguir/usuario/:usuarioId", requireAuth, seguirEvento);
rutasPrivadas.delete("/evento/:id/seguir/usuario/:usuarioId", requireAuth, dejarSeguirEvento);
rutasPrivadas.post("/evento/:id/me-gusta/usuario/:usuarioId", requireAuth, marcarMeGustaEvento);
rutasPrivadas.delete("/evento/:id/me-gusta/usuario/:usuarioId", requireAuth, quitarMeGustaEvento);
rutasPrivadas.get("/evento/:id/estado/usuario/:usuarioId", requireAuth, obtenerEstadoEventoUsuario);

rutasPrivadas.post("/eventos/:id/libros/agregar/idUsuario/:usuarioId", requireAuth, agregarLibrosAEvento);
rutasPrivadas.delete("/eventos/:id/libros/eliminar/idUsuario/:usuarioId", requireAuth, eliminarLibrosDeEvento);

export default rutasPrivadas;
