import { ConexionBD } from "../services/conexionBD.service.js";

export async function pruebaCon(): Promise<void> {
	let conex: ConexionBD | null = null;
	try {
		console.log("🔌 Intentando conectar con la base de datos...");
		conex = new ConexionBD();

		await conex.probarConexion();

		console.log(" 👌 Conexión exitosa a la base de datos");
	} catch (error: any) {
		console.error(" ☠️\tError al conectar con la base de datos:\n\t-", error.message || error.code || error);
		throw error as Error;
	} finally {
		if (conex) {
			conex.close();
		}
		console.log("=============================================");
	}
}
