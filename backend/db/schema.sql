CREATE DATABASE IF NOT EXISTS ecoobra_inventario CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE ecoobra_inventario;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS detalle_factura;
DROP TABLE IF EXISTS factura;
DROP TABLE IF EXISTS movimiento_inventario;
DROP TABLE IF EXISTS lote_mercancia;
DROP TABLE IF EXISTS detalle_orden_compra;
DROP TABLE IF EXISTS orden_compra;
DROP TABLE IF EXISTS inventario;
DROP TABLE IF EXISTS cliente_x_trabajador;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS proveedor;
DROP TABLE IF EXISTS bodega;
DROP TABLE IF EXISTS trabajador;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS configuracion;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE cliente (
  id_cliente INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(30),
  correo VARCHAR(150) NOT NULL UNIQUE,
  direccion VARCHAR(250)
) ENGINE=InnoDB;

CREATE TABLE trabajador (
  id_trabajador INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  salario DECIMAL(10,2) NOT NULL DEFAULT 0,
  sucursal VARCHAR(150),
  horario VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE producto (
  id_producto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(250),
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  unidad VARCHAR(50) NOT NULL,
  precio_base DECIMAL(10,2) NOT NULL DEFAULT 0,
  demanda_promedio DECIMAL(10,2) NOT NULL DEFAULT 0,
  demanda_maxima DECIMAL(10,2) NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  categoria ENUM('Selladores','Adhesivos','Impermeabilizantes','Aditivos') NOT NULL,
  tiempo_entrega INT UNSIGNED NOT NULL DEFAULT 1,
  vida_util_dias INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE proveedor (
  id_proveedor INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(30),
  correo VARCHAR(150),
  ubicacion VARCHAR(250)
) ENGINE=InnoDB;

CREATE TABLE bodega (
  id_bodega INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  ubicacion VARCHAR(250),
  tipo ENUM('bodega','obra') NOT NULL DEFAULT 'bodega'
) ENGINE=InnoDB;

CREATE TABLE cliente_x_trabajador (
  id_cliente_trabajador INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT UNSIGNED NOT NULL,
  id_trabajador INT UNSIGNED NOT NULL,
  fecha_relacion DATE NOT NULL,
  CONSTRAINT fk_cxt_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
  CONSTRAINT fk_cxt_trabajador FOREIGN KEY (id_trabajador) REFERENCES trabajador(id_trabajador)
) ENGINE=InnoDB;

CREATE TABLE inventario (
  id_inventario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_producto INT UNSIGNED NOT NULL,
  id_bodega INT UNSIGNED NOT NULL,
  stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha_maximo DATE NULL,
  stock_maximo DECIMAL(10,2) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_inventario_producto_bodega (id_producto,id_bodega),
  CONSTRAINT fk_inventario_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
  CONSTRAINT fk_inventario_bodega FOREIGN KEY (id_bodega) REFERENCES bodega(id_bodega)
) ENGINE=InnoDB;

CREATE TABLE orden_compra (
  id_orden_compra INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_proveedor INT UNSIGNED NOT NULL,
  id_bodega INT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  codigo VARCHAR(20) NOT NULL UNIQUE,
  solicitante VARCHAR(120) NOT NULL,
  CONSTRAINT fk_oc_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor),
  CONSTRAINT fk_oc_bodega FOREIGN KEY (id_bodega) REFERENCES bodega(id_bodega)
) ENGINE=InnoDB;

CREATE TABLE detalle_orden_compra (
  id_detalle_orden INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_orden_compra INT UNSIGNED NOT NULL,
  id_producto INT UNSIGNED NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tiempo_entrega INT NULL,
  CONSTRAINT fk_doc_oc FOREIGN KEY (id_orden_compra) REFERENCES orden_compra(id_orden_compra),
  CONSTRAINT fk_doc_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
) ENGINE=InnoDB;

CREATE TABLE lote_mercancia (
  id_lote INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_producto INT UNSIGNED NOT NULL,
  id_bodega INT UNSIGNED NOT NULL,
  codigo_lote VARCHAR(100) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha_ingreso DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'vigente',
  id_orden_compra INT UNSIGNED NULL,
  UNIQUE KEY uq_lote_producto_codigo (id_producto,codigo_lote),
  CONSTRAINT fk_lote_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
  CONSTRAINT fk_lote_bodega FOREIGN KEY (id_bodega) REFERENCES bodega(id_bodega),
  CONSTRAINT fk_lote_oc FOREIGN KEY (id_orden_compra) REFERENCES orden_compra(id_orden_compra)
) ENGINE=InnoDB;

CREATE TABLE movimiento_inventario (
  id_movimiento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_lote INT UNSIGNED NOT NULL,
  id_producto INT UNSIGNED NOT NULL,
  id_bodega INT UNSIGNED NOT NULL,
  tipo_movimiento VARCHAR(50) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  referencia VARCHAR(100) NOT NULL,
  observacion VARCHAR(250),
  usuario VARCHAR(80) NOT NULL,
  bodega_origen_id INT UNSIGNED NULL,
  bodega_destino_id INT UNSIGNED NULL,
  documento_tipo VARCHAR(60) NOT NULL,
  documento_ref VARCHAR(80) NOT NULL,
  CONSTRAINT fk_mov_lote FOREIGN KEY (id_lote) REFERENCES lote_mercancia(id_lote),
  CONSTRAINT fk_mov_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
  CONSTRAINT fk_mov_bodega FOREIGN KEY (id_bodega) REFERENCES bodega(id_bodega),
  CONSTRAINT fk_mov_bodega_origen FOREIGN KEY (bodega_origen_id) REFERENCES bodega(id_bodega),
  CONSTRAINT fk_mov_bodega_destino FOREIGN KEY (bodega_destino_id) REFERENCES bodega(id_bodega)
) ENGINE=InnoDB;

CREATE TABLE factura (
  id_factura INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT UNSIGNED NOT NULL,
  id_trabajador INT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  impuesto DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) NOT NULL DEFAULT 'emitida',
  CONSTRAINT fk_factura_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
  CONSTRAINT fk_factura_trabajador FOREIGN KEY (id_trabajador) REFERENCES trabajador(id_trabajador)
) ENGINE=InnoDB;

CREATE TABLE detalle_factura (
  id_detalle_factura INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_factura INT UNSIGNED NOT NULL,
  id_producto INT UNSIGNED NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_df_factura FOREIGN KEY (id_factura) REFERENCES factura(id_factura),
  CONSTRAINT fk_df_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
) ENGINE=InnoDB;

CREATE TABLE configuracion (
  id TINYINT UNSIGNED PRIMARY KEY,
  dias_alerta_critica INT UNSIGNED NOT NULL DEFAULT 30,
  dias_alerta_proxima INT UNSIGNED NOT NULL DEFAULT 90,
  duplicado_dias INT UNSIGNED NOT NULL DEFAULT 3,
  duplicado_tolerancia_pct DECIMAL(6,2) NOT NULL DEFAULT 10,
  usuario_actual VARCHAR(80) NOT NULL DEFAULT 'usuario'
) ENGINE=InnoDB;
