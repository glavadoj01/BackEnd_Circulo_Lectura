# BackEnd Circulo de Lectura

Backend para el proyecto educativo de un TFC. Proporciona una API REST para la gestión de usuarios, eventos, listas, libros y críticas.

## Requisitos mínimos

- **MySQL** >= 8.x (requiere instalación aparte de este proyecto)
- **npm** >= 11.6.x
- **Node.js** >= 22.21.x
- **Git** (opcional, para clonar el repositorio)

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/glavadoj01/BackEnd_Circulo_Lectura.git
cd BackEnd_Circulo_Lectura
```

### 2. Instalar dependencias

1. Instalar [Volta](https://volta.sh/)

   ```bash
   winget install Volta.Volta  # Instalar Volta
   volta install node@22       # Instalar Node@22
   volta pin node@22           # Fuerza el uso de Node@22 en este directorio
   ```

2. Instala NestJS CLI globalmente:

   ```bash
   volta install @nestjs/cli # Instalación Global
   ```

3. Instala las dependencias del proyecto:

   ```bash
   npm install
   ```

### 3. Configurar variables de entorno

1. Copia el archivo `_.env` y renómbralo a `.env` en la raíz del proyecto:
   - `_.env` → `.env`

2. Edita los valores según tu entorno MySQL:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password   # Editar esta línea con las credenciales propias
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_spanish_ci
DB_NAME=circuloLectura
```

### 4. Ejecutar el servidor

El backend está preparado para escuchar en el puerto **3000** y aceptar peticiones únicamente desde el frontend en `http://localhost:4200` o desde la IP local `http://192.168.0.19:4200` (CORS configurado por defecto).

- En modo desarrollo (con recarga automática):

  ```bash
  npm run dev
  ```

Si necesitas cambiar la IP local permitida, edita el array `allowedOrigins` en el archivo `src/main.ts`:

    ```js
    const allowedOrigins = [
    "http://localhost:4200",
    "https://localhost:4200",
    "http://192.168.0.19:4200",
    "https://192.168.0.19:4200",
    ];
    ```

### 5. Inicializar la base de datos desde la API

Utiliza el endpoint GET `/resetAPI` para crear y poblar la base de datos automáticamente (ejecuta los scripts SQL necesarios). Puedes acceder a este endpoint desde tu navegador o con una herramienta como Postman:

    ```bash
    GET http://localhost:3000/resetAPI
    ```

Esto ejecutará los scripts `scriptsBD/creacion.sql` y `scriptsBD/poblacionInicial.sql` en tu servidor MySQL.

## Endpoints principales

- **Usuarios:** `/usuarios`, `/usuario/:id`
- **Libros:** `/libros`, `/libro/:id`
- **Críticas:** `/libro/:id/criticas`, `/libro/:id/critica/usuario/:usuarioId `
- **Reset API:** `/resetAPI`

## Estructura del proyecto

El código fuente está organizado en las siguientes carpetas y archivos:

```bash
BackEnd_Circulo_Lectura/
├── .env                    # Variables de entorno (local, no versionar)
├── _.env                   # Plantilla de ejemplo de entorno
├── src/
│   ├── main.ts                # Punto de entrada
│   ├── Controllers/           # Lógica de negocio
│   ├── Routes/                # Definición de rutas
│   ├── Services/              # Servicios y conexión BD
│   ├── Interfaces/            # Modelos de datos
│   └── Utils/                 # Utilidades y validaciones
├── scriptsBD/                 # Scripts SQL
├── package.json               # Dependencias y scripts npm
├── tsconfig.json              # Configuración TypeScript
└── README.md                  # Este archivo
```

## Estructura del arranque - funcionamiento

```bash
main.ts                                         # Ejecuta la verificación de variables e inicia el servidor
  └── server/index.ts                               # Exporta la instancia final
        └── server/express.ts                       # Crea y configura el servidor
              ├── cors.ts                           # Exporta la configuración de acceso CORS
              └── routes/conexionBD.routes.ts       # Exporta las rutas y asocia a un metodo de controlador
                    ├── controladores
                    │      └── servicios
                    │             └── ConexionBD
                    └── middlewares                 # Intercepta las rutas y verifica accesos
```

## Notas adicionales

- El backend está preparado para funcionar con un frontend en Angular (por defecto CORS habilitado para `localhost:4200` y la IP local indicada).
- Si cambias el puerto o el origen del frontend, actualiza la configuración CORS en `src/main.ts`.
- Para dudas o problemas, abre un issue en el [repositorio](https://github.com/glavadoj01/BackEnd_Circulo_Lectura/issues).

## Enlaces de interes

- [Proyecto Fronted (Angular22/Tailwind)](https://github.com/glavadoj01/Circulo_Lectura_Fronted)
- [Proyecto/Documentación - Entregable](https://github.com/glavadoj01/TrabajoFinGradoDAW)

---

© Gonzalo Lavado, 2026
