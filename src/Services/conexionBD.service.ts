import mysql, { Pool, FieldPacket } from 'mysql2/promise';
import { DetalleLibroCompleto, LibroApp } from '../Interfaces/modelosApp/modelosApp.js';
import {
  AutorApellido,
  AutorNombre,
  GeneroNombre,
  LibroCritica,
} from '../Interfaces/modelosBD/modelosBD.js';

/* ===========================================================================================================
  Tipos y utilidades
  =========================================================================================================== */

/** Estructura para condiciones avanzadas en WHERE */
export interface whereCondition {
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
  private pool: Pool;
  private charset: string;
  private collation: string;

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
    filtros: { titulo?: string; autor?: string; genero?: string },
    page: number,
    limit: number,
  ): Promise<LibroApp[]> {
    const offset = (page - 1) * limit;
    const params: any[] = [];

    let where: string[] = [];
    if (filtros.titulo) {
      where.push('l.titulo_libro LIKE ?');
      params.push(`%${filtros.titulo}%`);
    }
    if (filtros.autor) {
      where.push('(a.nombre_autor LIKE ? OR a.apellido_autor LIKE ?)');
      params.push(`%${filtros.autor}%`, `%${filtros.autor}%`);
    }
    if (filtros.genero) {
      where.push('g.nombre_genero LIKE ?');
      params.push(`%${filtros.genero}%`);
    }
    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const sql = `
    SELECT
      l.id_libro,
      l.titulo_libro,
      l.codigo_isbn,
      l.idioma_original,
      l.paginas,
      l.year_publicacion,
      l.sinopsis,
      i.nombre_idioma,
      GROUP_CONCAT(DISTINCT CONCAT(a.id_autor, ':', a.nombre_autor, ':', a.apellido_autor) SEPARATOR '|') AS autores,
      GROUP_CONCAT(DISTINCT g.nombre_genero SEPARATOR '|') AS generos,
      COUNT(DISTINCT c.id_usuario) AS totalResenas,
      ROUND(AVG(c.calificacion_libro),2) AS calificacionPromedio
    FROM libro l
    LEFT JOIN idiomas i ON l.idioma_original = i.id_idioma
    LEFT JOIN libro_autor la ON l.id_libro = la.id_libro
    LEFT JOIN autor a ON la.id_autor = a.id_autor
    LEFT JOIN libro_genero lg ON l.id_libro = lg.id_libro
    LEFT JOIN genero g ON lg.id_genero = g.id_genero
    LEFT JOIN libro_critica c ON l.id_libro = c.id_libro
    ${whereClause}
    GROUP BY l.id_libro
    ORDER BY l.id_libro ASC
    LIMIT ? OFFSET ?
  `;
    params.push(limit, offset);

    const [rows] = await this.pool.query(sql, params);

    return (rows as Array<Record<string, any>>).map(
      (row): LibroApp => ({
        id_libro: row.id_libro,
        titulo_libro: row.titulo_libro,
        codigo_isbn: row.codigo_isbn,
        idioma_original: row.idioma_original,
        paginas: row.paginas,
        year_publicacion: row.year_publicacion,
        sinopsis: row.sinopsis,
        id_idioma_original: row.idioma_original,
        nombre_idioma_original: row.nombre_idioma,
        autores:
          typeof row.autores === 'string' && row.autores.length > 0
            ? row.autores.split('|').map((a: string) => {
                const [id_autor, nombre_autor, apellido_autor] = a.split(':');
                return {
                  id_autor: Number(id_autor),
                  nombre_autor: { nombre_autor, trim: () => nombre_autor.trim() } as AutorNombre,
                  apellido_autor: {
                    apellido_autor,
                    trim: () => apellido_autor.trim(),
                  } as AutorApellido,
                };
              })
            : [],
        generos:
          typeof row.generos === 'string' && row.generos.length > 0
            ? row.generos.split('|').map((nombre_genero: string) => ({
                nombre_genero: { nombre_genero, trim: () => nombre_genero.trim() } as GeneroNombre,
              }))
            : [],
        totalResenas: Number(row.totalResenas) || 0,
        calificacionPromedio:
          row.calificacionPromedio !== null && row.calificacionPromedio !== undefined
            ? Number(row.calificacionPromedio)
            : undefined,
      }),
    );
  }

  async obtenerDetalleLibro(idLibro: number): Promise<DetalleLibroCompleto | null> {
    // Consulta principal del libro
    const sql = `
    SELECT
      l.id_libro,
      l.titulo_libro,
      l.codigo_isbn,
      l.idioma_original,
      l.paginas,
      l.year_publicacion,
      l.sinopsis,
      i.nombre_idioma,
      GROUP_CONCAT(DISTINCT CONCAT(a.id_autor, ':', a.nombre_autor, ':', a.apellido_autor) SEPARATOR '|') AS autores,
      GROUP_CONCAT(DISTINCT g.nombre_genero SEPARATOR '|') AS generos,
      COUNT(DISTINCT c.id_usuario) AS totalResenas,
      ROUND(AVG(c.calificacion_libro),2) AS calificacionPromedio
    FROM libro l
    LEFT JOIN idiomas i ON l.idioma_original = i.id_idioma
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
      `SELECT id_libro, id_usuario, titulo_critica, texto_critica, calificacion_libro, fecha_critica
     FROM libro_critica WHERE id_libro = ? ORDER BY fecha_critica DESC`,
      [idLibro],
    );
    const criticas: LibroCritica[] = (criticasRows as Array<Record<string, any>>).map((c) => ({
      id_libro: c.id_libro,
      id_usuario: c.id_usuario,
      titulo_critica: c.titulo_critica,
      texto_critica: c.texto_critica,
      calificacion_libro: Number(c.calificacion_libro),
      fecha_critica: c.fecha_critica,
    }));

    // Distribución de notas
    const frecuencias: number[] = [0, 0, 0, 0, 0, 0];
    criticas.forEach((c) => {
      const nota = Number(c.calificacion_libro);
      if (nota >= 0 && nota <= 5) frecuencias[nota]++;
    });
    const total = criticas.length;
    const notasDistribucion = Array.from({ length: 6 }, (_, nota) => ({
      nota,
      cantidad: frecuencias[nota],
      frecuencia: total > 0 ? +(frecuencias[nota] / total).toFixed(2) : 0,
    }));

    // Mapeo a LibroApp
    const libro: LibroApp = {
      id_libro: row.id_libro,
      titulo_libro: row.titulo_libro,
      codigo_isbn: row.codigo_isbn,
      idioma_original: row.idioma_original,
      paginas: row.paginas,
      year_publicacion: row.year_publicacion,
      sinopsis: row.sinopsis,
      id_idioma_original: row.idioma_original,
      nombre_idioma_original: row.nombre_idioma,
      autores:
        typeof row.autores === 'string' && row.autores.length > 0
          ? row.autores.split('|').map((a: string) => {
              const [id_autor, nombre_autor, apellido_autor] = a.split(':');
              return {
                id_autor: Number(id_autor),
                nombre_autor: { nombre_autor, trim: () => nombre_autor.trim() } as AutorNombre,
                apellido_autor: {
                  apellido_autor,
                  trim: () => apellido_autor.trim(),
                } as AutorApellido,
              };
            })
          : [],
      generos:
        typeof row.generos === 'string' && row.generos.length > 0
          ? row.generos.split('|').map((nombre_genero: string) => ({
              nombre_genero: { nombre_genero, trim: () => nombre_genero.trim() } as GeneroNombre,
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
   * Método genérico para ejecutar consultas SQL personalizadas.
   *
   * @param sql String con la consulta SQL a ejecutar.
   * @returns Objeto con éxito, datos y mensaje.
   */
  async query(sql: string): Promise<{ exito: boolean; datos: any; mensaje: string }> {
    try {
      const [rows]: [any[], FieldPacket[]] = await this.pool.query(sql);
      return { exito: true, datos: rows, mensaje: '' };
    } catch (error: any) {
      return { exito: false, datos: null, mensaje: error.message };
    }
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
    const nombreValido = /^[a-zA-Z0-9_]+$/;
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
    for (const campo in condiciones) {
      const valor = condiciones[campo];
      const prefijo = alias ? `${alias}.` : '';
      if (valor && typeof valor === 'object' && 'operador' in valor) {
        const operador = valor.operador.toString().toUpperCase();
        if (operador === 'IS NULL' || operador === 'IS NOT NULL') {
          clausulas.push(`\`${prefijo}${campo}\` ${operador}`);
        } else if ((operador === 'IN' || operador === 'NOT IN') && Array.isArray(valor.valor)) {
          if (valor.valor.length === 0)
            throw new Error(`El array para IN/NOT IN en '${campo}' está vacío.`);
          const placeholders = valor.valor.map(() => '?').join(', ');
          clausulas.push(`\`${prefijo}${campo}\` ${operador} (${placeholders})`);
          valores.push(...valor.valor);
        } else if (
          (operador === 'BETWEEN' || operador === 'NOT BETWEEN') &&
          Array.isArray(valor.valor) &&
          valor.valor.length === 2
        ) {
          clausulas.push(`\`${prefijo}${campo}\` ${operador} ? AND ?`);
          valores.push(valor.valor[0], valor.valor[1]);
        } else if (
          (operador === 'LIKE' || operador === 'NOT LIKE') &&
          typeof valor.valor === 'string'
        ) {
          clausulas.push(`\`${prefijo}${campo}\` ${operador} ?`);
          valores.push(valor.valor);
        } else if (['!=', '<>', '<', '>', '<=', '>='].includes(operador)) {
          clausulas.push(`\`${prefijo}${campo}\` ${operador} ?`);
          valores.push(valor.valor);
        } else {
          throw new Error(`Operador no soportado en condiciones: ${operador}`);
        }
      } else {
        clausulas.push(`\`${prefijo}${campo}\` = ?`);
        valores.push(valor);
      }
    }
    return { clausulas, valores };
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
