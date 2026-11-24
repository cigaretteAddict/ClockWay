-- Selecione o banco criado no phpMyAdmin antes de importar.
-- Não inclui CREATE/DROP DATABASE para ser compatível com hospedagens gratuitas.
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
  PRIMARY KEY (id),
  UNIQUE KEY uq_relogios_nome (nome)
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
('Sovereign Chrono', 'Ouro, cronógrafo automático, pulseira de couro',   64800.00, 'relogio 6.jpg')
ON DUPLICATE KEY UPDATE
  descricao = VALUES(descricao),
  preco = VALUES(preco),
  imagem = VALUES(imagem);

-- Remove duplicatas antigas e mantém apenas o menor ID de cada modelo.
UPDATE pedidos p
JOIN relogios d ON d.id = p.relogio_id
JOIN relogios k ON k.nome = d.nome AND k.id < d.id
SET p.relogio_id = k.id;

DELETE d
FROM relogios d
JOIN relogios k ON k.nome = d.nome AND k.id < d.id;

SET @clockway_tem_indice = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = 'clockway'
    AND table_name = 'relogios'
    AND index_name = 'uq_relogios_nome'
);
SET @clockway_sql = IF(
  @clockway_tem_indice = 0,
  'ALTER TABLE relogios ADD UNIQUE KEY uq_relogios_nome (nome)',
  'SELECT 1'
);
PREPARE clockway_stmt FROM @clockway_sql;
EXECUTE clockway_stmt;
DEALLOCATE PREPARE clockway_stmt;
