import { Router } from "express";
import { obtenerAutores } from "../controllers/public/autores.controller.js";
import { obtenerComentariosLista } from "../controllers/public/comentariosLista.controller.js";
import { obtenerCriticasLibro } from "../controllers/public/criticas.controller.js";
import { obtenerGeneros } from "../controllers/public/generos.controller.js";
import {
	obtenerIdiomas,
	obtenerLibroId,
	obtenerLibros,
	obtenerLibrosTotal,
} from "../controllers/public/libros.controller.js";
import { obtenerLibrosDeLista } from "../controllers/public/librosLista.controller.js";
import { obtenerListaId, obtenerListas, obtenerListasTotal } from "../controllers/public/listas.controller.js";
import { resetearAPI } from "../controllers/public/resetAPI.controller.js";
import { crearUsuario, obtenerNombreUsuario, obtenerUsuario } from "../controllers/public/usuarios.controller.js";
import { obtenerYears } from "../controllers/public/years.controller.js";
import {
	obtenerAsistentesEvento,
	obtenerComentariosEvento,
	obtenerEventoId,
	obtenerLibrosEvento,
	obtenerEventos,
	obtenerTotalEventos,
} from "../controllers/public/eventos.controller.js";
import { loginAction } from "../controllers/private/auth.controller.js";
import {
	obtenerLibrosLeidosUsuario,
	obtenerLibrosPendientesUsuario,
	obtenerListasCreadasUsuario,
	obtenerListasSeguidasUsuario,
	obtenerEventosCreadosUsuario,
	obtenerEventosAsistidosUsuario,
	obtenerCriticasUsuario,
} from "../controllers/private/usuarios.controller.js";

// Creación del router Express para manejar las rutas de la API
const rutasConexionBD = Router();
rutasConexionBD.get("/resetAPI", resetearAPI);
rutasConexionBD.post("/auth/login", loginAction);
rutasConexionBD.post("/usuario", crearUsuario);

// Definicion de las rutas para libros
rutasConexionBD.get("/libros", obtenerLibros);
rutasConexionBD.get("/libros/total", obtenerLibrosTotal);
rutasConexionBD.get("/libro/:id", obtenerLibroId);

// Definición de rutas para criticas/reseñas de libros
rutasConexionBD.get("/libro/:id/criticas", obtenerCriticasLibro);

// Definición de rutas para géneros, autores y años (filtros)
rutasConexionBD.get("/idiomas", obtenerIdiomas);
rutasConexionBD.get("/generos", obtenerGeneros);
rutasConexionBD.get("/autores", obtenerAutores);
rutasConexionBD.get("/years", obtenerYears);

// Definicion de las rutas para listas
rutasConexionBD.get("/listas", obtenerListas);
rutasConexionBD.get("/listas/total", obtenerListasTotal);
rutasConexionBD.get("/lista/:id", obtenerListaId);

// Definición de rutas para comentarios y contenido de lista
rutasConexionBD.get("/lista/:id/comentarios", obtenerComentariosLista);
rutasConexionBD.get("/lista/:id/libros", obtenerLibrosDeLista);

// Definición de las rutas para usuarios
rutasConexionBD.get("/usuario/nombre/:id", obtenerNombreUsuario);

// Datos relacionados Eventos
rutasConexionBD.get("/eventos", obtenerEventos);
rutasConexionBD.get("/eventos/total", obtenerTotalEventos);
rutasConexionBD.get("/evento/:id", obtenerEventoId);
rutasConexionBD.get("/evento/:id/asistentes", obtenerAsistentesEvento);
rutasConexionBD.get("/evento/:id/libros", obtenerLibrosEvento);
rutasConexionBD.get("/evento/:id/comentarios", obtenerComentariosEvento);

// Datos relacionados Usuario
// Rutas Usuarios
rutasConexionBD.get("/usuario/:id", obtenerUsuario);
rutasConexionBD.get("/usuario/libros/leidos/:id", obtenerLibrosLeidosUsuario);
rutasConexionBD.get("/usuario/libros/pendientes/:id", obtenerLibrosPendientesUsuario);
rutasConexionBD.get("/usuario/listas/creadas/:id", obtenerListasCreadasUsuario);
rutasConexionBD.get("/usuario/listas/seguidas/:id", obtenerListasSeguidasUsuario);
rutasConexionBD.get("/usuario/eventos/creados/:id", obtenerEventosCreadosUsuario);
rutasConexionBD.get("/usuario/eventos/asistidos/:id", obtenerEventosAsistidosUsuario);
rutasConexionBD.get("/usuario/criticas/:id", obtenerCriticasUsuario);

export default rutasConexionBD;
