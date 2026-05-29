import crypto from "crypto";
import { ConexionBD } from "./conexionBD.service.js";

export class LoginService extends ConexionBD {
	async login(
		email: string,
		password: string,
	): Promise<{ ok: boolean; token?: string; id_usuario?: number; esAdministrador?: number; error?: string }> {
		try {
			const [rows]: any = await this.pool.query(
				`SELECT id_usuario, password_hash , esAdministrador
          FROM usuario
          WHERE email_usuario = ?
          LIMIT 1
        `,
				[email],
			);

			if (!rows.length) {
				return { ok: false, error: "CREDENCIALES_EMAIL" };
			}

			const usuario = rows[0];

			const bcrypt = await import("bcrypt");
			const ok = await bcrypt.default.compare(password, usuario.password_hash);
			if (!ok) {
				return { ok: false, error: "CREDENCIALES_PASSWORD" };
			}

			const token = crypto
				.createHmac("sha256", process.env.SECRET!)
				.update(usuario.id_usuario + Date.now().toString())
				.digest("hex");

			// Eliminar sesiones anteriores del usuario
			await this.borrarRegistro("sesiones", {
				id_usuario: usuario.id_usuario,
			});

			// Guardar token en BD con expiración
			await this.pool.query(
				"INSERT INTO sesiones (token, id_usuario, expira) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))",
				[token, usuario.id_usuario],
			);

			let respuesta: { ok: boolean; token: string; id_usuario: number; esAdministrador?: number } = {
				ok: true,
				token,
				id_usuario: usuario.id_usuario,
			};

			if (usuario.esAdministrador === 1 || usuario.esAdministrador === 2) {
				respuesta = {
					...respuesta,
					esAdministrador: usuario.esAdministrador,
				};
			}

			return respuesta;
		} catch (err: any) {
			console.error("[SRV]Error en login:", err);
			return { ok: false, error: `INTERNO ${err.message}` };
		}
	}

	async cerrarSesion(token: string) {
		try {
			const row = await this.borrarRegistro("sesiones", {
				token: token,
				expira: { operador: ">=", valor: Date.now() },
			});
			if (!row.exito) {
				return { exito: false, datos: null, mensaje: row.mensaje };
			}
			if (row.datos.affectedRows === 0) {
				return { exito: false, datos: null, mensaje: "TOKEN_INVALIDO_O_EXPIRADO" };
			}
			return { exito: true, datos: null, mensaje: "SESION_CERRADA" };
		} catch (err: any) {
			console.error("[SRV]Error en cerrarSesion:", err);
			return { exito: false, datos: null, mensaje: err.message };
		}
	}

	async validarPassword(email: string, password: string) {
		const conexion = new ConexionBD();
		const resultado = await conexion.listarRegistros(
			"usuario",
			{ email_usuario: email },
			"",
			1,
			"id_usuario, password_hash",
		);

		if (!resultado.datos.length) return false;
		const bcrypt = await import("bcrypt");
		const ok = await bcrypt.default.compare(password, resultado.datos[0].password_hash);
		return ok;
	}
}
