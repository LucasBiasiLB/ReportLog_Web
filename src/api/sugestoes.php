<?php
// Endpoint da API de sugestões.
// O JavaScript chama este arquivo com fetch; ele usa funcoes.php no servidor.
//
//   GET    ?id=123        -> um registro (ou null)
//   GET                   -> todos os registros da coleção 'sugestoes'
//   POST  {acao:"publicar", dados:{...}}  -> cria sugestão
//   POST  {acao:"curtir", id:"..."}       -> curtir/descurtir
//   DELETE ?id=123        -> exclui

require __DIR__ . '/../db/funcoes.php';

header('Content-Type: application/json; charset=utf-8');

$colecao = 'sugestoes';
$metodo  = $_SERVER['REQUEST_METHOD'];
$id      = $_GET['id'] ?? null;

function responder($dados, $status = 200) {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

// Join com a coleção 'usuarios': anexa fotoPerfil (e autor, se faltar)
// usando o uid guardado em cada sugestão. O id do documento é o uid.
$usuarios = [];   // cache para não repetir busca do mesmo usuário
function enriquecerSugestao($s) {
    global $usuarios;
    $uid = $s['uid'] ?? null;
    if (!$uid) return $s;
    if (!array_key_exists($uid, $usuarios)) {
        try { $usuarios[$uid] = buscarRegistros('usuarios', $uid); }
        catch (Exception $e) { $usuarios[$uid] = null; }
    }
    $u = $usuarios[$uid];
    if ($u) {
        $s['fotoPerfil'] = $u['fotoPerfil'] ?? $u['foto'] ?? $u['avatar'] ?? null;
        if (empty($s['autor'])) $s['autor'] = $u['nome'] ?? $u['name'] ?? 'Anônimo';
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
        deletarRegistro($colecao, $id);
        responder(['ok' => true]);
    }

    if ($metodo === 'POST') {
        $corpo = json_decode(file_get_contents('php://input'), true) ?? [];
        $acao  = $corpo['acao'] ?? '';

        if ($acao === 'publicar') {
            $dados = $corpo['dados'] ?? [];
            if (empty($dados['titulo']) || empty($dados['descricao'])) {
                responder(['erro' => 'Título e descrição são obrigatórios'], 400);
            }
            $dados['curtidas'] = 0;
            $dados['curtiuEu'] = false;
            responder(enriquecerSugestao(adicionarRegistro($colecao, $dados)));
        }

        if ($acao === 'curtir') {
            $id = $corpo['id'] ?? null;
            if (!$id) responder(['erro' => 'Falta o id'], 400);

            $s = buscarRegistros($colecao, $id);
            if (!$s) responder(['erro' => 'Sugestão não encontrada'], 404);

            $s['curtiuEu']   = !$s['curtiuEu'];
            $s['curtidas']  += $s['curtiuEu'] ? 1 : -1;

            // atualiza só os dois campos que mudaram
            responder(enriquecerSugestao(atualizarRegistro($colecao, $id, [
                'curtidas' => $s['curtidas'],
                'curtiuEu' => $s['curtiuEu'],
            ])));
        }

        responder(['erro' => 'Ação desconhecida'], 400);
    }

    responder(['erro' => 'Método não permitido'], 405);
} catch (Exception $e) {
    responder(['erro' => $e->getMessage()], 500);
}
