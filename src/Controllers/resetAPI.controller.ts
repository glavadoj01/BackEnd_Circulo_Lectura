import { ConexionBD } from "../Services/conexionBD.service.js";
import { readFile } from "fs/promises";

export async function resetearAPI(_req: any, res: any) {
	let conexionAbierta = null as ConexionBD | null;
	try {
		conexionAbierta = new ConexionBD();
		await ejecutarSQL("./scriptsBD/creacion.sql", conexionAbierta);
		await ejecutarSQL("./scriptsBD/poblacionInicial.sql", conexionAbierta);
		res.status(200).json({ message: "API reseteada exitosamente" });
	} catch (error) {
		console.error("Error al resetear la API:", error);
		res.status(500).json({ error: "Error al resetear la API" });
	} finally {
		if (conexionAbierta) await conexionAbierta.close();
	}
}

async function ejecutarSQL(ruta: string, connection: ConexionBD) {
	const sql = await readFile(ruta, "utf8");
	const statements = sql
		.split(";")
		.map(stmt => stmt.trim())
		.filter(stmt => stmt.length > 0);
	for (const statement of statements) {
		await connection.query(statement);
	}
}
