import { ConexionBD } from '../Services/conexionBD.service.js';
import { readFile } from 'fs/promises';
import { respuestaError, respuestaOk } from '../Utils/validationMessages.utils.js';

export async function resetearAPI(_req: any, res: any) {
  let conexionAbierta = null as ConexionBD | null;
  try {
    conexionAbierta = new ConexionBD();
    await ejecutarSQL('./scriptsBD/creacion.sql', conexionAbierta);
    await ejecutarSQL('./scriptsBD/poblacionInicial.sql', conexionAbierta);
    return respuestaOk(res, 200, 'API_RESETEADA_OK');
  } catch (error) {
    console.error('Error al resetear la API:', error);
    return respuestaError(res, 500, 'ERROR_RESETEAR_API');
  } finally {
    if (conexionAbierta) await conexionAbierta.close();
  }
}

async function ejecutarSQL(ruta: string, connection: ConexionBD) {
  const sql = await readFile(ruta, 'utf8');
  const statements = sql
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);
  for (const statement of statements) {
    await connection.query(statement);
  }
}
