import { Router } from 'express';
import {
  crearUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  borrarUsuario,
} from '../Controllers/usuarios.controller.js';
import {
  actualizarLibro,
  borrarLibro,
  crearLibro,
  obtenerLibros,
  obtenerLibroId,
  obtenerLibrosTotal,
} from '../Controllers/libros.controller.js';
import { obtenerGeneros } from '../Controllers/generos.controller.js';
import { obtenerAutores } from '../Controllers/autores.controller.js';
import { obtenerYears } from '../Controllers/years.controller.js';
import {
  crearLista,
  obtenerListas,
  obtenerListaId,
  actualizarLista,
  borrarLista,
  obtenerListasTotal,
} from '../Controllers/listas.controller.js';
import {
  actualizarCritica,
  borrarCritica,
  crearCritica,
  obtenerCriticasLibro,
} from '../Controllers/criticas.controller.js';
import { resetearAPI } from '../Controllers/resetAPI.controller.js';
import { respuestaError } from '../Utils/validationMessages.utils.js';
import {
  crearComentarioLista,
  obtenerComentariosLista,
  actualizarComentarioLista,
  borrarComentarioLista,
} from '../Controllers/comentariosLista.controller.js';
import {
  agregarLibroALista,
  obtenerLibrosDeLista,
  eliminarLibroDeLista,
} from '../Controllers/librosLista.controller.js';

// Creación del router Express para manejar las rutas de la API
const conexionRouter = Router();

conexionRouter.get('/resetAPI', resetearAPI);

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
conexionRouter.post('/usuario', crearUsuario);
conexionRouter.get('/usuarios', obtenerUsuarios);
conexionRouter.put('/usuario/:id', actualizarUsuario);
conexionRouter.delete('/usuario/:id', borrarUsuario);

// Redirección/Respuesta de rutas no definidas
conexionRouter.use((_req, res) => {
  respuestaError(res, 404, 'RUTA_NO_ENCONTRADA');
});

export default conexionRouter;
