<?php
require __DIR__ . '/../db/funcoes.php';
require __DIR__ . '/../db/sessao.php';

header('Content-Type: application/json; charset=utf-8');

$colecao = 'sugestoes';
$metodo  = $_SERVER['REQUEST_METHOD'];
$id      = $_GET['id'] ?? null;

function responder($dados, $status = 200) {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

// Sem login, nada funciona
$uid = uidLogado();
if (!$uid) responder(['erro' => 'Faça login para continuar'], 401);

$usuarios = [];
function enriquecerSugestao($s) {
    global $usuarios;
    $dono = $s['uid'] ?? null;
    if (!$dono) return $s;
    if (!array_key_exists($dono, $usuarios)) {
        try { $usuarios[$dono] = buscarRegistros('usuarios', $dono); }
        catch (Exception $e) { $usuarios[$dono] = null; }
    }
    $u = $usuarios[$dono];
    if ($u) {
        $s['fotoPerfil'] = $u['fotoPerfil'] ?? $u['foto'] ?? $u['avatar'] ?? null;
        if (empty($s['autor'])) $s['autor'] = $u['nome'] ?? $u['name'] ?? $s['autor'] ?? 'Anônimo';
    }
    return $s;
}

try {
    if ($metodo === 'GET') {
        $dados = buscarRegistros($colecao, $id);
        responder($id ? enriquecerSugestao($dados) : array_map('enriquecerSugestao', $dados));
    }

    if ($metodo === 'DELETE') {
        if (!$id) responder(['erro' => 'Falta o id'], 400);
        $s = buscarRegistros($colecao, $id);
        if (!$s) responder(['erro' => 'Sugestão não encontrada'], 404);
        if (($s['uid'] ?? null) !== $uid && !perfilUsuario($uid)['admin']) {
            responder(['erro' => 'Você não pode excluir esta sugestão'], 403);
        }
        deletarRegistro($colecao, $id);
        responder(['ok' => true]);
    }

    if ($metodo === 'POST') {
        $corpo = json_decode(file_get_contents('php://input'), true) ?? [];
        $acao  = $corpo['acao'] ?? '';

        if ($acao === 'publicar') {
            $dados  = $corpo['dados'] ?? [];
            $titulo = trim($dados['titulo'] ?? '');
            $desc   = trim($dados['descricao'] ?? '');
            if ($titulo === '' || $desc === '') {
                responder(['erro' => 'Título e descrição são obrigatórios'], 400);
            }
            // Só aceita os campos permitidos; o resto o servidor define
            $novo = [
                'titulo'     => mb_substr($titulo, 0, 50),
                'descricao'  => mb_substr($desc, 0, 500),
                'categoria'  => $dados['categoria'] ?? 'Outros',
                'icon'       => $dados['icon'] ?? 'logo',
                'uid'        => $uid,
                'autor'      => perfilUsuario($uid)['nome'],
                'createdAt'  => timestamp(),
                'curtidoPor' => [],
            ];
            responder(enriquecerSugestao(adicionarRegistro($colecao, $novo)));
        }

        if ($acao === 'editar') {
            $idSug = $corpo['id'] ?? null;
            $dados = $corpo['dados'] ?? [];
            if (!$idSug) responder(['erro' => 'Falta o id'], 400);

            $s = buscarRegistros($colecao, $idSug);
            if (!$s) responder(['erro' => 'Sugestão não encontrada'], 404);
            if (($s['uid'] ?? null) !== $uid && !perfilUsuario($uid)['admin']) {
                responder(['erro' => 'Você não pode editar esta sugestão'], 403);
            }

            $titulo = trim($dados['titulo'] ?? '');
            $desc   = trim($dados['descricao'] ?? '');
            if ($titulo === '' || $desc === '') {
                responder(['erro' => 'Título e descrição são obrigatórios'], 400);
            }

            // Só estes campos podem mudar; curtidas, uid e datas ficam como estão
            $campos = [
                'titulo'    => mb_substr($titulo, 0, 50),
                'descricao' => mb_substr($desc, 0, 500),
                'categoria' => $dados['categoria'] ?? $s['categoria'] ?? 'Outros',
                'icon'      => $dados['icon'] ?? $s['icon'] ?? 'logo',
            ];
            responder(enriquecerSugestao(atualizarRegistro($colecao, $idSug, $campos)));
        }

        if ($acao === 'curtir') {
            $idSug = $corpo['id'] ?? null;
            if (!$idSug) responder(['erro' => 'Falta o id'], 400);

            $s = buscarRegistros($colecao, $idSug);
            if (!$s) responder(['erro' => 'Sugestão não encontrada'], 404);

            $jaCurtiu = in_array($uid, $s['curtidoPor'] ?? [], true);
            alterarLista($colecao, $idSug, 'curtidoPor', $uid, !$jaCurtiu);

            responder(enriquecerSugestao(buscarRegistros($colecao, $idSug)));
        }

        responder(['erro' => 'Ação desconhecida'], 400);
    }

    responder(['erro' => 'Método não permitido'], 405);
} catch (Exception $e) {
    responder(['erro' => $e->getMessage()], 500);
}