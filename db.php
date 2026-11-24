<?php
// Credenciais locais ficam em config.local.php (ignorado pelo Git).
// Em hospedagem, use as variáveis DB_HOST, DB_NAME, DB_USER e DB_PASS.

$configLocal = [];
$configFile = __DIR__ . '/config.local.php';
if (is_file($configFile)) {
    $configLocal = require $configFile;
}

$host = getenv('DB_HOST') ?: ($configLocal['host'] ?? '');
$dbname = getenv('DB_NAME') ?: ($configLocal['dbname'] ?? '');
$username = getenv('DB_USER') ?: ($configLocal['username'] ?? '');
$password = getenv('DB_PASS') ?: ($configLocal['password'] ?? '');

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $exception) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'erro' => 'Não foi possível conectar ao banco de dados.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
