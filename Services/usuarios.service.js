import { Usuario } from "../Models/Usuario.model.js";

/**
 * Crear un nuevo usuario
 */
async function crearUsuarioService(datosUsuario) {}

/**
 * Obtener usuarios con/sin filtros de búsqueda
 */
async function obtenerUsuariosService(filtros) {}

/**
 * Actualizar un usuario existente
 */
async function actualizarUsuarioService(id, datosActualizados) {}

/**
 * Borrar un usuario por su ID
 */
async function borrarUsuarioService(id) {}

// Exportación de las funciones del servicio
export { crearUsuarioService, obtenerUsuariosService, actualizarUsuarioService, borrarUsuarioService };
