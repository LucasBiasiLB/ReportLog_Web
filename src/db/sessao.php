<?php
function iniciarSessao() {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
        session_start();
    }
}

function uidLogado() {
    iniciarSessao();
    return $_SESSION['uid'] ?? null;
}

// Dados do usuário que o front-end precisa (vêm da coleção 'usuarios', id = uid)
function perfilUsuario($uid) {
    $u = buscarRegistros('usuarios', $uid) ?? [];
    return [
        'id'         => $uid,
        'nome'       => $u['nome'] ?? $u['name'] ?? 'Anônimo',
        'fotoPerfil' => $u['fotoPerfil'] ?? $u['foto'] ?? $u['avatar'] ?? null,
        'admin'      => !empty($u['admin']),
    ];
}