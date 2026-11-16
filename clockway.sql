CREATE DATABASE IF NOT EXISTS clockway
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clockway;

CREATE TABLE IF NOT EXISTS feedbacks (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  mensagem  TEXT         NOT NULL,
  criado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS emails_cupom (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email     VARCHAR(191) NOT NULL,
  cupom     VARCHAR(20)  NOT NULL DEFAULT 'CLOCK5',
  usado     TINYINT(1)   NOT NULL DEFAULT 0,
  criado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_emails_cupom_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS relogios (
  id        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nome      VARCHAR(100)  NOT NULL,
  descricao VARCHAR(255)  NOT NULL,
  preco     DECIMAL(10,2) NOT NULL,
  imagem    VARCHAR(255)  NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedidos (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  email      VARCHAR(191)  NULL,
  relogio_id INT UNSIGNED  NOT NULL,
  preco      DECIMAL(10,2) NOT NULL,
  cupom      VARCHAR(20)   NULL,
  desconto   DECIMAL(10,2) NOT NULL DEFAULT 0,
  total      DECIMAL(10,2) NOT NULL,
  criado_em  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_pedidos_relogio FOREIGN KEY (relogio_id) REFERENCES relogios (id)
) ENGINE=InnoDB;

INSERT INTO relogios (nome, descricao, preco, imagem) VALUES
('Aurum Classic',    'Ouro 18k, automático, mostrador champanhe',        48900.00, 'relogio 1.jpg'),
('Nocturne',         'Aço 316L, automático, mostrador preto',            36500.00, 'relogio 2.jpg'),
('Meridian GMT',     'Aço, automático, segundo fuso horário',            52900.00, 'relogio 3.jpg'),
('Abyss Diver',      'Aço, mergulho 300 m, coroa rosqueada',             41200.00, 'relogio 4.jpg'),
('Regent Skeleton',  'Ouro rosé, esqueleto, corda manual',               87500.00, 'relogio 5.jpg'),
('Sovereign Chrono', 'Ouro, cronógrafo automático, pulseira de couro',   64800.00, 'relogio 6.jpg');
