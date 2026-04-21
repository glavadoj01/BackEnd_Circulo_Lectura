// Para el servidor Express
import express from 'express';
import conexionRouter from './Routes/conexionBD.routes.js';
import * as dotenv from 'dotenv'; // Para gestion y carga de credenciales desde archivos .env
import cors from 'cors'; // Para habilitar CORS y permitir peticiones desde el frontend
// Para la páginas defaults

// Asociacion de metodos de express a la variable app
const app = express();
const envResult = dotenv.config();
if (envResult.error) {
  console.error('[ENV] No se pudo cargar el archivo .env en la raíz del proyecto.');
  console.error('[ENV] Detalle:', envResult.error.message);
  process.exit(1);
}

function obtenerEnv(
  nombre: string,
  opciones?: { requerido?: boolean; defaultValue?: string; permitirVacio?: boolean },
): string {
  const valor = process.env[nombre];
  const requerido = opciones?.requerido ?? false;
  const permitirVacio = opciones?.permitirVacio ?? false;

  if (valor === undefined) {
    if (opciones?.defaultValue !== undefined) {
      return opciones.defaultValue;
    }
    if (requerido) {
      throw new Error(`[ENV] Falta variable requerida: ${nombre}`);
    }
    return '';
  }

  const limpio = valor.trim();
  if (!permitirVacio && limpio.length === 0) {
    if (opciones?.defaultValue !== undefined) {
      return opciones.defaultValue;
    }
    if (requerido) {
      throw new Error(`[ENV] Variable vacía no permitida: ${nombre}`);
    }
  }

  return limpio;
}

let puertoServidor = 3000;
try {
  const dbHost = obtenerEnv('DB_HOST', { requerido: true });
  const dbPortRaw = obtenerEnv('DB_PORT', { requerido: true });
  const dbUser = obtenerEnv('DB_USER', { requerido: true });
  const dbDatabase = obtenerEnv('DB_NAME', { requerido: true });

  if (!dbDatabase) {
    throw new Error('[ENV] Debes definir DB_NAME.');
  }

  const dbPort = Number(dbPortRaw);
  if (!Number.isInteger(dbPort) || dbPort <= 0) {
    throw new Error('[ENV] DB_PORT debe ser un entero positivo.');
  }

  // Normaliza para que el resto del backend lea siempre ambos nombres sin romper compatibilidad.
  process.env.DB_DATABASE = dbDatabase;
  process.env.DB_NAME = dbDatabase;

  const puertoRaw = obtenerEnv('SERVER_PORT', {
    defaultValue: obtenerEnv('PORT', { defaultValue: '3000' }),
  });
  const puerto = Number(puertoRaw);
  if (!Number.isInteger(puerto) || puerto <= 0) {
    throw new Error('[ENV] SERVER_PORT/PORT debe ser un entero positivo.');
  }
  puertoServidor = puerto;

  console.log('[ENV] Archivo .env cargado correctamente.');
  console.log('[ENV] Configuración detectada:', {
    DB_HOST: dbHost,
    DB_PORT: dbPort,
    DB_USER: dbUser,
    DB_NAME: dbDatabase,
    SERVER_PORT: puertoServidor,
  });
} catch (error) {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error('[ENV] Error de configuración:', mensaje);
  process.exit(1);
}
const rutas = conexionRouter;
// Middleware para parsear JSON
// En postman, seleccionar Body -> raw -> JSON => Enviar formato JSON
app.use(express.json());

// Habilita CORS solo para el frontend en localhost:4200 e IP Local
const allowedOrigins = [
  'http://localhost:4200',
  'https://localhost:4200',
  'http://192.168.0.19:4200',
  'https://192.168.0.19:4200',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
  }),
);

app.use(rutas);

// Iniciar el servidor en el puerto 3000
app.listen(puertoServidor, '0.0.0.0', () => {
  console.log('Actualización del Srv 😀');
  console.log(`Servidor escuchando en el puerto ${puertoServidor}`);
  console.log('[CORS] Orígenes permitidos:', allowedOrigins);
});
