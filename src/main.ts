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

	app.listen(srvPort, "0.0.0.0", () => {
		console.log(`[SRV] Servidor escuchando en el puerto ${srvPort}`);
		console.log("[SRV] Configuración de entorno:");
		console.log(`- DB_HOST: ${dbHost}`);
		console.log(`- DB_PORT: ${dbPort}`);
		console.log(`- DB_USER: ${dbUser}`);
		console.log(`- DB_NAME: ${dbName}`);
		console.log(`- SERVER_PORT: ${srvPort}`);
		console.log(`- DB_CHARSET: ${dbCharset}`);
		console.log(`- DB_COLLATION: ${dbCollation}`);
		console.log(`==================================\n\n\n\n`);
	});
} catch (error) {
	console.error("[ENV] Error de configuración:", error instanceof Error ? error.message : error);
	process.exit(1);
}
