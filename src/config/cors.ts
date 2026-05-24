import cors from "cors";

const allowedOrigins = [
	"http://localhost:4200",
	"https://localhost:4200",
	"http://192.168.0.14:4200",
	"https://192.168.0.14:4200",
];

/**
 * Middleware de configuración CORS para Express,
 * Permite solicitudes solo desde los orígenes especificados en allowedOrigins.
 */
export const corsConfig = cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) callback(null, true);
		else callback(new Error("No permitido por CORS"));
	},
});
