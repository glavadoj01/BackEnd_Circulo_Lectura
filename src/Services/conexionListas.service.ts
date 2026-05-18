import { ListaApp, LibroResumen } from '../interfaces/modelosApp/modelosApp.js';
import { ListaBD } from '../interfaces/modelosBD/modelosBD.js';
import { ConexionBD } from './conexionBD.service.js';

export class ConexionListas extends ConexionBD {
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
        };
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
    const row = (rows as Array<Record<string, unknown>>)[0];
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
}
