import { ConexionBD } from './conexionBD.service.js';
import { EventoBD, EventoUsuario } from '../Interfaces/modelosBD/modelosBD.js';
import { LibroResumen } from '../Interfaces/modelosApp/modelosApp.js';

export class ConexionEventos extends ConexionBD {
  async obtenerEventoPorId(idEvento: number): Promise<EventoBD | null> {
    const sql = 'SELECT * FROM evento WHERE id_evento = ?';
    const [rows] = await this.pool.query(sql, [idEvento]);
    return Array.isArray(rows) && rows.length > 0 ? (rows[0] as EventoBD) : null;
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
