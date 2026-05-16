import { Request, Response } from 'express';
import { ConexionBD } from '../Services/conexionBD.service.js';
import { LibroBD } from '../Interfaces/modelosBD/modelosBD.js';
import { parsePositiveInt } from '../Utils/validation.utils.js';
import { respuestaOk, respuestaError } from '../Utils/validationMessages.utils.js';
import { ConexionLibros } from '../Services/conexionLibros.service.js';

/**
 * Valida los datos de un autor.
 * @param autor Objeto autor a validar.
 * @returns {boolean} true si es válido, false si no.
 */
function validarAutor(autor: any): boolean {
  return (
    autor &&
    typeof autor.nombre_autor === 'string' &&
    autor.nombre_autor.trim().length > 1 &&
    typeof autor.apellido_autor === 'string' &&
    autor.apellido_autor.trim().length > 1
  );
}

/**
 * Valida los datos de un género.
 * @param genero Objeto género a validar.
 * @returns {boolean} true si es válido, false si no.
 */
function validarGenero(genero: any): boolean {
  return (
    genero && typeof genero.nombre_genero === 'string' && genero.nombre_genero.trim().length > 1
  );
}

/**
 * Procesa autores: busca por nombre y apellido, crea si no existe, y devuelve los ids.
 * @param conexion Instancia de ConexionBD.
 * @param autores Array de autores.
 * @returns Promise<number[]> Array de ids de autores.
 */
async function procesarAutores(conexion: ConexionBD, autores: any[]): Promise<number[]> {
  const ids: number[] = [];
  for (const autor of autores) {
    if (!validarAutor(autor)) throw new Error('AUTOR_DATOS_INVALIDOS');
    const { nombre_autor, apellido_autor, pais_autor } = autor;
    let encontrado = (
      await conexion.listarRegistros('autor', { nombre_autor, apellido_autor }, '', 1, 'id_autor')
    ).datos[0];
    if (encontrado === undefined) {
      const idAutor = (
        await conexion.insertarRegistro('autor', {
          nombre_autor,
          apellido_autor,
          pais_autor: pais_autor || '',
          esUsuario: false,
        })
      ).datos.insertId;
      ids.push(idAutor);
    } else {
      ids.push(encontrado.id_autor);
    }
  }
  return ids;
}

/**
 * Procesa géneros: busca por nombre, crea si no existe, y devuelve los ids.
 * @param conexion Instancia de ConexionBD.
 * @param generos Array de géneros.
 * @returns Promise<number[]> Array de ids de géneros.
 */
async function procesarGeneros(conexion: ConexionBD, generos: any[]): Promise<number[]> {
  const ids: number[] = [];
  for (const genero of generos) {
    if (!validarGenero(genero)) throw new Error('GENERO_DATOS_INVALIDOS');
    const { nombre_genero } = genero;
    let encontrado = (
      await conexion.listarRegistros('genero', { nombre_genero }, '', 1, 'id_genero')
    ).datos[0];
    if (encontrado === undefined) {
      const idGenero = (
        await conexion.insertarRegistro('genero', {
          nombre_genero,
        })
      ).datos.insertId;
      ids.push(idGenero);
    } else {
      ids.push(encontrado.id_genero);
    }
  }
  return ids;
}

/**
 * Crear un nuevo libro.
 * @param req Objeto de solicitud de Express, con los datos del libro a crear en req.body.libro, y arrays de autores en req.body.autores y géneros en req.body.generos.
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON con el ID del libro creado y los datos ingresados, o un error si ocurrió algún problema.
 */
async function crearLibro(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const datos: Partial<LibroBD> = req.body.libro ? req.body.libro : req.body;
    if (
      !datos.titulo_libro ||
      typeof datos.titulo_libro !== 'string' ||
      datos.titulo_libro.trim().length < 2 ||
      !datos.id_idioma_original
    ) {
      return respuestaError(res, 400, 'CAMPOS_OBLIGATORIOS');
    }

    const autores = Array.isArray(req.body.autores) ? req.body.autores : [];
    const generos = Array.isArray(req.body.generos) ? req.body.generos : [];

    conexionAbierta = new ConexionBD();

    const autoresIds = await procesarAutores(conexionAbierta, autores);
    const generosIds = await procesarGeneros(conexionAbierta, generos);

    const insertId = (await conexionAbierta.insertarRegistro('libro', datos)).datos.insertId;

    for (const idAutor of autoresIds) {
      await conexionAbierta.insertarRegistro('libro_autor', {
        id_libro: insertId,
        id_autor: idAutor,
        autorPr: false,
      });
    }
    for (const idGenero of generosIds) {
      await conexionAbierta.insertarRegistro('libro_genero', {
        id_libro: insertId,
        id_genero: idGenero,
      });
    }

    return respuestaOk(res, 201, 'LIBRO_CREADO_OK', {
      id_libro: insertId,
      ...datos,
      autores: autoresIds,
      generos: generosIds,
    });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_CREAR_LIBRO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Obtener libros con/sin filtros de búsqueda y paginación.
 * @param req Objeto de solicitud de Express, con posibles filtros en req.query (titulo, autor, genero, page, limit).
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON con un array de libros que coinciden con los filtros, o un error si ocurrió algún problema.
 */
async function obtenerLibros(req: Request, res: Response) {
  let conexionAbierta: ConexionLibros | null = null;
  try {
    const q = req.query;

    const page = q.page ? Number(q.page) : 1;
    const limit = q.limit ? Math.min(Number(q.limit), 50) : 20;
    if (Number.isNaN(page) || page < 1 || Number.isNaN(limit) || limit < 1) {
      return respuestaError(res, 400, 'PARAMETROS_PAGINACION_INVALIDOS');
    }

    // Filtros permitidos
    const filtros: {
      titulo?: string;
      generos?: number[];
      autores?: number[];
      years?: number[];
      valoraciones?: number[];
    } = {};

    if (typeof q.titulo === 'string') filtros.titulo = q.titulo;
    if (typeof q.generos === 'string')
      filtros.generos = q.generos.split(',').map(Number).filter(Number.isFinite);
    if (typeof q.autores === 'string')
      filtros.autores = q.autores.split(',').map(Number).filter(Number.isFinite);
    if (typeof q.years === 'string')
      filtros.years = q.years.split(',').map(Number).filter(Number.isFinite);
    if (typeof q.valoraciones === 'string')
      filtros.valoraciones = q.valoraciones.split(',').map(Number).filter(Number.isFinite);

    conexionAbierta = new ConexionLibros();
    const libros = await conexionAbierta.obtenerCatalogoLibros(filtros, page, limit);

    return respuestaOk(res, 200, 'LIBROS_OBTENIDOS_OK', libros);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LIBROS', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Obtener un libro por ID.
 * @param req Objeto de solicitud de Express, con el ID del libro a obtener en req.query.id o req.params.id.
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON con los datos del libro encontrado, incluyendo autores y géneros como arrays, o un error si ocurrió algún problema o si el libro no fue encontrado.
 */
async function obtenerLibroId(req: Request, res: Response) {
  let conexionAbierta: ConexionLibros | null = null;
  try {
    const idRaw = req.query.id ?? req.params.id;
    const id = parsePositiveInt(idRaw);
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }

    conexionAbierta = new ConexionLibros();
    const libro = await conexionAbierta.obtenerDetalleLibro(id);

    if (!libro) {
      return respuestaError(res, 404, 'ERROR_OBTENER_LIBRO');
    }

    // Devuelve autores y géneros como arrays, igual que en la paginación
    return respuestaOk(res, 200, 'LIBRO_OBTENIDO_OK', libro);
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LIBRO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Sincronizar los autores de un libro con los IDs proporcionados.
 * @param conexion Conexión abierta a la base de datos.
 * @param idLibro ID del libro al que se le van a sincronizar los autores.
 * @param autoresIds Array de IDs de autores a sincronizar.
 */
async function sincronizarAutores(conexion: ConexionBD, idLibro: number, autoresIds: number[]) {
  const actuales = (await conexion.listarRegistros('libro_autor', { id_libro: idLibro })).datos;
  const actualesIds = actuales.map((rel: any) => rel.id_autor);

  for (const idAutor of autoresIds) {
    if (!actualesIds.includes(idAutor)) {
      await conexion.insertarRegistro('libro_autor', {
        id_libro: idLibro,
        id_autor: idAutor,
        autorPr: false,
      });
    }
  }

  for (const idActual of actualesIds) {
    if (!autoresIds.includes(idActual)) {
      await conexion.borrarRegistro('libro_autor', {
        id_libro: idLibro,
        id_autor: idActual,
      });
    }
  }
}

/**
 * Sincronizar los géneros de un libro con los IDs proporcionados.
 * @param conexion Conexión abierta a la base de datos.
 * @param idLibro ID del libro al que se le van a sincronizar los géneros.
 * @param generosIds Array de IDs de géneros a sincronizar.
 */
async function sincronizarGeneros(conexion: ConexionBD, idLibro: number, generosIds: number[]) {
  const actuales = (await conexion.listarRegistros('libro_genero', { id_libro: idLibro })).datos;
  const actualesIds = actuales.map((rel: any) => rel.id_genero);

  for (const idGenero of generosIds) {
    if (!actualesIds.includes(idGenero)) {
      await conexion.insertarRegistro('libro_genero', {
        id_libro: idLibro,
        id_genero: idGenero,
      });
    }
  }

  for (const idActual of actualesIds) {
    if (!generosIds.includes(idActual)) {
      await conexion.borrarRegistro('libro_genero', {
        id_libro: idLibro,
        id_genero: idActual,
      });
    }
  }
}

/**
 * Actualizar un libro existente.
 * @param req Objeto de solicitud de Express, con el ID del libro a actualizar en req.params.id o req.body.id_libro, y los datos a actualizar en req.body.libro, además de posibles arrays de autores en req.body.autores y géneros en req.body.generos.
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON indicando si el libro fue actualizado y cuántos registros fueron afectados, o un error si ocurrió algún problema o si el libro no fue encontrado.
 */
async function actualizarLibro(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const idRaw = req.params.id ?? req.body.id_libro;
    const id = parsePositiveInt(idRaw);
    const datos: Partial<LibroBD> =
      typeof req.body.libro === 'object' && req.body.libro !== null ? req.body.libro : req.body;
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }

    conexionAbierta = new ConexionBD();
    const afectados = (await conexionAbierta.actualizarRegistro('libro', datos, { id_libro: id }))
      .datos.affectedRows;
    if (afectados === 0) {
      return respuestaError(res, 404, 'ERROR_OBTENER_LIBRO');
    }

    const autores = Array.isArray(req.body.autores) ? req.body.autores : [];
    const generos = Array.isArray(req.body.generos) ? req.body.generos : [];

    const autoresIds = await procesarAutores(conexionAbierta, autores);
    const generosIds = await procesarGeneros(conexionAbierta, generos);

    if (autoresIds.length > 0) {
      await sincronizarAutores(conexionAbierta, id, autoresIds);
    }

    if (generosIds.length > 0) {
      await sincronizarGeneros(conexionAbierta, id, generosIds);
    }

    return respuestaOk(res, 200, 'LIBRO_ACTUALIZADO_OK', { actualizado: true, afectados });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_ACTUALIZAR_LIBRO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Borrar un libro existente.
 * @param req Objeto de solicitud de Express, con el ID del libro a borrar en req.params.id o req.body.id_libro.
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON indicando si el libro fue borrado y cuántos registros fueron afectados, o un error si ocurrió algún problema.
 */
async function borrarLibro(req: Request, res: Response) {
  let conexionAbierta: ConexionBD | null = null;
  try {
    const idRaw = req.params.id ?? req.body.id_libro;
    const id = parsePositiveInt(idRaw);
    if (Number.isNaN(id)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }

    conexionAbierta = new ConexionBD();
    const afectados = (await conexionAbierta.borrarRegistro('libro', { id_libro: id })).datos
      .affectedRows;
    if (afectados === 0) {
      return respuestaError(res, 404, 'ERROR_OBTENER_LIBRO');
    }
    return respuestaOk(res, 200, 'LIBRO_BORRADO_OK', { borrado: true, afectados });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_BORRAR_LIBRO', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/**
 * Obtener el total de libros.
 * @param _req Objeto de solicitud de Express (no se usa).
 * @param res Objeto de respuesta de Express, se enviará un JSON con el resultado de la operación.
 * @returns JSON con el total de libros en la base de datos.
 */
async function obtenerLibrosTotal(req: Request, res: Response) {
  let conexionAbierta: ConexionLibros | null = null;
  try {
    conexionAbierta = new ConexionLibros();

    const filtros = {
      titulo: typeof req.query.titulo === 'string' ? req.query.titulo : undefined,
      generos:
        typeof req.query.generos === 'string'
          ? req.query.generos.split(',').map(Number)
          : undefined,
      autores:
        typeof req.query.autores === 'string'
          ? req.query.autores.split(',').map(Number)
          : undefined,
      years:
        typeof req.query.years === 'string' ? req.query.years.split(',').map(Number) : undefined,
      valoraciones:
        typeof req.query.valoraciones === 'string'
          ? req.query.valoraciones.split(',').map(Number)
          : undefined,
    };

    const total = await conexionAbierta.obtenerTotalLibrosFiltrado(filtros);

    return respuestaOk(res, 200, 'TOTAL_LIBROS_OBTENIDO_OK', { total: total });
  } catch (error: any) {
    return respuestaError(res, 500, 'ERROR_TOTAL_LIBROS', error.message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

export {
  crearLibro,
  obtenerLibros,
  actualizarLibro,
  borrarLibro,
  obtenerLibroId,
  obtenerLibrosTotal,
};
