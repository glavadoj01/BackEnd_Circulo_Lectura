import { Router } from 'express';
import { obtenerAutores } from '../controllers/autores.controller.js';
import {
  crearComentarioLista,
  obtenerComentariosLista,
  actualizarComentarioLista,
  borrarComentarioLista,
} from '../controllers/comentariosLista.controller.js';
import {
  crearCritica,
  obtenerCriticasLibro,
  actualizarCritica,
  borrarCritica,
} from '../controllers/criticas.controller.js';
import { obtenerGeneros } from '../controllers/generos.controller.js';
import {
  crearLibro,
  obtenerLibroId,
  obtenerLibros,
  obtenerLibrosTotal,
  actualizarLibro,
  borrarLibro,
} from '../controllers/libros.controller.js';
import {
  agregarLibroALista,
  obtenerLibrosDeLista,
  eliminarLibroDeLista,
} from '../controllers/librosLista.controller.js';
import {
  crearLista,
  obtenerListaId,
  obtenerListas,
  obtenerListasTotal,
  actualizarLista,
  borrarLista,
} from '../controllers/listas.controller.js';
import { resetearAPI } from '../controllers/resetAPI.controller.js';
import {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  borrarUsuario,
  obtenerLibrosLeidosUsuario,
  obtenerLibrosPendientesUsuario,
  obtenerListasSeguidasUsuario,
  obtenerEventosAsistidosUsuario,
  obtenerCriticasUsuario,
  obtenerListasCreadasUsuario,
  obtenerEventosCreadosUsuario,
  obtenerNombreUsuario,
} from '../controllers/usuarios.controller.js';
import { obtenerYears } from '../controllers/years.controller.js';
import { respuestaError } from '../utils/validationMessages.utils.js';
import {
  obtenerAsistentesEvento,
  obtenerComentariosEvento,
  obtenerEventoId,
  obtenerLibrosEvento,
  obtenerEventos,
  obtenerTotalEventos,
} from '../controllers/eventos.controller.js';
import { loginController } from '../controllers/auth.controller.js';

// Creación del router Express para manejar las rutas de la API
const conexionRouter = Router();

conexionRouter.get('/resetAPI', resetearAPI);
conexionRouter.post('/auth/login', loginController);

// Definicion de las rutas para libros
conexionRouter.post('/libro', crearLibro);
conexionRouter.get('/libro/:id', obtenerLibroId);
conexionRouter.get('/libros', obtenerLibros);
conexionRouter.get('/libros/total', obtenerLibrosTotal);
conexionRouter.put('/libro/:id', actualizarLibro);
conexionRouter.delete('/libro/:id', borrarLibro);

// Definición de rutas para géneros, autores y años (filtros)
conexionRouter.get('/generos', obtenerGeneros);
conexionRouter.get('/autores', obtenerAutores);
conexionRouter.get('/years', obtenerYears);

// Definición de rutas para criticas/reseñas de libros
conexionRouter.post('/libro/:id/critica', crearCritica);
conexionRouter.get('/libro/:id/criticas', obtenerCriticasLibro);
conexionRouter.put('/libro/:id/critica/usuario/:usuarioId', actualizarCritica);
conexionRouter.delete('/libro/:id/critica/usuario/:usuarioId', borrarCritica);

// Definicion de las rutas para listas
conexionRouter.post('/lista', crearLista);
conexionRouter.get('/lista/:id', obtenerListaId);
conexionRouter.get('/listas', obtenerListas);
conexionRouter.get('/listas/total', obtenerListasTotal);
conexionRouter.put('/lista/:id', actualizarLista);
conexionRouter.delete('/lista/:id', borrarLista);

// Definicion de rutas para comentarios de listas
conexionRouter.post('/lista/:id/comentario', crearComentarioLista);
conexionRouter.get('/lista/:id/comentarios', obtenerComentariosLista);
conexionRouter.put('/lista/:id/comentario/:comentarioId', actualizarComentarioLista);
conexionRouter.delete('/lista/:id/comentario/:comentarioId', borrarComentarioLista);

// Definicion de rutas para contenido de listas
conexionRouter.post('/lista/:id/libro', agregarLibroALista);
conexionRouter.get('/lista/:id/libros', obtenerLibrosDeLista);
conexionRouter.delete('/lista/:id/libro/:libroId', eliminarLibroDeLista);

// Definición de las rutas para usuarios
conexionRouter.get('/usuarios', obtenerUsuarios);
conexionRouter.get('/usuario/nombre/:id', obtenerNombreUsuario);
conexionRouter.get('/usuario/:id', obtenerUsuario);
conexionRouter.post('/usuario', crearUsuario);
conexionRouter.put('/usuario/:id', actualizarUsuario);
conexionRouter.delete('/usuario/:id', borrarUsuario);

// Datos relacionados Usuario
conexionRouter.get('/usuario/libros/leidos/:id', obtenerLibrosLeidosUsuario);
conexionRouter.get('/usuario/libros/pendientes/:id', obtenerLibrosPendientesUsuario);
conexionRouter.get('/usuario/listas/creadas/:id', obtenerListasCreadasUsuario);
conexionRouter.get('/usuario/listas/seguidas/:id', obtenerListasSeguidasUsuario);
conexionRouter.get('/usuario/eventos/creados/:id', obtenerEventosCreadosUsuario);
conexionRouter.get('/usuario/eventos/asistidos/:id', obtenerEventosAsistidosUsuario);
conexionRouter.get('/usuario/criticas/:id', obtenerCriticasUsuario);

// Datos relacionados Eventos
conexionRouter.get('/eventos', obtenerEventos);
conexionRouter.get('/eventos/total', obtenerTotalEventos);
conexionRouter.get('/evento/:id', obtenerEventoId);
conexionRouter.get('/evento/:id/asistentes', obtenerAsistentesEvento);
conexionRouter.get('/evento/:id/libros', obtenerLibrosEvento);
conexionRouter.get('/evento/:id/comentarios', obtenerComentariosEvento);

// Redirección/Respuesta de rutas no definidas
conexionRouter.use((_req, res) => {
  respuestaError(res, 404, 'RUTA_NO_ENCONTRADA');
});

export default conexionRouter;
