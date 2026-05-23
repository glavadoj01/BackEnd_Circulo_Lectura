import * as dotenv from "dotenv";

dotenv.config();

/**
 * Función para obtener variables de entorno con validación y opciones.
 * @param nombre Nombre de la variable de entorno a obtener.
 * @param opciones Opciones para validar la variable:
 *   - requerido?: Si es true, lanza un error si la variable no está definida.
 *   - defaultValue?: Valor por defecto a usar si la variable no está definida o es vacía.
 *   - permitirVacio?: Si es false, lanza un error si la variable está definida pero es una cadena vacía.
 * @returns
 */
export function obtenerEnv(
	nombre: string,
	opciones?: { requerido?: boolean; defaultValue?: string; permitirVacio?: boolean },
): string {
	const valor = process.env[nombre];
	const requerido = opciones?.requerido ?? false;
	const permitirVacio = opciones?.permitirVacio ?? false;

	if (valor === undefined) {
		if (opciones?.defaultValue !== undefined) return opciones.defaultValue;
		if (requerido) throw new Error(`[ENV] Falta variable requerida: ${nombre}`);
		return "";
	}

	const limpio = valor.trim();
	if (!permitirVacio && limpio.length === 0) {
		if (opciones?.defaultValue !== undefined) return opciones.defaultValue;
		if (requerido) throw new Error(`[ENV] Variable vacía no permitida: ${nombre}`);
	}

	return limpio;
}
