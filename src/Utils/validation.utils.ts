export function parsePositiveInt(value: unknown): number {
	const raw = Array.isArray(value) ? value[0] : value;
	const num = Number(raw);
	return Number.isInteger(num) && num > 0 ? num : Number.NaN;
}

export function parseCalificacion(value: unknown): number {
	const num = Number(value);
	return Number.isInteger(num) && num >= 1 && num <= 5 ? num : Number.NaN;
}
