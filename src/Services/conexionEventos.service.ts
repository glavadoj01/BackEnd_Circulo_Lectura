import { ConexionBD } from './conexionBD.service.js';
import { EventoUsuario } from '../Interfaces/modelosBD/modelosBD.js';
import { EventoApp, LibroResumen } from '../Interfaces/modelosApp/modelosApp.js';

export class ConexionEventos extends ConexionBD {
  async obtenerEventoPorId(idEvento: number): Promise<EventoApp | null> {
    const sql = `
      SELECT e.*, u.nombre_usuario AS nombreCreador
      FROM evento e
      LEFT JOIN usuario u ON e.id_usuarioCrd = u.id_usuario
      WHERE id_evento = ?
      LIMIT 1
    `;
    const [rows] = await this.pool.query(sql, [idEvento]);
    if (!rows || (rows as any[]).length === 0) return null;
    const row = (rows as Array<any>)[0];
    return {
      id_evento: row.id_evento,
      id_usuarioCrd: row.id_usuario,
      nombreCreador: row.nombreCreador,
      nombre_evento: row.nombre_evento,
      fecha_evento: row.fecha_evento,
      hora_evento: row.hora_evento,
      direccion_evento: row.direccion_evento,
      descripcion_evento: row.descripcion_evento,
    };
  }

  async obtenerAsistentesEvento(idEvento: number): Promise<EventoUsuario[]> {
    const sql = 'SELECT * FROM evento_usuario WHERE id_evento = ?';
    const [rows] = await this.pool.query(sql, [idEvento]);
    return Array.isArray(rows) ? (rows as EventoUsuario[]) : [];
  }

  async obtenerLibrosEvento(idEvento: number): Promise<LibroResumen[]> {
    // JOIN para obtener datos completos de los libros relacionados, con calificación promedio
    const sql = `
      SELECT 
        l.id_libro, 
        l.titulo_libro, 
        l.codigo_isbn, 
        l.id_idioma_original, 
        l.paginas, 
        l.year_publicacion, 
        l.sinopsis,
        GROUP_CONCAT(CONCAT(a.nombre_autor, ' ', a.apellido_autor) ORDER BY la.autorPr DESC SEPARATOR ', ') AS autores,
        ROUND(AVG(c.calificacion_comentario),2) AS calificacionPromedio
      FROM evento_contenido ec
      JOIN libro l ON ec.id_libro = l.id_libro
      LEFT JOIN libro_autor la ON la.id_libro = l.id_libro
      LEFT JOIN autor a ON la.id_autor = a.id_autor
      LEFT JOIN libro_critica c ON l.id_libro = c.id_libro
      WHERE ec.id_evento = ?
      GROUP BY l.id_libro
    `;
    const [rows] = await this.pool.query(sql, [idEvento]);
    return Array.isArray(rows)
      ? rows.map((row: any) => ({
          id_libro: row.id_libro,
          titulo_libro: row.titulo_libro,
          codigo_isbn: row.codigo_isbn,
          id_idioma_original: row.id_idioma_original,
          paginas: row.paginas,
          year_publicacion: row.year_publicacion,
          sinopsis: row.sinopsis,
          autores: row.autores
            ? row.autores.split(',').map((nombre: string) => {
                const [nombre_autor, ...apellido_autor] = nombre.trim().split(' ');
                return { nombre_autor, apellido_autor: apellido_autor.join(' ') };
              })
            : [],
          calificacionPromedio:
            row.calificacionPromedio !== null && row.calificacionPromedio !== undefined
              ? Number(row.calificacionPromedio)
              : undefined,
        }))
      : [];
  }

  async obtenerComentariosEvento(idEvento: number): Promise<any[]> {
    // JOIN para traer la calificación del evento del usuario si existe
    const sql = `
      SELECT c.*, eu.calificacion_evento
      FROM evento_comentario c
      LEFT JOIN evento_usuario eu
        ON eu.id_evento = c.id_evento AND eu.id_usuario = c.id_usuario
      WHERE c.id_evento = ?
      ORDER BY c.fecha_comentario DESC
    `;
    const [rows] = await this.pool.query(sql, [idEvento]);
    return Array.isArray(rows) ? rows : [];
  }
}
