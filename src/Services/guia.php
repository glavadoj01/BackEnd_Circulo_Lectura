<?php

/* ================================================================================================================
Clase de conexión a la base de datos
    Atributo:
        - $conexion: Instancia de PDO para la conexión a la base de datos
        - $charset: Conjunto de caracteres a utilizar en la conexión (por defecto utf8mb4)
        - $collation: Intercalación a utilizar en la conexión (por defecto utf8mb4_spanish_ci)

    Método Estatico:
        - crearBD: Método estático para crear una base de datos (conexión previa sin especificar base de datos)

    Métodos de Instancia:
        - __construct: Establece la conexión a la base de datos
        - crearTabla: Crea una tabla en la base de datos
        - insertarRegistro: Inserta un registro en una tabla
        - borrarRegistro: Borra un registro de una tabla según condiciones
        - actualizarRegistro: Actualiza un registro de una tabla según condiciones
        - listarRegistros: Lista registros de una tabla según condiciones, orden, límite y columnas especificados
        - __destruct: Cierra la conexión a la base de datos al destruir la instancia

================================================================================================================ */

class ConexionBD
{

    private $conexion;
    private $charset;
    private $collation;

    /** Constructor de la clase ConexionBD (conexión a una base de datos en especifico)
     * 
     * @param string $servidor  Dirección del servidor de la base de datos
     * @param string $puerto    Puerto de conexión a la base de datos
     * @param string $usuario   Usuario para acceder a la base de datos
     * @param string $clave     Contraseña para acceder a la base de datos
     * @param string $bd        Nombre de la base de datos a conectar
     * @param string $charset   Conjunto de caracteres a utilizar en la conexión (por defecto utf8mb4)
     * @param string $collation Intercalación a utilizar en la conexión (por defecto utf8mb4_spanish_ci)
     * 
     * @throws \Exception       Si ocurre un error al establecer la conexión
     */
    function __construct(string $servidor, string $puerto, string $usuario, string $clave, string $bd, string $charset = 'utf8mb4', string $collation = 'utf8mb4_spanish_ci')
    {
        try {
            $this->conexion = new PDO(
                "mysql:host=$servidor:$puerto;
                dbname=$bd",
                $usuario,
                $clave
            );
            $this->conexion->setAttribute(
                PDO::ATTR_ERRMODE,
                PDO::ERRMODE_EXCEPTION
            );
            $this->charset = $charset;
            $this->collation = $collation;
            $this->conexion->exec("SET CHARACTER SET $charset");
        } catch (PDOException $e) {
            throw new \Exception("Error al realizar la conexión:<br>" . $e->getMessage());
        }
    }


    /** Crear BD (Método estatico, previo a la conexión => Conecta => Crea BD => Desconecta)
     * 
     * @param string $servidor  Dirección del servidor de la base de datos
     * @param string $puerto    Puerto de conexión a la base de datos
     * @param string $usuario   Usuario para acceder a la base de datos
     * @param string $clave     Contraseña para acceder a la base de datos
     * @param string $bd        Nombre de la base de datos a crear
     * @param string $charset   Conjunto de caracteres a utilizar en la conexión (por defecto utf8mb4)
     * @param string $collation Intercalación a utilizar en la conexión (por defecto utf8mb4_spanish_ci)
     * 
     * @return bool             Devuelve true si la base de datos se creó correctamente o ya existía
     * @throws \Exception       Si ocurre un error al crear la base de datos
     */
    static function crearBD(string $servidor, string $puerto, string $usuario, string $clave, string $bd, string $charset = 'utf8mb4', string $collation = 'utf8mb4_spanish_ci'): bool
    {
        try {
            // Conexión SIN especificar base de datos para poder crear la base de datos Nueva
            // Ademas esta variable $conexion es local dentro de este método, no afecta a la variable $conexion del constructor/clase (no tiene $this->)
            $conexion = new PDO("mysql:host=$servidor:$puerto;charset=$charset", $usuario, $clave);
            $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $sql = "CREATE DATABASE IF NOT EXISTS $bd CHARACTER SET $charset COLLATE $collation";
            $conexion->exec($sql);

            return true;
        } catch (PDOException $e) {
            throw new \Exception("Error al crear la BD '$bd':<br>" . $e->getMessage());
        } finally {
            $conexion = null;
        }
    }

    /** Crear Tabla
     * 
     * @param string $tabla     Nombre de la tabla a crear
     * @param array $columnas   Array asociativo con el nombre de la columna como clave y la definición de la columna como valor (ej: ['id' => 'INT PRIMARY KEY AUTO_INCREMENT'])
     * @param string $opciones  Opciones adicionales para la tabla (ej: 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4')
     * 
     * @return bool             Devuelve true si la tabla se creó correctamente o ya existía
     * @throws \Exception       Si ocurre un error al crear la tabla o si los parámetros son inválidos
     * 
     * Ej: $conexion->crearTabla('libros', ['id' => 'INT PRIMARY KEY AUTO_INCREMENT', 'titulo' => 'VARCHAR(255) NOT NULL', 'autor' => 'VARCHAR(255) NOT NULL']
     */
    public function crearTabla(string $tabla, array $columnas, string $opciones = ''): bool
    {
        try {
            if (empty($tabla) || empty($columnas)) {
                throw new \InvalidArgumentException("Nombre de tabla o columnas vacias.");
            }

            $partes = [];
            foreach ($columnas as $nombreCol => $defCol) {
                $partes[] = $nombreCol . ' ' . $defCol;
            }

            $sql = "CREATE TABLE IF NOT EXISTS $tabla (" . implode(', ', $partes) . ")";
            if ($opciones !== '') {
                $sql .= ' ' . $opciones;
            } else {
                $sql .= " ENGINE=InnoDB DEFAULT CHARSET={$this->charset} COLLATE={$this->collation}";
            }

            $this->conexion->exec($sql);
            return true;
        } catch (PDOException $e) {
            throw new \Exception("Error al crear tabla '$tabla':<br>" . $e->getMessage());
        }
    }

    /** Insertar Registro
     * 
     * @param string $tabla  Nombre de la tabla donde se insertará el registro
     * @param array $datos   Array asociativo con el nombre de la columna como clave y el valor a insertar como valor (ej: ['titulo' => 'El Quijote', 'autor' => 'Miguel de Cervantes'])
     * 
     * @return string        ID del registro insertado si la tabla tiene una columna AUTO_INCREMENT) o 0 (cero) en caso de no tener una columna AUTO_INCREMENT
     * @throws \Exception    Si ocurre un error al insertar el registro o si los parámetros son inválidos
     *
     * Ej: $conexion->insertarRegistro('libros', ['titulo' => 'El Quijote', 'autor' => 'Miguel de Cervantes']);
     *  sql: INSERT INTO libros (titulo, autor) VALUES (:titulo, :autor)
     *  $columnas = ['titulo', 'autor']
     *  $placeholders = [':titulo', ':autor']
     *
     *  $campo = 'titulo', $valor = 'El Quijote' => $stmt->bindValue(':titulo', 'El Quijote')
     */
    public function insertarRegistro(string $tabla, array $datos): string
    {
        try {
            if (empty($tabla) || empty($datos)) {
                throw new \InvalidArgumentException("Tabla o datos vacios.");
            }

            $columnas = implode(', ', array_keys($datos));
            $placeholders = ':' . implode(', :', array_keys($datos));

            $sql = "INSERT INTO $tabla ($columnas) VALUES ($placeholders)";
            $stmt = $this->conexion->prepare($sql);

            foreach ($datos as $campo => $valor) {
                $stmt->bindValue(':' . $campo, $valor);
            }

            $stmt->execute();

            return $this->conexion->lastInsertId();
        } catch (PDOException $e) {
            throw new \Exception("Error al insertar en '$tabla':<br>" . $e->getMessage());
        }
    }

    /** Borrar Registro
     * 
     * @param string $tabla      Nombre de la tabla donde se borrará el registro
     * @param array $condiciones Array asociativo con el nombre de la columna como clave y el valor a comparar como valor (ej: ['id' => 5])
     * 
     * @return int               Número de filas afectadas por el borrado
     * @throws \Exception        Si ocurre un error al borrar el registro o si los parámetros son inválidos
     * 
     * Ej: $conexion->borrarRegistro('libros', ['id' => 5]);
     */
    public function borrarRegistro(string $tabla, array $condiciones): int
    {
        try {
            if (empty($tabla) || empty($condiciones)) {
                throw new \InvalidArgumentException("Tabla o condiciones vacias.");
            }

            $clausulas = [];
            foreach ($condiciones as $campo => $valor) {
                $clausulas[] = "$campo = :$campo";
            }

            $sql = "DELETE FROM $tabla WHERE " . implode(' AND ', $clausulas);
            $stmt = $this->conexion->prepare($sql);

            foreach ($condiciones as $campo => $valor) {
                $stmt->bindValue(':' . $campo, $valor);
            }

            $stmt->execute();

            return $stmt->rowCount();
        } catch (PDOException $e) {
            throw new \Exception("Error al borrar en '$tabla':<br>" . $e->getMessage());
        }
    }

    /** Actualizar Registro
     * 
     * @param string $tabla      Nombre de la tabla donde se actualizará el registro
     * @param array $datos       Array asociativo con el nombre de la columna como clave y el nuevo valor a actualizar como valor (ej: ['titulo' => 'El Quijote', 'autor' => 'Miguel de Cervantes'])
     * @param array $condiciones Array asociativo con el nombre de la columna como clave y el valor a comparar como valor (ej: ['id' => 5])
     * 
     * @return int               Número de filas afectadas por la actualización
     * @throws \Exception        Si ocurre un error al actualizar el registro o si los parámetros son inválidos
     *
     * Ej: $conexion->actualizarRegistro('libros', ['titulo' => 'El Quijote', 'autor' => 'Miguel de Cervantes'], ['id' => 5]);
     *
     * Nota: _where => Se utiliza para diferenciar los parámetros de actualización de los parámetros de condición en caso de que tengan el mismo nombre (ej: actualizar el campo 'id' con un nuevo valor pero solo para el registro con id = 5)
     *  sql: UPDATE libros SET titulo = :titulo, autor = :autor WHERE id = :where_id
     */
    public function actualizarRegistro(string $tabla, array $datos, array $condiciones): int
    {
        try {
            if (empty($tabla) || empty($datos) || empty($condiciones)) {
                throw new \InvalidArgumentException("Tabla, datos o condiciones vacias.");
            }

            $sets = [];
            foreach ($datos as $campo => $valor) {
                $sets[] = "$campo = :$campo";
            }

            $clausulas = [];
            foreach ($condiciones as $campo => $valor) {
                $clausulas[] = "$campo = :where_$campo";
            }

            $sql = "UPDATE $tabla SET " . implode(', ', $sets) . " WHERE " . implode(' AND ', $clausulas);
            $stmt = $this->conexion->prepare($sql);

            foreach ($datos as $campo => $valor) {
                $stmt->bindValue(':' . $campo, $valor);
            }

            foreach ($condiciones as $campo => $valor) {
                $stmt->bindValue(':where_' . $campo, $valor);
            }

            $stmt->execute();

            return $stmt->rowCount();
        } catch (PDOException $e) {
            throw new \Exception("Error al actualizar '$tabla':<br>" . $e->getMessage());
        }
    }

    /** Listar Registros
     * 
     * @param string $tabla          Nombre de la tabla de donde se listarán los registros
     * @param array $condiciones     Array asociativo con el nombre de la columna como clave y el valor a comparar como valor (ej: ['autor' => 'Miguel de Cervantes'])
     * @param string $orden          Cadena con el orden de los resultados (ej: 'titulo ASC' o 'id DESC')
     * @param int $limite            Número máximo de registros a listar (0 para sin límite)
     * @param string $columnas       Cadena con las columnas a seleccionar (ej: 'id, titulo, autor' o '*' para todas las columnas)
     * @param int $tipoFetch         Constante de PDO para el tipo de fetch (ej: PDO::FETCH_ASSOC, PDO::FETCH_NUM, PDO::FETCH_BOTH, PDO::FETCH_OBJ)
     * 
     * @return array                 Array con los registros listados según las condiciones, orden, límite y columnas especificados
     * @throws \Exception            Si ocurre un error al listar los registros o si los parámetros son inválidos
     * 
     * Ej: $conexion->listarRegistros('libros', ['autor' => 'Miguel de Cervantes'], 'titulo ASC', 10, 'id, titulo', PDO::FETCH_ASSOC);
     *  sql: SELECT id, titulo FROM libros WHERE autor = :autor ORDER BY titulo ASC LIMIT 10
     */
    public function listarRegistros(
        string $tabla,
        array $condiciones = [],
        string $orden = '',
        int $limite = 0,
        string $columnas = '*',
        int $tipoFetch = PDO::FETCH_ASSOC
    ): array {
        try {
            if (empty($tabla)) {
                throw new \InvalidArgumentException("Nombre de tabla vacio.");
            }

            $sql = "SELECT $columnas FROM $tabla";

            if (!empty($condiciones)) {
                $clausulas = [];
                foreach ($condiciones as $campo => $valor) {
                    $clausulas[] = "$campo = :$campo";
                }
                $sql .= " WHERE " . implode(' AND ', $clausulas);
            }

            if ($orden !== '') {
                $sql .= " ORDER BY $orden";
            }

            if ($limite > 0) {
                $sql .= " LIMIT $limite";
            }

            $stmt = $this->conexion->prepare($sql);

            foreach ($condiciones as $campo => $valor) {
                $stmt->bindValue(':' . $campo, $valor);
            }

            $stmt->execute();

            return $stmt->fetchAll($tipoFetch);
        } catch (PDOException $e) {
            throw new \Exception("Error al listar registros de '$tabla':<br>" . $e->getMessage());
        }
    }

    /** Destructor de la clase ConexionBD (cierra la conexión a la base de datos al destruir la instancia)
     *  
     * @return void
     */
    public function __destruct()
    {
        $this->conexion = null;
    }

    /* =========================
    Notas Adicionales sobre PDO
    ============================
        REALIZACIÓN DE CONSULTAS CON PDO
        $conexion->exec($sql)
            Para realizar consultas sin resultado: Insert, update, delete, drop, truncate y create.
            Consultas que no devuelven ningún valor.

            Devuelve INT | null -> Número de filas afectadas o null en caso de error.

        $conexion->query($sql)
            Para consultas que devuelven valores: Consultas Select

        CONSULTAS PREPARADAS CON PDO
        $stm = $conexion->prepare($sql)
            Para consultas preparadas (con parámetros). Más seguro frente a inyecciones SQL
            Se ejecuta en 3 pasos:
                1. Preparar la consulta
                2. Vincular los parámetros (si los hay) con bindValue o bindParam
                3. Ejecutar la consulta con:
                    $resultado->execute()
            Devuelve un objeto PDOStatement

        $stm->bindValue(':parametro', $valor)
            Vincula un valor a un parámetro de la consulta preparada. El valor se convierte automáticamente al tipo de dato adecuado.


        RECUPERAR DATOS DE CONSULTAS CON PDO
        $stm->execute()
            Ejecuta la consulta preparada
            Devuelve TRUE o FALSE

        $stm->fetch()
            Recuperar un solo registro de la consulta
            Devuelve un array con el registro o FALSE si no hay más registros

        $stm->fetchAll()
            Recuperar todos los registros de la consulta
            Devuelve un array con todos los registros o FALSE si no hay más registros

        Opciones de fetch:
            PDO::FETCH_ASSOC -> Array asociativo (nombre de columna)
            PDO::FETCH_NUM -> Array indexado (número de columna)
            PDO::FETCH_BOTH -> Array asociativo e indexado (por defecto)
            PDO::FETCH_OBJ -> Objeto anónimo (propiedades con nombre de columna)
    */
}
