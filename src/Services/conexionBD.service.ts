import mysql, { Pool, FieldPacket } from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DetalleLibroCompleto,
  LibroApp,
  LibroResumen,
  ListaApp,
} from '../Interfaces/modelosApp/modelosApp.js';
import { LibroCritica, ListaBD } from '../Interfaces/modelosBD/modelosBD.js';

/* ===========================================================================================================
  Tipos y utilidades
  =========================================================================================================== */

/** Estructura para condiciones avanzadas en WHERE */
export interface WmhereCondition {
  operador: string;
  valor: string | number | Date | (string | number | Date)[];
}

/* ===========================================================================================================
  Servicio de conexión a base de datos
  =========================================================================================================== */

/**
 * Servicio de acceso y gestión de la base de datos MySQL/MariaDB.
 * Incluye métodos CRUD genéricos y utilidades especializadas para libros, autores y géneros.
 */
export class ConexionBD {
  private readonly pool: Pool;
  private readonly charset: string;
  private readonly collation: string;
  /* ===========================================================================================================
    Constructor/Destructor y configuración de conexión
    =========================================================================================================== */

  /**
   * Constructor para crear una nueva conexión a la base de datos. No se conecta automáticamente, sino que prepara el pool de conexiones.
   *
   * @param config Configuración de conexión a la base de datos (host, puerto, usuario, contraseña y nombre de BD - charset y collation opcionales).
   * Se recomienda usar getConexionConfigFromEnv() para cargar desde variables de entorno.
   */
  constructor(config = getConexionConfigFromEnv()) {
    this.charset = config.charset || 'utf8mb4';
    this.collation = config.collation || 'utf8mb4_spanish_ci';
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: this.charset,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  /**
   * Cerrar el pool de conexiones a la base de datos.
   * Este método debe ser llamado explícitamente cuando ya no se necesite la conexión para liberar los recursos.
   * @returns void
   */
  // ! Importante: REQUIERE LLAMADA EXPLÍCITA
  async close(): Promise<void> {
    await this.pool.end();
  }

  /* ===========================================================================================================
    Métodos básicos de acceso a datos (CRUD) para 1 sola tabla
    =========================================================================================================== */

  /**
   * Insertar un nuevo registro en la tabla especificada con los datos proporcionados. Los datos se pasan como un objeto donde la clave es el nombre de la columna y el valor es el valor a insertar. El método devuelve el ID del nuevo registro insertado (si la tabla tiene una columna AUTO_INCREMENT) o 0 si no se pudo obtener el ID.
   *
   * @param tabla String con el nombre de la tabla donde se insertará el registro.
   * @param datos Objeto con los datos a insertar, donde la clave es el nombre de la columna y el valor es el valor a insertar. Ejemplo: { nombre_usuario: "Juan", nombre_real: "Juan Pérez" }
   * @param devolverId Opcional - Booleano que indica si se debe devolver el ID del nuevo registro insertado (true por defecto). Si se establece en false, el método devolverá 0 en lugar del ID. Esto puede ser útil para tablas que no tienen una columna AUTO_INCREMENT o cuando el ID no es relevante.
   * @returns Objeto con éxito, datos y mensaje.
   * @throws Error si ocurre algún problema durante la inserción o si los parámetros son inválidos.
   */
  async insertarRegistro(
    tabla: string,
    datos: Record<string, string | number | boolean | Date>,
    devolverId: boolean = true,
  ): Promise<{ exito: boolean; datos: any; mensaje: string }> {
    try {
      this.validarTablaYColumnas(tabla, datos);
      const { sql, valores } = this.construirInsertQuery(tabla, datos);
      const [result]: any = await this.pool.query(sql, valores);
      return {
        exito: true,
        datos: devolverId ? result.insertId : result.affectedRows,
        mensaje: '',
      };
    } catch (error: any) {
      return { exito: false, datos: null, mensaje: error.message };
    }
  }

  /**
   * Borrar registros de la tabla especificada que cumplan con las condiciones dadas. Las condiciones se pasan como un objeto donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para eliminar el registro. El método devuelve el número de registros afectados (eliminados).
   *
   * @param tabla String con el nombre de la tabla de la cual se eliminarán los registros.
   * @param condiciones Objeto con las condiciones para eliminar los registros, donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para eliminar el registro. Ejemplo: { id_usuario: 5 } eliminará el registro donde id_usuario sea igual a 5.
   * @returns Objeto con éxito, datos y mensaje.
   * @throws Error si ocurre algún problema durante la eliminación o si los parámetros son inválidos.
   */
  async borrarRegistro(
    tabla: string,
    condiciones: Record<string, string | number>,
  ): Promise<{ exito: boolean; datos: any; mensaje: string }> {
    try {
      this.validarTablaYColumnas(tabla, condiciones);
      const { sql, valores } = this.construirDeleteQuery(tabla, condiciones);
      const [result]: any = await this.pool.query(sql, valores);
      return { exito: true, datos: result.affectedRows, mensaje: '' };
    } catch (error: any) {
      return { exito: false, datos: null, mensaje: error.message };
    }
  }

  /**
   * Actualizar registros de la tabla especificada que cumplan con las condiciones dadas, estableciendo los nuevos valores proporcionados. Los datos a actualizar se pasan como un objeto donde la clave es el nombre de la columna y el valor es el nuevo valor a establecer. Las condiciones se pasan como un objeto donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para actualizar el registro. El método devuelve el número de registros afectados (actualizados).
   *
   * @param tabla String con el nombre de la tabla donde se actualizarán los registros.
   * @param datos Objeto con los datos a actualizar, donde la clave es el nombre de la columna y el valor es el nuevo valor a establecer. Ejemplo: { nombre_usuario: "Carlos" } actualizará el campo nombre_usuario a "Carlos".
   * @param condiciones Objeto con las condiciones para actualizar los registros, donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para actualizar el registro. Ejemplo: { id_usuario: 5 } actualizará el registro donde id_usuario sea igual a 5.
   * @returns Objeto con éxito, datos y mensaje.
   * @throws Error si ocurre algún problema durante la actualización o si los parámetros son inválidos.
   */
  async actualizarRegistro(
    tabla: string,
    datos: Record<string, string | number | boolean | Date>,
    condiciones: Record<string, string | number>,
  ): Promise<{ exito: boolean; datos: any; mensaje: string }> {
    try {
      this.validarTablaYColumnas(tabla, { ...datos, ...condiciones });
      const { sql, valores } = this.construirUpdateQuery(tabla, datos, condiciones);
      const [result]: any = await this.pool.query(sql, valores);
      return { exito: true, datos: result.affectedRows, mensaje: '' };
    } catch (error: any) {
      return { exito: false, datos: null, mensaje: error.message };
    }
  }

  /**
   * Listar registros de la tabla especificada que cumplan con las condiciones dadas, ordenados y limitados según los parámetros proporcionados.
   *
   * @param tabla String con el nombre de la tabla de la cual se listarán los registros.
   * @param condiciones Objeto con las condiciones para listar los registros, donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para incluir el registro en el resultado. Ejemplo: { pais_usuario: "España" } listará los registros donde pais_usuario sea igual a "España".
   * @param orden String con el orden para listar los registros, con el formato "columna ASC" o "columna DESC". Ejemplo: "nombre_usuario ASC" ordenará los resultados por nombre_usuario en orden ascendente.
   * @param limite Número entero que indica la cantidad máxima de registros a devolver. Ejemplo: 10 limitará el resultado a los primeros 10 registros encontrados.
   * @param columnas Opcional - String con los nombres de las columnas a seleccionar, separados por comas. Por defecto es "*", lo que selecciona todas las columnas. Ejemplo: "id_usuario, nombre_usuario" seleccionará solo las columnas id_usuario y nombre_usuario.
   * @returns Objeto con éxito, datos y mensaje.
   * @throws Error si ocurre algún problema durante la consulta o si los parámetros son inválidos.
   */
  async listarRegistros(
    tabla: string,
    condiciones: Record<string, any> = {},
    orden = '',
    limite = 0,
    columnas = '*',
  ): Promise<{ exito: boolean; datos: any; mensaje: string }> {
    try {
      this.validarTablaYColumnas(tabla, condiciones);
      const { sql, valores } = this.construirSelectQuery(
        tabla,
        condiciones,
        orden,
        limite,
        columnas,
      );
      const [rows]: [any[], FieldPacket[]] = await this.pool.query(sql, valores);
      return { exito: true, datos: rows, mensaje: '' };
    } catch (error: any) {
      return { exito: false, datos: null, mensaje: error.message };
    }
  }

  /* ===========================================================================================================
    Métodos específicos para casos de uso comunes
    =========================================================================================================== */

  /**
   * Obtiene un catálogo paginado de libros con todos los datos requeridos por la interfaz LibroApp.
   * Devuelve los libros en orden de id_libro ASC, sin saltos ni desorden, según la base de datos.
   * Permite filtrar por título, autor y género.
   * @param filtros Filtros de búsqueda: { titulo, autor, genero }
   * @param page Página (1-based)
   * @param limit Cantidad por página
   * @returns Array de libros con autores, géneros, idioma, totalResenas y calificacionPromedio
   */
  async obtenerCatalogoLibros(
    filtros: {
      titulo?: string;
      generos?: number[];
      autores?: number[];
      years?: number[];
      valoraciones?: number[];
    },
    page: number,
    limit: number,
  ): Promise<LibroResumen[]> {
    const offset = (page - 1) * limit;

    const { clausulas, valores } = this.construirFiltrosLibros(filtros);

    const whereFinal =
      clausulas.length > 0 ? 'WHERE ' + clausulas.map((c) => `(${c})`).join(' AND ') : '';

    const sql = `
    SELECT
      t.id_libro,
      t.titulo_libro,
      t.autores,
      t.calificacionPromedio
    FROM (
      SELECT
        l.id_libro,
        l.titulo_libro,
        GROUP_CONCAT(DISTINCT CONCAT(a.nombre_autor, ':', a.apellido_autor) SEPARATOR '|') AS autores,
        AVG(c.calificacion_comentario) AS calificacionPromedio,
        FLOOR(AVG(c.calificacion_comentario)) AS calificacionBucket
      FROM libro l
      LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
      LEFT JOIN autor a ON la.id_autor = a.id_autor
      LEFT JOIN libro_critica c ON l.id_libro = c.id_libro
      ${whereFinal}
      GROUP BY l.id_libro
    ) AS t
    LIMIT ? OFFSET ?
  `;

    const params = [...valores, limit, offset];

    const [rows] = await this.pool.query(sql, params);

    return (rows as Array<Record<string, any>>).map(
      (row): LibroResumen => ({
        id_libro: row.id_libro,
        titulo_libro: row.titulo_libro,
        autores:
          typeof row.autores === 'string' && row.autores.length > 0
            ? row.autores.split('|').map((a: string) => {
                const [nombre_autor, apellido_autor] = a.split(':');
                return {
                  nombre_autor,
                  apellido_autor,
                };
              })
            : [],
        calificacionPromedio:
          row.calificacionPromedio !== null && row.calificacionPromedio !== undefined
            ? Number(row.calificacionPromedio)
            : undefined,
      }),
    );
  }

  /**
   * Obtiene el detalle completo de un libro por su ID, incluyendo su información básica, críticas y distribución de notas.
   * Devuelve null si el libro no existe.
   * @param idLibro ID del libro a obtener
   * @returns DetalleLibroCompleto con la información del libro, sus críticas y distribución de notas, o null si no se encuentra el libro
   */
  async obtenerDetalleLibro(idLibro: number): Promise<DetalleLibroCompleto | null> {
    // Consulta principal del libro
    const sql = `
    SELECT
      l.id_libro,
      l.titulo_libro,
      l.codigo_isbn,
      l.id_idioma_original,
      l.paginas,
      l.year_publicacion,
      l.sinopsis,
      i.nombre_idioma,
      GROUP_CONCAT(DISTINCT CONCAT(a.id_autor, ':', a.nombre_autor, ':', a.apellido_autor) SEPARATOR '|') AS autores,
      GROUP_CONCAT(DISTINCT g.nombre_genero SEPARATOR '|') AS generos,
      COUNT(DISTINCT c.id_usuario) AS totalResenas,
      ROUND(AVG(c.calificacion_comentario),2) AS calificacionPromedio
    FROM libro l
    LEFT JOIN idiomas i ON l.id_idioma_original = i.id_idioma
    LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
    LEFT JOIN autor a ON la.id_autor = a.id_autor
    LEFT JOIN libro_genero lg ON l.id_libro = lg.id_libro
    LEFT JOIN genero g ON lg.id_genero = g.id_genero
    LEFT JOIN libro_critica c ON l.id_libro = c.id_libro
    WHERE l.id_libro = ?
    GROUP BY l.id_libro
  `;
    const [rows] = await this.pool.query(sql, [idLibro]);
    if (!rows || (rows as any[]).length === 0) return null;
    const row = (rows as Array<Record<string, any>>)[0];

    // Críticas y distribución de notas
    const [criticasRows] = await this.pool.query(
      `SELECT id_libro, id_usuario, titulo_comentario, texto_comentario, calificacion_comentario, fecha_comentario
        FROM libro_critica WHERE id_libro = ? ORDER BY fecha_comentario DESC`,
      [idLibro],
    );
    const criticas: LibroCritica[] = (criticasRows as Array<Record<string, any>>).map((c) => ({
      id_libro: c.id_libro,
      id_usuario: c.id_usuario,
      titulo_comentario: c.titulo_comentario,
      texto_comentario: c.texto_comentario,
      calificacion_comentario: Number(c.calificacion_comentario),
      fecha_comentario: c.fecha_comentario,
    }));

    // Distribución de notas
    const frecuencias: number[] = [0, 0, 0, 0, 0];
    criticas.forEach((c) => {
      const nota = Number(c.calificacion_comentario);
      if (nota > 0 && nota <= 5) frecuencias[nota - 1]++;
    });
    const total = criticas.length;
    const notasDistribucion = Array.from({ length: 5 }, (_, indice) => ({
      nota: indice + 1,
      cantidad: frecuencias[indice],
      frecuencia: total > 0 ? +(frecuencias[indice] / total).toFixed(2) : 0,
    }));

    // Mapeo a LibroApp
    const libro: LibroApp = {
      id_libro: row.id_libro,
      titulo_libro: row.titulo_libro,
      codigo_isbn: row.codigo_isbn,
      id_idioma_original: row.id_idioma_original,
      paginas: row.paginas,
      year_publicacion: row.year_publicacion,
      sinopsis: row.sinopsis,
      nombre_idioma_original: row.nombre_idioma,
      autores:
        typeof row.autores === 'string' && row.autores.length > 0
          ? row.autores.split('|').map((a: string) => {
              const [id_autor, nombre_autor, apellido_autor] = a.split(':');
              return {
                id_autor: Number(id_autor),
                nombre_autor,
                apellido_autor,
              };
            })
          : [],
      generos:
        typeof row.generos === 'string' && row.generos.length > 0
          ? row.generos.split('|').map((nombre_genero: string) => ({
              nombre_genero,
            }))
          : [],
      totalResenas: Number(row.totalResenas) || 0,
      calificacionPromedio:
        row.calificacionPromedio !== null && row.calificacionPromedio !== undefined
          ? Number(row.calificacionPromedio)
          : undefined,
    };

    return {
      libro,
      criticas,
      notasDistribucion,
      errorCriticas: false,
    };
  }

  /**
   * Obtiene un catálogo paginado de listas.
   * Devuelve las listas en orden de id_lista ASC.
   * @param page Página (1-based)
   * @param limit Cantidad por página
   * @returns Array de listas
   */
  async obtenerCatalogoListas(page: number, limit: number): Promise<ListaApp[]> {
    const offset = (page - 1) * limit;
    // 1. Obtener listas y nombre del creador
    const sql = `
      SELECT l.*, u.nombre_usuario AS nombreCreador
      FROM lista l
      JOIN usuario u ON l.id_usuarioCrd = u.id_usuario
      ORDER BY l.id_lista ASC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.pool.query(sql, [limit, offset]);

    // 2. Obtener categorías asociadas a cada lista
    const listaIds = (rows as Array<any>).map((row) => row.id_lista);
    let categoriasPorLista: Record<number, string[]> = {};
    if (listaIds.length > 0) {
      const sqlCat = `
        SELECT lc.id_lista, c.nombre_categoria
        FROM lista_categoria lc
        JOIN categoria c ON lc.id_categoria = c.id_categoria
        WHERE lc.id_lista IN (${listaIds.map(() => '?').join(',')})
      `;
      const [catRows] = await this.pool.query(sqlCat, listaIds);
      categoriasPorLista = {};
      (catRows as Array<any>).forEach((row) => {
        if (!categoriasPorLista[row.id_lista]) categoriasPorLista[row.id_lista] = [];
        categoriasPorLista[row.id_lista].push(row.nombre_categoria);
      });

      // 3. Obtener los 2-3 primeros libros de cada lista y el total de libros por lista (para portada y contador)
      let librosPortadaPorLista: Record<number, number[]> = {};
      let totalLibrosPorLista: Record<number, number> = {};

      const sqlLibros = `
        SELECT id_lista, id_libro
        FROM lista_contenido
        WHERE id_lista IN (${listaIds.map(() => '?').join(',')})
        ORDER BY id_lista ASC, id_libro ASC
      `;
      const [libRows] = await this.pool.query(sqlLibros, listaIds);
      librosPortadaPorLista = {};
      (libRows as Array<any>).forEach((row) => {
        // Contador real
        if (!totalLibrosPorLista[row.id_lista]) {
          totalLibrosPorLista[row.id_lista] = 0;
        }
        totalLibrosPorLista[row.id_lista]++;

        // Portadas (solo 3)
        if (!librosPortadaPorLista[row.id_lista]) {
          librosPortadaPorLista[row.id_lista] = [];
        }
        if (librosPortadaPorLista[row.id_lista].length < 3) {
          librosPortadaPorLista[row.id_lista].push(row.id_libro);
        }
      });

      // 4. Obtener el total de "Me gusta" por lista
      let totalMeGustaPorLista: Record<number, number> = {};
      const sqlMeGusta = `
      SELECT id_lista, COUNT(*) AS totalMeGusta
      FROM lista_usuario
      WHERE me_gusta_lista = 1 AND id_lista IN (${listaIds.map(() => '?').join(',')}) GROUP BY id_lista`;
      const [meGustaRows] = await this.pool.query(sqlMeGusta, listaIds);
      totalMeGustaPorLista = {};
      (meGustaRows as Array<any>).forEach((row) => {
        totalMeGustaPorLista[row.id_lista] = row.totalMeGusta;
      });

      // 5. Mapear resultado final
      return (rows as Array<Record<string, unknown>>).map((row) => {
        const lista: ListaBD = {
          id_lista: row.id_lista as number,
          id_usuarioCrd: row.id_usuarioCrd as number,
          nombre_lista: row.nombre_lista as string,
          descripcion_lista: row.descripcion_lista as string | undefined,
        };
        return {
          id_lista: lista.id_lista,
          id_usuarioCreador: lista.id_usuarioCrd,
          nombre_lista: lista.nombre_lista,
          nombreCreador: row.nombreCreador as string,
          categorias: categoriasPorLista[row.id_lista as number] || [],
          librosPortada: librosPortadaPorLista[row.id_lista as number] || [],
          totalLibros: totalLibrosPorLista[lista.id_lista] || 0,
          totalMeGusta: totalMeGustaPorLista[lista.id_lista] || 0,
          descripcion_lista: lista.descripcion_lista || undefined,
        } as ListaApp;
      });
    } else {
      throw new Error('Error al obtener listas: No se encontraron listas en la base de datos.');
    }
  }
  /**
   * Obtiene una lista por su ID, incluyendo el nombre del creador.
   * Devuelve null si no existe.
   * @param idLista ID de la lista
   * @returns Objeto ListaApp o null
   */
  async obtenerListaConCreadorPorId(idLista: number): Promise<ListaApp | null> {
    const sql = `
      SELECT l.*, u.nombre_usuario AS nombreCreador
      FROM lista l
      JOIN usuario u ON l.id_usuarioCrd = u.id_usuario
      WHERE l.id_lista = ?
      LIMIT 1
    `;
    const [rows] = await this.pool.query(sql, [idLista]);
    if (!rows || (rows as any[]).length === 0) return null;
    const row = (rows as Array<any>)[0];
    return {
      id_lista: row.id_lista,
      id_usuarioCreador: row.id_usuarioCrd,
      nombre_lista: row.nombre_lista,
      nombreCreador: row.nombreCreador,
      descripcion_lista: row.descripcion_lista,
    } as ListaApp;
  }

  /**
   * Obtiene los libros asociados a una lista en formato resumen (para tarjetas).
   * Devuelve un array de LibroResumen con id_libro, titulo_libro y calificacionPromedio.
   * @param idLista ID de la lista
   * @returns Array de LibroResumen
   */
  async obtenerLibrosDeListaResumen(idLista: number): Promise<LibroResumen[]> {
    const sql = `
      SELECT
        l.id_libro,
        l.titulo_libro,
        GROUP_CONCAT(DISTINCT CONCAT(a.nombre_autor, ':', a.apellido_autor) SEPARATOR '|') AS autores,
        ROUND(AVG(c.calificacion_comentario),2) AS calificacionPromedio
      FROM lista_contenido lc
      INNER JOIN libro l ON lc.id_libro = l.id_libro
      LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
      LEFT JOIN autor a ON la.id_autor = a.id_autor
      LEFT JOIN libro_critica c ON l.id_libro = c.id_libro
      WHERE lc.id_lista = ?
      GROUP BY l.id_libro, l.titulo_libro
      ORDER BY l.id_libro ASC
    `;
    const [rows] = await this.pool.query(sql, [idLista]);
    return (rows as Array<Record<string, any>>).map(
      (row): LibroResumen => ({
        id_libro: row.id_libro,
        titulo_libro: row.titulo_libro,
        autores:
          typeof row.autores === 'string' && row.autores.length > 0
            ? row.autores.split('|').map((a: string) => {
                const [nombre_autor, apellido_autor] = a.split(':');
                return {
                  nombre_autor,
                  apellido_autor,
                };
              })
            : [],
        calificacionPromedio:
          row.calificacionPromedio !== null && row.calificacionPromedio !== undefined
            ? Number(row.calificacionPromedio)
            : undefined,
      }),
    );
  }

  /**
   * Obtiene los comentarios asociados a una lista.
   * @param idLista ID de la lista
   * @returns Array de comentarios (ListaComentarios[])
   */
  async obtenerComentariosDeLista(idLista: number) {
    const sql = `
    SELECT c.id_listaComentario, c.id_lista, c.id_usuario, c.titulo_comentario, c.texto_comentario, c.id_com_respuesta, c.fecha_comentario,
          u.calificacion_lista
    FROM lista_comentario c
    LEFT JOIN lista_usuario u
      ON u.id_lista = c.id_lista AND u.id_usuario = c.id_usuario
    WHERE c.id_lista = ?
    ORDER BY c.fecha_comentario ASC
  `;
    const [rows] = await this.pool.query(sql, [idLista]);
    return (rows as Array<Record<string, any>>).map((row) => ({
      id_listaComentario: row.id_listaComentario,
      id_lista: row.id_lista,
      id_usuario: row.id_usuario,
      titulo_comentario: row.titulo_comentario,
      texto_comentario: row.texto_comentario,
      id_com_respuesta: row.id_com_respuesta ?? null,
      fecha_comentario: row.fecha_comentario,
      calificacion_lista: row.calificacion_lista ?? null,
    }));
  }

  /**
   * Resetea la base de datos ejecutando los scripts de creación y población inicial.
   * No requiere argumentos y ejecuta exclusivamente los ficheros creacion.sql y poblacionInicial.sql.
   * @returns Objeto con éxito, datos y mensaje.
   */
  async resetearApi(): Promise<{ exito: boolean; datos: any; mensaje: string }> {
    try {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const rutas = [
        path.resolve(__dirname, '../../scriptsBD/creacion.sql'),
        path.resolve(__dirname, '../../scriptsBD/poblacionInicial.sql'),
      ];
      for (const ruta of rutas) {
        const sql = await readFile(ruta, 'utf8');
        const statements = sql
          .split(';')
          .map((stmt: string) => stmt.trim())
          .filter((stmt: string) => stmt.length > 0);
        for (const statement of statements) {
          await this.pool.query(statement);
        }
      }
      return { exito: true, datos: null, mensaje: '' };
    } catch (error: any) {
      return { exito: false, datos: null, mensaje: error.message };
    }
  }

  async obtenerTotalLibrosFiltrado(filtros: {
    titulo?: string;
    generos?: number[];
    autores?: number[];
    years?: number[];
    valoraciones?: number[];
  }): Promise<number> {
    const { clausulas, valores } = this.construirFiltrosLibros(filtros);

    const whereFinal =
      clausulas.length > 0 ? 'WHERE ' + clausulas.map((c) => `(${c})`).join(' AND ') : '';

    const sql = `
    SELECT COUNT(DISTINCT l.id_libro) AS total
    FROM libro l
    LEFT JOIN libro_critica c ON l.id_libro = c.id_libro
    ${whereFinal}
  `;

    const [rows] = await this.pool.query(sql, valores);
    return (rows as any[])?.[0]?.total ?? 0;
  }

  /* ===========================================================================================================
    Métodos privados de validación y construcción de queries
    =========================================================================================================== */

  /**
   * Validar que el nombre de la tabla y las columnas sean válidos (solo letras, números y guiones bajos).
   *
   * @param tabla Nombre de la tabla.
   * @param datos Objeto con los datos o condiciones.
   * @throws Error si algún nombre no es válido.
   */
  private validarTablaYColumnas(tabla: string, datos: Record<string, any>) {
    if (!tabla || typeof tabla !== 'string' || tabla.trim() === '') {
      throw new Error('Nombre de tabla inválido.');
    }
    if (!datos || typeof datos !== 'object') {
      throw new Error('Datos inválidos.');
    }
    const nombreValido = /^\w+$/;
    if (!nombreValido.test(tabla)) throw new Error('Nombre de tabla no permitido.');
    for (const col of Object.keys(datos)) {
      if (!nombreValido.test(col)) throw new Error(`Nombre de columna no permitido: ${col}`);
    }
  }

  /**
   * Construir la query y los valores para un INSERT.
   *
   * @param tabla Nombre de la tabla.
   * @param datos Objeto con los datos a insertar.
   * @returns Objeto con la query y los valores.
   */
  private construirInsertQuery(tabla: string, datos: Record<string, any>) {
    const columnas = Object.keys(datos)
      .map((col) => `\`${col}\``)
      .join(', ');
    const placeholders = Object.keys(datos)
      .map(() => '?')
      .join(', ');
    const valores = Object.values(datos);
    const sql = `INSERT INTO \`${tabla}\` (${columnas}) VALUES (${placeholders})`;
    return { sql, valores };
  }

  /**
   * Construir la query y los valores para un DELETE.
   *
   * @param tabla Nombre de la tabla.
   * @param condiciones Objeto con las condiciones.
   * @returns Objeto con la query y los valores.
   */
  private construirDeleteQuery(tabla: string, condiciones: Record<string, any>) {
    const { clausulas, valores } = this.construirClausulasWhere(condiciones);
    const sql = `DELETE FROM \`${tabla}\` WHERE ${clausulas.join(' AND ')}`;
    return { sql, valores };
  }

  /**
   * Construir la query y los valores para un UPDATE.
   *
   * @param tabla Nombre de la tabla.
   * @param datos Objeto con los datos a actualizar.
   * @param condiciones Objeto con las condiciones.
   * @returns Objeto con la query y los valores.
   */
  private construirUpdateQuery(
    tabla: string,
    datos: Record<string, any>,
    condiciones: Record<string, any>,
  ) {
    const sets = Object.keys(datos)
      .map((col) => `\`${col}\` = ?`)
      .join(', ');
    const { clausulas, valores: valoresCond } = this.construirClausulasWhere(condiciones);
    const valores = [...Object.values(datos), ...valoresCond];
    const sql = `UPDATE \`${tabla}\` SET ${sets} WHERE ${clausulas.join(' AND ')}`;
    return { sql, valores };
  }

  /**
   * Construir la query y los valores para un SELECT.
   *
   * @param tabla Nombre de la tabla.
   * @param condiciones Objeto con las condiciones.
   * @param orden Orden de los resultados.
   * @param limite Límite de resultados.
   * @param columnas Columnas a seleccionar.
   * @returns Objeto con la query y los valores.
   */
  private construirSelectQuery(
    tabla: string,
    condiciones: Record<string, any>,
    orden = '',
    limite = 0,
    columnas = '*',
  ) {
    let sql = `SELECT ${columnas} FROM \`${tabla}\``;
    const valores: any[] = [];
    if (condiciones && Object.keys(condiciones).length > 0) {
      const { clausulas, valores: vals } = this.construirClausulasWhere(condiciones);
      sql += ` WHERE ${clausulas.join(' AND ')}`;
      valores.push(...vals);
    }
    if (orden) sql += ` ORDER BY ${orden}`;
    if (limite > 0) sql += ` LIMIT ${limite}`;
    return { sql, valores };
  }

  /**
   * Procesar un operador especial en las condiciones (IS NULL, IN, BETWEEN, LIKE, etc.) y construir las cláusulas y valores correspondientes para la consulta.
   * @param campo Campo/columna al que se le aplica el operador.
   * @param valor Objeto con el operador y el valor.
   * @param prefijo Prefijo para el nombre de la columna.
   * @returns Objeto con las cláusulas y valores procesados.
   * @throws Error si el operador no es soportado o si los valores no son válidos para el operador.
   * Ejemplo de valor: { operador: 'IN', valor: [1, 2, 3] } o { operador: 'BETWEEN', valor: [10, 20] } o { operador: 'IS NULL' }
   */
  private procesarOperador(
    campo: string,
    valor: any,
    prefijo: string,
  ): { clausulas: string[]; valores: any[] } {
    const clausulas: string[] = [];
    const valores: any[] = [];

    const operador = valor.operador.toString().toUpperCase();

    if (operador === 'IS NULL' || operador === 'IS NOT NULL') {
      clausulas.push(`\`${prefijo}${campo}\` ${operador}`);
      return { clausulas, valores };
    }

    if ((operador === 'IN' || operador === 'NOT IN') && Array.isArray(valor.valor)) {
      if (valor.valor.length === 0)
        throw new Error(`El array para IN/NOT IN en '${campo}' está vacío.`);
      const placeholders = valor.valor.map(() => '?').join(', ');
      clausulas.push(`\`${prefijo}${campo}\` ${operador} (${placeholders})`);
      valores.push(...valor.valor);
      return { clausulas, valores };
    }

    if (
      (operador === 'BETWEEN' || operador === 'NOT BETWEEN') &&
      Array.isArray(valor.valor) &&
      valor.valor.length === 2
    ) {
      clausulas.push(`\`${prefijo}${campo}\` ${operador} ? AND ?`);
      valores.push(valor.valor[0], valor.valor[1]);
      return { clausulas, valores };
    }

    if (
      ((operador === 'LIKE' || operador === 'NOT LIKE') && typeof valor.valor === 'string') ||
      ['!=', '<>', '<', '>', '<=', '>='].includes(operador)
    ) {
      clausulas.push(`\`${prefijo}${campo}\` ${operador} ?`);
      valores.push(valor.valor);
      return { clausulas, valores };
    }

    throw new Error(`Operador no soportado en condiciones: ${operador}`);
  }

  /**
   * Método privado para construir cláusulas WHERE flexibles con operadores especiales (IS NULL, IN, BETWEEN, LIKE, etc.)
   *
   * @param condiciones Objeto con condiciones, donde la clave es el nombre de la columna y el valor puede ser un valor directo o un objeto { operador, valor }.
   * @param alias Alias de tabla (opcional).
   * @returns Objeto con array de cláusulas y valores.
   */
  private construirClausulasWhere(
    condiciones: Record<string, any>,
    alias?: string,
  ): { clausulas: string[]; valores: any[] } {
    const clausulas: string[] = [];
    const valores: any[] = [];
    const prefijo = alias ? `${alias}.` : '';

    for (const campo in condiciones) {
      const valor = condiciones[campo];

      if (valor && typeof valor === 'object' && 'operador' in valor) {
        const res = this.procesarOperador(campo, valor, prefijo);
        clausulas.push(...res.clausulas);
        valores.push(...res.valores);
      } else {
        clausulas.push(`\`${prefijo}${campo}\` = ?`);
        valores.push(valor);
      }
    }

    return { clausulas, valores };
  }

  /**
   * Construir cláusulas WHERE específicas para la consulta de libros, combinando filtros simples y complejos (EXISTS).
   * @param filtros Colección de filtros para libros: { titulo, generos, autores, years, valoraciones }
   * @returns Objeto con array de cláusulas y valores.
   */
  private construirFiltrosLibros(filtros: {
    titulo?: string;
    generos?: number[];
    autores?: number[];
    years?: number[];
    valoraciones?: number[];
  }): { clausulas: string[]; valores: any[] } {
    // 1. Filtros simples con tus helpers
    const condiciones: Record<string, any> = {};

    if (filtros.titulo) {
      condiciones['titulo_libro'] = { operador: 'LIKE', valor: `%${filtros.titulo}%` };
    }

    if (filtros.years && filtros.years.length > 0) {
      condiciones['year_publicacion'] = { operador: 'IN', valor: filtros.years };
    }

    const { clausulas: simples, valores: valoresSimples } = this.construirClausulasWhere(
      condiciones,
      'l',
    );

    // 2. Filtros complejos (EXISTS)
    const extras: string[] = [];
    const valoresExtras: any[] = [];

    if (filtros.generos && filtros.generos.length > 0) {
      extras.push(`
      EXISTS (
        SELECT 1 FROM libro_genero lg2
        WHERE lg2.id_libro = l.id_libro
        AND lg2.id_genero IN (${filtros.generos.map(() => '?').join(',')})
      )
    `);
      valoresExtras.push(...filtros.generos);
    }

    if (filtros.autores && filtros.autores.length > 0) {
      extras.push(`
      EXISTS (
        SELECT 1 FROM libro_autor la2
        WHERE la2.id_libro = l.id_libro
        AND la2.id_autor IN (${filtros.autores.map(() => '?').join(',')})
      )
    `);
      valoresExtras.push(...filtros.autores);
    }

    if (filtros.valoraciones && filtros.valoraciones.length > 0) {
      extras.push(`
      EXISTS (
      SELECT 1
      FROM libro_critica c2
      WHERE c2.id_libro = l.id_libro
      GROUP BY c2.id_libro
      HAVING FLOOR(AVG(c2.calificacion_comentario)) IN (${filtros.valoraciones
        .map(() => '?')
        .join(',')})
      )
    `);
      valoresExtras.push(...filtros.valoraciones);
    }

    return {
      clausulas: [...simples, ...extras],
      valores: [...valoresSimples, ...valoresExtras],
    };
  }
}

/**
 * Obtención de credenciales de conexión a la base de datos desde variables de entorno.
 *
 * @returns ConexionConfig con los parámetros de conexión obtenidos de las variables de entorno o valores por defecto si no se encuentran.
 */
function getConexionConfigFromEnv() {
  const port = Number(process.env.DB_PORT);
  const dbPort = Number.isInteger(port) && port > 0 ? port : 3306;
  const database = process.env.DB_NAME || 'circuloLectura';
  return {
    host: process.env.DB_HOST || 'localhost',
    port: dbPort,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database,
    charset: process.env.DB_CHARSET || 'utf8mb4',
    collation: process.env.DB_COLLATION || 'utf8mb4_spanish_ci',
  };
}
