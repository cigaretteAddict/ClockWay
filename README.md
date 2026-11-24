# Clockway

Loja de relógios com vitrine dinâmica, carrinho, cupom, feedback e registro de pedidos usando PHP e MySQL.

## Executar localmente

1. Abra o projeto com o Apache do XAMPP.
2. Crie o banco `clockway` no phpMyAdmin.
3. Importe `clockway.sql` no banco `clockway`.
4. Use `config.local.php` apenas no ambiente local para informar usuário e senha do MySQL.
5. Acesse `http://localhost/ClockWay-main/index.html`.

## Hospedagem

- Crie o banco pelo painel da hospedagem.
- Importe `clockway.sql` sem alterar o nome do banco.
- Configure `DB_HOST`, `DB_NAME`, `DB_USER` e `DB_PASS` no painel.
- Não publique usuários ou senhas em arquivos versionados.
- Use HTTPS e confirme os nomes dos arquivos respeitando maiúsculas e minúsculas.

## Segurança

O arquivo `config.local.php` está no `.gitignore` e não deve ser enviado ao GitHub. Os formulários validam os dados no servidor antes de gravá-los no banco.

## Repositório

https://github.com/cigaretteAddict/ClockWay