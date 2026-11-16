-- =====================================================================
-- Banco de dados do site Clockway (MySQL / MariaDB)
-- Duas tabelas, uma para cada formulário do index.html:
--   feedbacks    -> formulário "Deixe seu feedback" (#feedbackForm)
--   emails_cupom -> formulário "Ativar cupom" da promoção de 5% (#couponForm)
--
-- Como importar:
--   phpMyAdmin: aba "Importar" > escolher este arquivo > Executar
--   Terminal:   mysql -u root -p < clockway.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS clockway
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clockway;

-- ---------------------------------------------------------------------
-- Tabela 1: feedbacks
-- Campo do formulário: <textarea name="feedback"> (obrigatório)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedbacks (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  mensagem  TEXT         NOT NULL,                          -- comentário do visitante
  criado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP, -- data e hora do envio
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela 2: emails_cupom
-- Campo do formulário: <input name="email" type="email"> (obrigatório)
-- O e-mail é único: cada pessoa ativa o cupom CLOCK5 uma vez só
-- (o desconto vale para a primeira compra).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emails_cupom (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email     VARCHAR(191) NOT NULL,                           -- e-mail informado
  cupom     VARCHAR(20)  NOT NULL DEFAULT 'CLOCK5',          -- código do cupom
  usado     TINYINT(1)   NOT NULL DEFAULT 0,                 -- 0 = ainda não usou, 1 = já usou na compra
  criado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP, -- quando ativou o cupom
  PRIMARY KEY (id),
  UNIQUE KEY uq_emails_cupom_email (email)
) ENGINE=InnoDB;

-- =====================================================================
-- Exemplos de uso (descomente para testar)
-- =====================================================================

-- Salvar um feedback:
-- INSERT INTO feedbacks (mensagem) VALUES ('Site muito bonito, adorei o relógio girando!');

-- Salvar o e-mail do cupom (se o e-mail já existir, o MySQL recusa com erro 1062):
-- INSERT INTO emails_cupom (email) VALUES ('voce@exemplo.com');

-- Ver os feedbacks mais recentes:
-- SELECT id, mensagem, criado_em FROM feedbacks ORDER BY criado_em DESC;

-- Conferir se um e-mail ainda pode usar o cupom:
-- SELECT cupom FROM emails_cupom WHERE email = 'voce@exemplo.com' AND usado = 0;

-- Marcar o cupom como usado depois da compra:
-- UPDATE emails_cupom SET usado = 1 WHERE email = 'voce@exemplo.com';

-- =====================================================================
-- Opcional: usuário só para o site, com permissões mínimas.
-- Use quando o site for gravar nas tabelas (troque a senha!).
-- =====================================================================
-- CREATE USER IF NOT EXISTS 'clockway_site'@'localhost' IDENTIFIED BY 'troque_esta_senha';
-- GRANT INSERT ON clockway.feedbacks TO 'clockway_site'@'localhost';
-- GRANT SELECT, INSERT, UPDATE ON clockway.emails_cupom TO 'clockway_site'@'localhost';
-- FLUSH PRIVILEGES;
