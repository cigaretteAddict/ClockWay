<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $acao = $_GET['acao'] ?? 'relogios';

    if ($acao === 'relogios') {
        $stmt = $pdo->query('SELECT id, nome, descricao, preco, imagem FROM relogios ORDER BY id');
        jsonResponse(['relogios' => $stmt->fetchAll()]);
    }

    jsonResponse(['erro' => 'Ação inválida.'], 400);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['erro' => 'Método não permitido.'], 405);
}

$dados = json_decode(file_get_contents('php://input'), true);
if (!is_array($dados)) {
    $dados = $_POST;
}

$acao = $dados['acao'] ?? '';

try {
    if ($acao === 'feedback') {
        $mensagem = trim((string)($dados['mensagem'] ?? ''));
        if ($mensagem === '' || mb_strlen($mensagem) > 5000) {
            jsonResponse(['erro' => 'O feedback deve ter entre 1 e 5000 caracteres.'], 422);
        }

        $stmt = $pdo->prepare('INSERT INTO feedbacks (mensagem) VALUES (?)');
        $stmt->execute([$mensagem]);
        jsonResponse(['sucesso' => true, 'mensagem' => 'Feedback enviado com sucesso!']);
    }

    if ($acao === 'cupom') {
        $email = trim((string)($dados['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['erro' => 'Informe um e-mail válido.'], 422);
        }

        $email = mb_strtolower($email);
        $stmt = $pdo->prepare('SELECT usado FROM emails_cupom WHERE email = ?');
        $stmt->execute([$email]);
        $cupom = $stmt->fetch();

        if ($cupom === false) {
            $stmt = $pdo->prepare("INSERT INTO emails_cupom (email, cupom, usado) VALUES (?, 'CLOCK5', 0)");
            $stmt->execute([$email]);
        } elseif ((int)$cupom['usado'] === 1) {
            jsonResponse(['erro' => 'Este e-mail já utilizou o cupom CLOCK5.', 'sucesso' => false], 409);
        }

        jsonResponse(['sucesso' => true, 'cupom' => 'CLOCK5', 'mensagem' => 'Cupom CLOCK5 ativado!']);
    }

    if ($acao === 'pedido') {
        $ids = $dados['relogios'] ?? [];
        $ids = is_array($ids) ? array_values(array_unique(array_map('intval', $ids))) : [];
        if (!$ids) {
            jsonResponse(['erro' => 'O carrinho está vazio.'], 422);
        }

        $email = trim((string)($dados['email'] ?? ''));
        $email = $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)
            ? mb_strtolower($email)
            : null;

        $aplicarCupom = ($dados['cupom'] ?? '') === 'CLOCK5';
        if ($aplicarCupom && $email !== null) {
            $stmt = $pdo->prepare('SELECT usado FROM emails_cupom WHERE email = ? AND cupom = ?');
            $stmt->execute([$email, 'CLOCK5']);
            $cupom = $stmt->fetch();
            $aplicarCupom = $cupom && (int)$cupom['usado'] === 0;
        } else {
            $aplicarCupom = false;
        }

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare("SELECT id, preco FROM relogios WHERE id IN ({$placeholders})");
        $stmt->execute($ids);
        $relogios = $stmt->fetchAll();

        $pdo->beginTransaction();
        $stmtPedido = $pdo->prepare(
            'INSERT INTO pedidos (email, relogio_id, preco, cupom, desconto, total) VALUES (?, ?, ?, ?, ?, ?)'
        );

        $idsCriados = [];
        foreach ($relogios as $relogio) {
            $preco = (float)$relogio['preco'];
            $descontoUnitario = $aplicarCupom ? round($preco * 0.05, 2) : 0.0;
            $total = round($preco - $descontoUnitario, 2);
            $stmtPedido->execute([
                $email,
                (int)$relogio['id'],
                $preco,
                $aplicarCupom ? 'CLOCK5' : null,
                $descontoUnitario,
                $total,
            ]);
            $idsCriados[] = (int)$pdo->lastInsertId();
        }

        if ($aplicarCupom && $email !== null) {
            $stmt = $pdo->prepare('UPDATE emails_cupom SET usado = 1 WHERE email = ? AND cupom = ?');
            $stmt->execute([$email, 'CLOCK5']);
        }

        $pdo->commit();
        jsonResponse(['sucesso' => true, 'pedidos' => $idsCriados]);
    }

    jsonResponse(['erro' => 'Ação inválida.'], 400);
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(['erro' => 'Erro ao processar a solicitação.'], 500);
}
