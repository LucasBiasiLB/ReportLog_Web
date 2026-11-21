<?php
require __DIR__ . '/../db/funcoes.php';
require __DIR__ . '/../db/sessao.php';

header('Content-Type: application/json; charset=utf-8');

function responder($dados, $status = 200) {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!uidLogado()) responder(['erro' => 'Faça login para continuar'], 401);

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') responder(['erro' => 'Método não permitido'], 405);

    // só updates publicados (rascunhos não aparecem para os jogadores)
    $todos = buscarRegistros('updates');
    $publicados = array_values(array_filter($todos, fn($u) => ($u['status'] ?? '') === 'publicado'));
    responder($publicados);
} catch (Exception $e) {
    responder(['erro' => $e->getMessage()], 500);
}