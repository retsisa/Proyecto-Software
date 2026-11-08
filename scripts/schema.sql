-- RestoGest · Script de creación de la base de datos (PostgreSQL 12 o superior)

CREATE TABLE IF NOT EXISTS rol (
  id_rol  SERIAL PRIMARY KEY,
  nombre  VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario     SERIAL PRIMARY KEY,
  nombre         VARCHAR(60)  NOT NULL,
  apellido       VARCHAR(60)  NOT NULL,
  email          VARCHAR(100) NOT NULL UNIQUE,
  password_hash  VARCHAR(100) NOT NULL,
  id_rol         INT NOT NULL REFERENCES rol(id_rol),
  activo         BOOLEAN   NOT NULL DEFAULT TRUE,
  creado_en      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categoria (
  id_categoria  SERIAL PRIMARY KEY,
  nombre        VARCHAR(50) NOT NULL UNIQUE,
  descripcion   VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS plato (
  id_plato      SERIAL PRIMARY KEY,
  id_categoria  INT NOT NULL REFERENCES categoria(id_categoria),
  nombre        VARCHAR(80) NOT NULL,
  descripcion   VARCHAR(200),
  precio        NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  disponible    BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS mesa (
  id_mesa    SERIAL PRIMARY KEY,
  numero     INT NOT NULL UNIQUE,
  capacidad  INT NOT NULL CHECK (capacidad > 0),
  estado     VARCHAR(15) NOT NULL DEFAULT 'libre'
             CHECK (estado IN ('libre','ocupada','reservada'))
);

CREATE TABLE IF NOT EXISTS cliente (
  id_cliente  SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  nit_ci      VARCHAR(20),
  telefono    VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS pedido (
  id_pedido   SERIAL PRIMARY KEY,
  id_mesa     INT NOT NULL REFERENCES mesa(id_mesa),
  id_usuario  INT NOT NULL REFERENCES usuario(id_usuario),
  id_cliente  INT REFERENCES cliente(id_cliente),
  estado      VARCHAR(20) NOT NULL DEFAULT 'pendiente'
              CHECK (estado IN ('pendiente','en_preparacion','listo','entregado','pagado','cancelado')),
  fecha_hora  TIMESTAMP NOT NULL DEFAULT NOW(),
  total       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0)
);

CREATE TABLE IF NOT EXISTS detalle_pedido (
  id_detalle       SERIAL PRIMARY KEY,
  id_pedido        INT NOT NULL REFERENCES pedido(id_pedido) ON DELETE CASCADE,
  id_plato         INT NOT NULL REFERENCES plato(id_plato),
  cantidad         INT NOT NULL CHECK (cantidad > 0),
  precio_unitario  NUMERIC(10,2) NOT NULL CHECK (precio_unitario > 0),
  subtotal         NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  observacion      VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS pago (
  id_pago     SERIAL PRIMARY KEY,
  id_pedido   INT NOT NULL UNIQUE REFERENCES pedido(id_pedido),
  id_usuario  INT NOT NULL REFERENCES usuario(id_usuario),
  metodo      VARCHAR(15) NOT NULL CHECK (metodo IN ('efectivo','tarjeta','qr')),
  monto       NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  fecha_pago  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedido_estado    ON pedido(estado);
CREATE INDEX IF NOT EXISTS idx_pedido_fecha     ON pedido(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido   ON detalle_pedido(id_pedido);
CREATE INDEX IF NOT EXISTS idx_plato_categoria  ON plato(id_categoria);

-- Datos iniciales (solo se insertan si las tablas están vacías)
INSERT INTO rol (nombre)
SELECT v FROM (VALUES ('administrador'), ('mesero'), ('cocina'), ('caja')) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM rol);

INSERT INTO categoria (nombre)
SELECT v FROM (VALUES ('Entradas'), ('Sopas'), ('Platos fuertes'), ('Bebidas'), ('Postres')) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM categoria);

INSERT INTO plato (id_categoria, nombre, precio)
SELECT c.id_categoria, p.nombre, p.precio
FROM (VALUES
  ('Sopas', 'Sopa de maní', 20.00),
  ('Platos fuertes', 'Silpancho', 30.00),
  ('Platos fuertes', 'Pique macho', 45.00),
  ('Platos fuertes', 'Fricasé', 35.00),
  ('Bebidas', 'Api con pastel', 12.00),
  ('Bebidas', 'Refresco de la casa', 8.00),
  ('Postres', 'Flan de leche', 10.00)
) AS p(categoria, nombre, precio)
JOIN categoria c ON c.nombre = p.categoria
WHERE NOT EXISTS (SELECT 1 FROM plato);

INSERT INTO mesa (numero, capacidad)
SELECT n, c FROM (VALUES (1,2),(2,2),(3,4),(4,4),(5,6),(6,8)) AS t(n, c)
WHERE NOT EXISTS (SELECT 1 FROM mesa);
