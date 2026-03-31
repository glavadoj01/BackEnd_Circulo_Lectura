// Importar modelos y servicio de conexión
import { Request, Response } from 'express';
import { LibroBD } from '../Interfaces/modelosBD/modelosBD.js';
import { ConexionBD } from '../Services/conexionBD.service.js';
import { parsePositiveInt } from '../Utils/validation.utils.js';
import { respuestaError, respuestaOk } from '../Utils/validationMessages.utils.js';

/** Crear un nuevo libro
 *
 * @param req - Objeto de solicitud de Express, con los datos del libro a crear en req.body.libro, y opcionalmente arrays de autores en req.body.autores y géneros en req.body.generos
 * @param res - Objeto de respuestaError de Express, se enviará un JSON con el resultado de la operación
 * @returns JSON con el ID del libro creado y los datos ingresados, o un error si ocurrió algún problema
 */
async function crearLibro(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;
  try {
    const datos: Partial<LibroBD> = req.body.libro ? req.body.libro : req.body;
    // Validación mínima
    if (!datos.titulo_libro || !datos.idioma_original) {
      return respuestaError(res, 400, 'CAMPOS_OBLIGATORIOS');
    }

    // Extraer nombres de autores y géneros (strings)
    const autoresNombres: string[] = req.body.autores || [];
    const generosNombres: string[] = req.body.generos || [];
    const autoresIds: number[] = [];
    const generosIds: number[] = [];

    // Procesar autores: buscar o crear
    conexionAbierta = new ConexionBD();
    for (const nombreAutor of autoresNombres) {
      // Buscar autor por nombre
      let autor = (
        await conexionAbierta.listarRegistros(
          'autor',
          { nombre_autor: nombreAutor },
          '',
          1,
          'nombre_autor',
        )
      )[0];
      if (!autor) {
        // Crear autor si no existe (rellenar campos mínimos)
        const idAutor = await conexionAbierta.insertarRegistro('autor', {
          nombre_autor: nombreAutor,
          apellido_autor: '',
          pais_autor: '',
          esUsuario: false,
        });
        autoresIds.push(idAutor);
      } else {
        autoresIds.push(autor.id_autor);
      }
    }

    // Procesar géneros: buscar o crear
    for (const nombreGenero of generosNombres) {
      let genero = (
        await conexionAbierta.listarRegistros(
          'genero',
          { nombre_genero: nombreGenero },
          '',
          1,
          'nombre_genero',
        )
      )[0];
      if (!genero) {
        const idGenero = await conexionAbierta.insertarRegistro('genero', {
          nombre_genero: nombreGenero,
        });
        generosIds.push(idGenero);
      } else {
        generosIds.push(genero.id_genero);
      }
    }

    // Insertar libro principal
    const insertId = await conexionAbierta.insertarRegistro('libro', datos);

    // Insertar autores asociados (si hay)
    for (const idAutor of autoresIds) {
      await conexionAbierta.insertarRegistro('libro_autor', {
        id_libro: insertId,
        id_autor: idAutor,
        autorPr: false,
      });
    }

    // Insertar géneros asociados (si hay)
    for (const idGenero of generosIds) {
      await conexionAbierta.insertarRegistro('libro_genero', {
        id_libro: insertId,
        id_genero: idGenero,
      });
    }

    return respuestaOk(
      res,
      201,
      'LIBRO_CREADO_OK',
      { id_libro: insertId, ...datos, autores: autoresIds, generos: generosIds },
      { incluirMensaje: false },
    );
  } catch (error: unknown) {
    return respuestaError(res, 500, 'ERROR_CREAR_LIBRO', (error as Error).message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/** Obtener libros con/sin filtros de búsqueda
 *
 * @param req - Objeto de solicitud de Express, con posibles filtros en req.query (id, titulo, idioma, etc.)
 * @param res - Objeto de respuestaError de Express, se enviará un JSON con el resultado de la operación
 * @returns JSON con un array de libros que coinciden con los filtros, o un error si ocurrió algún problema
 */
async function obtenerLibros(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;
  try {
    const filtros: Record<string, any> = {};
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const tienePage = typeof pageRaw !== 'undefined';
    const tieneLimit = typeof limitRaw !== 'undefined';

    if (tienePage !== tieneLimit) {
      return respuestaError(res, 400, 'PAGINACION_REQUIERE_AMBOS');
    }

    const page = tienePage ? Number(pageRaw) : 1;
    const limitSolicitado = tieneLimit ? Number(limitRaw) : 0;
    const limitMaximo = 50;

    if (tienePage && (!Number.isInteger(page) || page <= 0)) {
      return respuestaError(res, 400, 'PARAMETRO_PAGE_INVALIDO');
    }

    if (tieneLimit && (!Number.isInteger(limitSolicitado) || limitSolicitado <= 0)) {
      return respuestaError(res, 400, 'PARAMETRO_LIMIT_INVALIDO');
    }

    const limit = tieneLimit ? Math.min(limitSolicitado, limitMaximo) : 0;
    const usarPaginacion = tienePage && tieneLimit;
    const offset = usarPaginacion ? (page - 1) * limit : 0;

    const filtrosPermitidos: Record<string, string> = {
      id: 'id_libro',
      titulo: 'titulo_libro',
      idioma: 'idioma_original',
      isbn: 'codigo_isbn',
      paginas: 'paginas',
      year: 'year_publicacion',
    };
    const queryInterna = new Set(['page', 'limit']);

    for (const [clave, valor] of Object.entries(req.query ?? {})) {
      if (queryInterna.has(clave)) {
        continue;
      }

      const campoBD = filtrosPermitidos[clave];
      if (!campoBD) {
        return respuestaError(res, 400, 'FILTRO_NO_PERMITIDO', {
          detalle: `Filtro no permitido: ${clave}`,
          filtrosPermitidos: Object.keys(filtrosPermitidos),
        });
      }

      filtros[campoBD] = valor;
    }

    // Usar el método específico para obtener libros con autores y géneros
    conexionAbierta = new ConexionBD();
    const librosRaw = await conexionAbierta.listarLibrosConAutoresYGeneros(
      filtros,
      {},
      {},
      'l.id_libro ASC',
      usarPaginacion ? limit : 0,
      offset,
    );
    // Mapear a formato LibroApp
    const libros = librosRaw.map((libro: any) => ({
      ...libro,
      autores: libro.autores
        ? libro.autores.split(',').map((nombre: string) => ({ nombre_autor: nombre }))
        : [],
      generos: libro.generos
        ? libro.generos.split(',').map((nombre: string) => ({ nombre_genero: nombre }))
        : [],
    }));
    return respuestaOk(res, 200, 'LIBROS_OBTENIDOS_OK', libros, { incluirMensaje: false });
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LIBROS', (error as Error).message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/** Obtener un libro por ID
 *
 * @param req - Objeto de solicitud de Express, con el ID del libro a obtener en req.query.id o req.params.id
 * @param res - Objeto de respuestaError de Express, se enviará un JSON con el resultado de la operación
 * @returns JSON con los datos del libro encontrado, incluyendo autores y géneros, o un error si ocurrió algún problema o si el libro no fue encontrado
 */
async function obtenerLibroId(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;
  try {
    const idRaw = req.query.id ?? req.params.id;
    const id = parsePositiveInt(idRaw);
    if (isNaN(id)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }

    conexionAbierta = new ConexionBD();
    const libroRaw = await conexionAbierta.listarLibrosConAutoresYGeneros({ id_libro: id });
    const libro = libroRaw.map((libro: any) => ({
      ...libro,
      autores: libro.autores
        ? libro.autores.split(',').map((nombre: string) => ({ nombre_autor: nombre }))
        : [],
      generos: libro.generos
        ? libro.generos.split(',').map((nombre: string) => ({ nombre_genero: nombre }))
        : [],
    }));

    if (libro.length === 0) {
      return respuestaError(res, 404, 'LIBRO_NO_ENCONTRADO_EMOJI');
    }

    return respuestaOk(res, 200, 'LIBRO_OBTENIDO_OK', libro[0], { incluirMensaje: false });
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_OBTENER_LIBRO', (error as Error).message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/** Actualizar un libro existente
 *
 * @param req - Objeto de solicitud de Express, con el ID del libro a actualizar en req.params.id o req.body.id_libro, y los datos a actualizar en req.body.libro, además de posibles arrays de autores en req.body.autores y géneros en req.body.generos
 * @param res - Objeto de respuestaError de Express, se enviará un JSON con el resultado de la operación
 * @returns JSON indicando si el libro fue actualizado y cuántos registros fueron afectados, o un error si ocurrió algún problema o si el libro no fue encontrado
 */
async function actualizarLibro(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;
  try {
    const idRaw = req.params.id ?? req.body.id_libro;
    const id = parsePositiveInt(idRaw);
    const datos: Partial<LibroBD> =
      typeof req.body.libro === 'object' && req.body.libro !== null ? req.body.libro : req.body;
    if (isNaN(id)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }

    // Actualizar datos principales del libro
    conexionAbierta = new ConexionBD();
    const afectados = await conexionAbierta.actualizarRegistro('libro', datos, { id_libro: id });
    if (afectados === 0) {
      return respuestaError(res, 404, 'LIBRO_NO_ENCONTRADO');
    }

    // Actualizar autores y géneros si se envían
    const autoresNombres: string[] = req.body.autores ?? [];
    const generosNombres: string[] = req.body.generos ?? [];
    const autoresIds: number[] = [];
    const generosIds: number[] = [];
    if (Array.isArray(autoresNombres) && autoresNombres.length > 0) {
      // Procesar autores: buscar o crear
      for (const nombreAutor of autoresNombres) {
        let autor = (
          await conexionAbierta.listarRegistros(
            'autor',
            { nombre_autor: nombreAutor },
            '',
            1,
            'nombre_autor',
          )
        )[0];
        if (!autor) {
          const idAutor = await conexionAbierta.insertarRegistro('autor', {
            nombre_autor: nombreAutor,
            apellido_autor: '',
            pais_autor: '',
            esUsuario: false,
          });
          autoresIds.push(idAutor);
        } else {
          autoresIds.push(autor.id_autor);
        }
      }
      // Obtener relaciones actuales
      const actuales = await conexionAbierta.listarRegistros('libro_autor', { id_libro: id });
      const actualesIds = actuales.map((rel: any) => rel.id_autor);
      // Agregar nuevas relaciones
      for (const idAutor of autoresIds) {
        if (!actualesIds.includes(idAutor)) {
          await conexionAbierta.insertarRegistro('libro_autor', {
            id_libro: id,
            id_autor: idAutor,
            autorPr: false,
          });
        }
      }
      // Eliminar relaciones que ya no están
      for (const idActual of actualesIds) {
        if (!autoresIds.includes(idActual)) {
          await conexionAbierta.borrarRegistro('libro_autor', { id_libro: id, id_autor: idActual });
        }
      }
    }

    if (Array.isArray(generosNombres) && generosNombres.length > 0) {
      // Procesar géneros: buscar o crear
      for (const nombreGenero of generosNombres) {
        let genero = (
          await conexionAbierta.listarRegistros(
            'genero',
            { nombre_genero: nombreGenero },
            '',
            1,
            'nombre_genero',
          )
        )[0];
        if (!genero) {
          const idGenero = await conexionAbierta.insertarRegistro('genero', {
            nombre_genero: nombreGenero,
          });
          generosIds.push(idGenero);
        } else {
          generosIds.push(genero.id_genero);
        }
      }
      // Obtener relaciones actuales
      const actuales = await conexionAbierta.listarRegistros('libro_genero', { id_libro: id });
      const actualesIds = actuales.map((rel: any) => rel.id_genero);
      // Agregar nuevas relaciones
      for (const idGenero of generosIds) {
        if (!actualesIds.includes(idGenero)) {
          await conexionAbierta.insertarRegistro('libro_genero', {
            id_libro: id,
            id_genero: idGenero,
          });
        }
      }
      // Eliminar relaciones que ya no están
      for (const idActual of actualesIds) {
        if (!generosIds.includes(idActual)) {
          await conexionAbierta.borrarRegistro('libro_genero', {
            id_libro: id,
            id_genero: idActual,
          });
        }
      }
    }

    return respuestaOk(
      res,
      200,
      'LIBRO_ACTUALIZADO_OK',
      { actualizado: true, afectados },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_ACTUALIZAR_LIBRO', (error as Error).message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

/** Borrar un libro existente
 *
 * @param req - Objeto de solicitud de Express, con el ID del libro a borrar en req.params.id o req.body.id_libro
 * @param res - Objeto de respuestaError de Express, se enviará un JSON con el resultado de la operación
 * @returns JSON indicando si el libro fue borrado y cuántos registros fueron afectados, o un error si ocurrió algún problema
 */
async function borrarLibro(req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;
  try {
    const idRaw = req.params.id ?? req.body.id_libro;
    const id = parsePositiveInt(idRaw);
    if (isNaN(id)) {
      return respuestaError(res, 400, 'ID_LIBRO_INVALIDO');
    }

    conexionAbierta = new ConexionBD();
    const afectados = await conexionAbierta.borrarRegistro('libro', { id_libro: id });
    if (afectados === 0) {
      return respuestaError(res, 404, 'LIBRO_NO_ENCONTRADO');
    }
    return respuestaOk(
      res,
      200,
      'LIBRO_BORRADO_OK',
      { borrado: true, afectados },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_BORRAR_LIBRO', (error as Error).message);
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

async function obtenerLibrosTotal(_req: Request, res: Response) {
  let conexionAbierta = null as ConexionBD | null;
  try {
    conexionAbierta = new ConexionBD();
    const total = await conexionAbierta.listarRegistros('libro', {}, '', 0, 'COUNT(*) AS total');
    const totalLibros = total[0]?.total ?? 0;
    return respuestaOk(
      res,
      200,
      'TOTAL_LIBROS_OBTENIDO_OK',
      { total: totalLibros },
      { incluirMensaje: false },
    );
  } catch (error) {
    return respuestaError(res, 500, 'ERROR_TOTAL_LIBROS', (error as Error).message);
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
