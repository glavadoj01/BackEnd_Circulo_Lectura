import { Router } from 'express';
import { loginAction, logoutAction } from '../controllers/private/auth.controller.js';
import {
  crearComentarioLista,
  actualizarComentarioLista,
  borrarComentarioLista,
} from '../controllers/private/comentariosLista.controller.js';
import {
  crearCritica,
  actualizarCritica,
  borrarCritica,
} from '../controllers/private/criticas.controller.js';
import {
  crearLibro,
  actualizarLibro,
  borrarLibro,
} from '../controllers/private/libros.controller.js';
import {
  agregarLibroALista,
  eliminarLibroDeLista,
} from '../controllers/private/librosLista.controller.js';
import {
  crearLista,
  actualizarLista,
  borrarLista,
} from '../controllers/private/listas.controller.js';
import {
  crearEvento,
  actualizarEvento,
  borrarEvento,
} from '../controllers/private/eventos.controller.js';
import {
  obtenerUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  borrarUsuario,
  obtenerLibrosLeidosUsuario,
  obtenerLibrosPendientesUsuario,
  obtenerListasCreadasUsuario,
  obtenerListasSeguidasUsuario,
  obtenerEventosCreadosUsuario,
  obtenerEventosAsistidosUsuario,
  obtenerCriticasUsuario,
} from '../controllers/private/usuarios.controller.js';
import { requireAdmin, requireAuth } from '../utils/requireAuth.js';

const rutasPrivadas = Router();

// Rutas de autenticación
rutasPrivadas.post('/auth/login', requireAuth, loginAction);
rutasPrivadas.post('/auth/logout', requireAuth, logoutAction);
rutasPrivadas.post('/admin/panel', requireAdmin);

// Rutas Libro
rutasPrivadas.post('/libro', requireAuth, crearLibro);
rutasPrivadas.put('/libro/:id', requireAuth, actualizarLibro);
rutasPrivadas.delete('/libro/:id', requireAuth, borrarLibro);

rutasPrivadas.post('/libro/:id/critica', requireAuth, crearCritica);
rutasPrivadas.put('/libro/:id/critica/usuario/:usuarioId', requireAuth, actualizarCritica);
rutasPrivadas.delete('/libro/:id/critica/usuario/:usuarioId', requireAuth, borrarCritica);

// Rutas Listas
rutasPrivadas.post('/lista', requireAuth, crearLista);
rutasPrivadas.put('/lista/:id', requireAuth, actualizarLista);
rutasPrivadas.delete('/lista/:id', requireAuth, borrarLista);

rutasPrivadas.post('/lista/:id/comentario', requireAuth, crearComentarioLista);
rutasPrivadas.put('/lista/:id/comentario/:comentarioId', requireAuth, actualizarComentarioLista);
rutasPrivadas.delete('/lista/:id/comentario/:comentarioId', requireAuth, borrarComentarioLista);

rutasPrivadas.post('/lista/:id/libro', requireAuth, agregarLibroALista);
rutasPrivadas.delete('/lista/:id/libro/:libroId', requireAuth, eliminarLibroDeLista);

// Rutas Usuarios
rutasPrivadas.get('/usuarios', requireAuth, obtenerUsuarios);
rutasPrivadas.get('/usuario/:id', requireAuth, obtenerUsuario);

rutasPrivadas.post('/usuario', requireAuth, crearUsuario);
rutasPrivadas.put('/usuario/:id', requireAuth, actualizarUsuario);
rutasPrivadas.delete('/usuario/:id', requireAuth, borrarUsuario);

// Datos relacionados Usuario
rutasPrivadas.get('/usuario/libros/leidos/:id', requireAuth, obtenerLibrosLeidosUsuario);
rutasPrivadas.get('/usuario/libros/pendientes/:id', requireAuth, obtenerLibrosPendientesUsuario);
rutasPrivadas.get('/usuario/listas/creadas/:id', requireAuth, obtenerListasCreadasUsuario);
rutasPrivadas.get('/usuario/listas/seguidas/:id', requireAuth, obtenerListasSeguidasUsuario);
rutasPrivadas.get('/usuario/eventos/creados/:id', requireAuth, obtenerEventosCreadosUsuario);
rutasPrivadas.get('/usuario/eventos/asistidos/:id', requireAuth, obtenerEventosAsistidosUsuario);
rutasPrivadas.get('/usuario/criticas/:id', requireAuth, obtenerCriticasUsuario);

// Rutas Eventos
rutasPrivadas.post('/evento', requireAuth, crearEvento);
rutasPrivadas.put('/evento/:id', requireAuth, actualizarEvento);
rutasPrivadas.delete('/evento/:id', requireAuth, borrarEvento);

export default rutasPrivadas;
