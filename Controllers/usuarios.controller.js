// Importación de servicios
import {
	actualizarUsuarioService,
	crearUsuarioService,
	obtenerUsuariosService,
	borrarUsuarioService,
} from "../Services/usuarios.service.js";

/**
 * Crear un nuevo usuario
 */
async function crearUsuario(req, res) {}

/**
 * Obtener usuarios con/sin filtros de búsqueda
 */
async function obtenerUsuarios(req, res) {}

/**
 * Actualizar un usuario existente
 */
async function actualizarUsuario(req, res) {}

/**
 * Borrar un usuario existente
 */
async function borrarUsuario(req, res) {}

// Exportación de las funciones del controlador
export { crearUsuario, obtenerUsuarios, actualizarUsuario, borrarUsuario };
