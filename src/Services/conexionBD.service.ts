import mysql, { Pool, PoolConnection, RowDataPacket, FieldPacket } from "mysql2/promise";
import { LibroApp } from "../Interfaces/modelosApp/modelosApp.js";

interface ConexionConfig {
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
	charset?: string;
	collation?: string;
}

export class ConexionBD {
	private pool: Pool;
	private charset: string;
	private collation: string;

	/** Constructor para crear una nueva conexión a la base de datos. No se conecta automáticamente, sino que prepara el pool de conexiones.
	 *
	 * @param config Configuración de conexión a la base de datos (host, puerto, usuario, contraseña, nombre de BD, charset y collation opcionales).
	 * Se recomienda usar getConexionConfigFromEnv() para cargar desde variables de entorno.
	 */

	constructor(config: ConexionConfig) {
		this.charset = config.charset || "utf8mb4";
		this.collation = config.collation || "utf8mb4_spanish_ci";
		this.pool = mysql.createPool({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password,
			database: config.database,
			charset: this.charset,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
		});
	}

	/** Static - Crear Base de Datos (si no existe) con la configuración dada.
	 *
	 * @param config
	 * @returns boolean indicando si la base de datos fue creada o ya existía. No se conecta a la BD, solo la crea.
	 * @throws Error si ocurre algún problema durante la creación de la base de datos.
	 */
	static async crearBD(config: Omit<ConexionConfig, "database"> & { database: string }): Promise<boolean> {
		const { host, port, user, password, database, charset = "utf8mb4", collation = "utf8mb4_spanish_ci" } = config;
		const connection = await mysql.createConnection({ host, port, user, password, charset });
		try {
			await connection.query(
				`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET ${charset} COLLATE ${collation}`,
			);
			return true;
		} finally {
			await connection.end();
		}
	}

	/** Crear una tabla en la base de datos con el nombre, columnas y opciones dadas. Las columnas se definen como un objeto donde la clave es el nombre de la columna y el valor es su definición SQL (tipo, restricciones, etc.).
	 *
	 * @param tabla String con el nombre de la tabla a crear.
	 * @param columnas Objeto con las columnas a crear, donde la clave es el nombre de la columna y el valor es su definición SQL (tipo, restricciones, etc.). Ejemplo: { id_usuario: "INT PRIMARY KEY AUTO_INCREMENT", nombre_usuario: "VARCHAR(255) NOT NULL" }
	 * @param opciones Objeto Opcional con opciones adicionales para la tabla (como ENGINE, CHARSET, COLLATE, etc.). Si no se proporcionan, se usarán los valores por defecto del constructor.
	 * @returns Boolean indicando si la tabla fue creada o ya existía.
	 * @throws Error si ocurre algún problema durante la creación de la tabla o si los parámetros son inválidos.
	 */
	async crearTabla(tabla: string, columnas: Record<string, string>, opciones = ""): Promise<boolean> {
		if (!tabla || !columnas || Object.keys(columnas).length === 0)
			throw new Error("Nombre de tabla o columnas vacías.");
		const partes = Object.entries(columnas).map(([col, def]) => `\`${col}\` ${def}`);
		let sql = `CREATE TABLE IF NOT EXISTS \`${tabla}\` (${partes.join(", ")})`;
		sql += opciones ? ` ${opciones}` : ` ENGINE=InnoDB DEFAULT CHARSET=${this.charset} COLLATE=${this.collation}`;
		await this.pool.query(sql);
		return true;
	}

	/** Insertar un nuevo registro en la tabla especificada con los datos proporcionados. Los datos se pasan como un objeto donde la clave es el nombre de la columna y el valor es el valor a insertar. El método devuelve el ID del nuevo registro insertado (si la tabla tiene una columna AUTO_INCREMENT) o 0 si no se pudo obtener el ID.
	 *
	 * @param tabla String con el nombre de la tabla donde se insertará el registro.
	 * @param datos Objeto con los datos a insertar, donde la clave es el nombre de la columna y el valor es el valor a insertar. Ejemplo: { nombre_usuario: "Juan", nombre_real: "Juan Pérez" }
	 * @returns ID del nuevo registro insertado (si la tabla tiene una columna AUTO_INCREMENT) o 0 si no se pudo obtener el ID.
	 * @throws Error si ocurre algún problema durante la inserción o si los parámetros son inválidos.
	 */
	async insertarRegistro(tabla: string, datos: Record<string, any>): Promise<number> {
		if (!tabla || !datos || Object.keys(datos).length === 0) throw new Error("Tabla o datos vacíos.");
		const columnas = Object.keys(datos)
			.map(col => `\`${col}\``)
			.join(", ");
		const placeholders = Object.keys(datos)
			.map(() => "?")
			.join(", ");
		const valores = Object.values(datos);
		const sql = `INSERT INTO \`${tabla}\` (${columnas}) VALUES (${placeholders})`;
		const [result]: any = await this.pool.query(sql, valores);
		return result.insertId || 0;
	}

	/** Borrar registros de la tabla especificada que cumplan con las condiciones dadas. Las condiciones se pasan como un objeto donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para eliminar el registro. El método devuelve el número de registros afectados (eliminados).
	 *
	 * @param tabla String con el nombre de la tabla de la cual se eliminarán los registros.
	 * @param condiciones Objeto con las condiciones para eliminar los registros, donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para eliminar el registro. Ejemplo: { id_usuario: 5 } eliminará el registro donde id_usuario sea igual a 5.
	 * @returns Número de registros afectados (eliminados).
	 * @throws Error si ocurre algún problema durante la eliminación o si los parámetros son inválidos.
	 */
	async borrarRegistro(tabla: string, condiciones: Record<string, any>): Promise<number> {
		if (!tabla || !condiciones || Object.keys(condiciones).length === 0)
			throw new Error("Tabla o condiciones vacías.");
		const clausulas = Object.keys(condiciones)
			.map(col => `\`${col}\` = ?`)
			.join(" AND ");
		const valores = Object.values(condiciones);
		const sql = `DELETE FROM \`${tabla}\` WHERE ${clausulas}`;
		const [result]: any = await this.pool.query(sql, valores);
		return result.affectedRows;
	}

	/** Actualizar registros de la tabla especificada que cumplan con las condiciones dadas, estableciendo los nuevos valores proporcionados. Los datos a actualizar se pasan como un objeto donde la clave es el nombre de la columna y el valor es el nuevo valor a establecer. Las condiciones se pasan como un objeto donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para actualizar el registro. El método devuelve el número de registros afectados (actualizados).
	 *
	 * @param tabla String con el nombre de la tabla donde se actualizarán los registros.
	 * @param datos Objeto con los datos a actualizar, donde la clave es el nombre de la columna y el valor es el nuevo valor a establecer. Ejemplo: { nombre_usuario: "Carlos" } actualizará el campo nombre_usuario a "Carlos".
	 * @param condiciones Objeto con las condiciones para actualizar los registros, donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para actualizar el registro. Ejemplo: { id_usuario: 5 } actualizará el registro donde id_usuario sea igual a 5.
	 * @returns Número de registros afectados (actualizados).
	 * @throws Error si ocurre algún problema durante la actualización o si los parámetros son inválidos.
	 */
	async actualizarRegistro(
		tabla: string,
		datos: Record<string, any>,
		condiciones: Record<string, any>,
	): Promise<number> {
		if (
			!tabla ||
			!datos ||
			!condiciones ||
			Object.keys(datos).length === 0 ||
			Object.keys(condiciones).length === 0
		) {
			throw new Error("Tabla, datos o condiciones vacías.");
		}
		const sets = Object.keys(datos)
			.map(col => `\`${col}\` = ?`)
			.join(", ");
		const clausulas = Object.keys(condiciones)
			.map(col => `\`${col}\` = ?`)
			.join(" AND ");
		const valores = [...Object.values(datos), ...Object.values(condiciones)];
		const sql = `UPDATE \`${tabla}\` SET ${sets} WHERE ${clausulas}`;
		const [result]: any = await this.pool.query(sql, valores);
		return result.affectedRows;
	}

	/** Listar registros de la tabla especificada que cumplan con las condiciones dadas, ordenados y limitados según los parámetros proporcionados. Las condiciones se pasan como un objeto donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para incluir el registro en el resultado. El orden se especifica como una cadena con el formato "columna ASC" o "columna DESC". El límite se especifica como un número entero que indica la cantidad máxima de registros a devolver. Las columnas a seleccionar se especifican como una cadena con los nombres de las columnas separados por comas (por defecto "*"). El método devuelve un array de objetos representando los registros encontrados.
	 *
	 * @param tabla String con el nombre de la tabla de la cual se listarán los registros.
	 * @param condiciones Objeto con las condiciones para listar los registros, donde la clave es el nombre de la columna y el valor es el valor que debe coincidir para incluir el registro en el resultado. Ejemplo: { pais_usuario: "España" } listará los registros donde pais_usuario sea igual a "España".
	 * @param orden String con el orden para listar los registros, con el formato "columna ASC" o "columna DESC". Ejemplo: "nombre_usuario ASC" ordenará los resultados por nombre_usuario en orden ascendente.
	 * @param limite Número entero que indica la cantidad máxima de registros a devolver. Ejemplo: 10 limitará el resultado a los primeros 10 registros encontrados.
	 * @param columnas Opcional - String con los nombres de las columnas a seleccionar, separados por comas. Por defecto es "*", lo que selecciona todas las columnas. Ejemplo: "id_usuario, nombre_usuario" seleccionará solo las columnas id_usuario y nombre_usuario.
	 * @returns Array de objetos representando los registros encontrados que cumplen con las condiciones, ordenados y limitados según los parámetros proporcionados.
	 * @throws Error si ocurre algún problema durante la consulta o si los parámetros son inválidos.
	 */
	async listarRegistros(
		tabla: string,
		condiciones: Record<string, any> = {},
		orden = "",
		limite = 0,
		columnas = "*",
	): Promise<any[]> {
		if (!tabla) throw new Error("Nombre de tabla vacío.");
		let sql = `SELECT ${columnas} FROM \`${tabla}\``;
		const valores: any[] = [];
		if (Object.keys(condiciones).length > 0) {
			const clausulas = Object.keys(condiciones)
				.map(col => `\`${col}\` = ?`)
				.join(" AND ");
			sql += ` WHERE ${clausulas}`;
			valores.push(...Object.values(condiciones));
		}
		if (orden) sql += ` ORDER BY ${orden}`;
		if (limite > 0) sql += ` LIMIT ${limite}`;
		const [rows]: [any[], FieldPacket[]] = await this.pool.query(sql, valores);
		return rows;
	}

	/* ===========================================================================================================
* Métodos adicionales con sentencias complejas (innerjoins, subconsultas, etc.)
=========================================================================================================== */

	async listarLibrosConAutoresYGeneros(
		condiciones: Record<string, any> = {},
		orden = "",
		limite = 0,
		columnas = "*",
	): Promise<LibroApp[]> {
		// Selección de columnas de libro
		let selectCols =
			columnas === "*"
				? "l.*"
				: columnas
						.split(",")
						.map(c => `l.${c.trim()}`)
						.join(", ");
		// Agrega los campos agregados
		selectCols += `,
		GROUP_CONCAT(DISTINCT a.nombre_autor ORDER BY a.nombre_autor SEPARATOR ',') AS autores,
		GROUP_CONCAT(DISTINCT g.nombre_genero ORDER BY g.nombre_genero SEPARATOR ',') AS generos`;

		let sql = `SELECT ${selectCols} FROM libro AS l
		       LEFT JOIN libro_autor AS la ON l.id_libro = la.id_libro
		       LEFT JOIN autor AS a ON la.id_escritor = a.id_autor
		       LEFT JOIN libro_genero AS lg ON l.id_libro = lg.id_libro
		       LEFT JOIN genero AS g ON lg.id_genero = g.id_genero
		       `;
		const valores: any[] = [];
		if (Object.keys(condiciones).length > 0) {
			const clausulas = Object.keys(condiciones)
				.map(col => `l.\`${col}\` = ?`)
				.join(" AND ");
			sql += ` WHERE ${clausulas}`;
			valores.push(...Object.values(condiciones));
		}
		sql += ` GROUP BY l.id_libro`;
		if (orden) sql += ` ORDER BY ${orden}`;
		if (limite > 0) sql += ` LIMIT ${limite}`;

		const [rows]: [any[], any[]] = await this.pool.query(sql, valores);
		return rows;
	}

	// ! REQUIERE LLAMADA EXPLICITA PARA CERRAR LA CONEXIÓN
	/** Cerrar el pool de conexiones a la base de datos. Este método debe ser llamado explícitamente cuando ya no se necesite la conexión para liberar los recursos.
	 *  @returns void
	 */
	async close(): Promise<void> {
		await this.pool.end();
	}
}

/** Obtencion de credenciales de conexión a la base de datos desde variables de entorno.
 *
 * @returns ConexionConfig con los parámetros de conexión obtenidos de las variables de entorno o valores por defecto si no se encuentran.
 */
export function getConexionConfigFromEnv(): ConexionConfig {
	return {
		host: process.env.DB_HOST || "localhost",
		port: Number(process.env.DB_PORT) || 3306,
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		database: process.env.DB_NAME || "circuloLectura",
		charset: process.env.DB_CHARSET || "utf8mb4",
		collation: process.env.DB_COLLATION || "utf8mb4_spanish_ci",
	};
}
