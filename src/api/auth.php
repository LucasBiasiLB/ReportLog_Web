<?php
require __DIR__ . '/../db/funcoes.php';
require __DIR__ . '/../db/sessao.php';

header('Content-Type: application/json; charset=utf-8');

function responder($dados, $status = 200) {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

function traduzirErro($msg) {
    $mapa = [
        'EMAIL_NOT_FOUND'           => 'E-mail ou senha incorretos',
        'INVALID_PASSWORD'          => 'E-mail ou senha incorretos',
        'INVALID_LOGIN_CREDENTIALS' => 'E-mail ou senha incorretos',
        'EMAIL_EXISTS'              => 'Este e-mail já está cadastrado',
        'INVALID_EMAIL'             => 'E-mail inválido',
        'WEAK_PASSWORD'             => 'A senha precisa ter pelo menos 6 caracteres',
        'USER_DISABLED'             => 'Esta conta foi desativada',
        'TOO_MANY_ATTEMPTS'         => 'Muitas tentativas. Tente de novo mais tarde',
    ];
    foreach ($mapa as $codigo => $texto) {
        if (str_contains($msg, $codigo)) return $texto;
    }
    return 'Não foi possível autenticar';
}

try {
    $metodo = $_SERVER['REQUEST_METHOD'];

    // GET: "quem sou eu?" (as páginas chamam isso ao abrir)
    if ($metodo === 'GET') {
        $uid = uidLogado();
        if (!$uid) responder(['erro' => 'Não autenticado'], 401);
        responder(perfilUsuario($uid));
    }

    if ($metodo === 'POST') {
        $corpo = json_decode(file_get_contents('php://input'), true) ?? [];
        $acao  = $corpo['acao'] ?? '';

        if ($acao === 'login' || $acao === 'registrar') {
            $email = trim($corpo['email'] ?? '');
            $senha = $corpo['senha'] ?? '';
            if ($email === '' || $senha === '') responder(['erro' => 'Preencha e-mail e senha'], 400);

            if ($acao === 'registrar') {
                $nome = trim($corpo['usuario'] ?? '');
                if ($nome === '') responder(['erro' => 'Informe um nome de usuário'], 400);

                $r = identityRequest('accounts:signUp', [
                    'email' => $email, 'password' => $senha, 'returnSecureToken' => true,
                ]);
                // o id do documento em 'usuarios' é o uid
                adicionarRegistro('usuarios', [
                    'nome'       => $nome,
                    'email'      => $email,
                    'fotoPerfil' => null,
                    'papel'      => 'usuario',
                    'createdAt'  => timestamp(),
                ], $r['localId']);
            } else {
                $r = identityRequest('accounts:signInWithPassword', [
                    'email' => $email, 'password' => $senha, 'returnSecureToken' => true,
                ]);
            }

            iniciarSessao();
            session_regenerate_id(true);
            $_SESSION['uid'] = $r['localId'];
            responder(perfilUsuario($r['localId']));
        }

        if ($acao === 'sair') {
            iniciarSessao();
            session_destroy();
            responder(['ok' => true]);
        }

        responder(['erro' => 'Ação desconhecida'], 400);
    }

    responder(['erro' => 'Método não permitido'], 405);
} catch (Exception $e) {
    if ($e->getCode() === 401) responder(['erro' => traduzirErro($e->getMessage())], 401);
    responder(['erro' => $e->getMessage()], 500);
}