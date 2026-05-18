import crypto from 'crypto';
import { ConexionBD } from './conexionBD.service.js';

export class LoginService extends ConexionBD {
  async login(email: string, password: string) {
    try {
      const [rows]: any = await this.pool.query(
        'SELECT id_usuario, password_hash FROM usuarios WHERE email = ? LIMIT 1',
        [email],
      );

      if (!rows.length) {
        return { ok: false, error: 'CREDENCIALES_EMAIL' };
      }

      const usuario = rows[0];

      const bcrypt = await import('bcrypt');
      const ok = await bcrypt.default.compare(password, usuario.password_hash);
      if (!ok) {
        return { ok: false, error: 'CREDENCIALES_PASSWORD' };
      }

      const token = crypto
        .createHmac('sha256', process.env.SECRET!)
        .update(usuario.id_usuario + Date.now().toString())
        .digest('hex');

      // Guardar token en BD con expiración
      await this.pool.query(
        'INSERT INTO sesiones (id_usuario, token, expira) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))',
        [usuario.id_usuario, token],
      );

      return {
        ok: true,
        token,
        id_usuario: usuario.id_usuario,
      };
    } catch (error) {
      console.error('[SRV]Error en login:', error);
      return { ok: false, error: 'INTERNO' };
    }
  }
}
