import { pruebaCon } from "./config/pruebaCon.js";
import { obtenerEnv } from "./config/env.js";
import { app } from "./server/index.js";

try {
	/*--------------------
  Validar la existencia de las variables de entorno necesarias para la configuración de la base de datos
  ----------------------*/
	// Obligatorias con valor por defecto
	const dbHost = obtenerEnv("DB_HOST", { requerido: true, defaultValue: "localhost" });
	const dbPort = Number(obtenerEnv("DB_PORT", { requerido: true, defaultValue: "3306" }));
	const dbUser = obtenerEnv("DB_USER", { requerido: true, defaultValue: "root" });
	const dbName = obtenerEnv("DB_NAME", { requerido: true, defaultValue: "circuloLectura" });
	const srvPort = Number(obtenerEnv("SERVER_PORT", { requerido: true, defaultValue: "3000" }));
	// Opcionales con valor por defecto
	const dbCharset = obtenerEnv("DB_CHARSET", { requerido: false, defaultValue: "utf8mb4" });
	const dbCollation = obtenerEnv("DB_COLLATION", {
		requerido: false,
		defaultValue: "utf8mb4_spanish_ci",
	});
	// Obligatorias sin valor por defecto
	obtenerEnv("DB_PASSWORD", { requerido: true });
	obtenerEnv("SECRET", { requerido: true });

	if (!Number.isInteger(srvPort) || srvPort <= 0) {
		console.error("[ENV] SERVER_PORT/PORT debe ser un entero positivo.");
		process.exit(1);
	}
	if (!Number.isInteger(dbPort) || dbPort <= 0) {
		console.error("[ENV] DB_PORT debe ser un entero positivo.");
		process.exit(1);
	}
	console.log("[ENV] Configuración cargada correctamente.");
	console.log("=============================================");

	console.log(`[SRV] Configuración de entorno:
	- SERVER_HOST: localhost
	- SERVER_PORT: ${srvPort}
	- DB_HOST: ${dbHost}
	- DB_PORT: ${dbPort}
	- DB_USER: ${dbUser}
	- DB_NAME: ${dbName}
	- DB_CHARSET: ${dbCharset}
	- DB_COLLATION: ${dbCollation}
=============================================`);

	await pruebaCon();

	app.listen(srvPort, `0.0.0.0`, () => {
		console.log(`[SRV] Servidor escuchando en: localhost:${srvPort}`);
		console.log("=============================================\n");
	});
} catch (error: any) {
	console.error("[ENV] Error de configuración:\n", error.message || error.errors[0] || error);
	console.log("=============================================\n");
	process.exit(1);
}
