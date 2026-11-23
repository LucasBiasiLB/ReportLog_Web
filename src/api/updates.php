<?php
require __DIR__ . '/../db/funcoes.php';
require __DIR__ . '/../db/sessao.php';

header('Content-Type: application/json; charset=utf-8');

function responder($dados, $status = 200) {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

$uid = uidLogado();
if (!$uid) responder(['erro' => 'Faça login para continuar'], 401);

// Valida a imagem enviada no campo $nomeCampo e devolve a URL pública (ou null se não veio arquivo)
function receberImagem($nomeCampo) {
    $arq = $_FILES[$nomeCampo] ?? null;
    if (!$arq || $arq['error'] === UPLOAD_ERR_NO_FILE) return null;

    if ($arq['error'] === UPLOAD_ERR_INI_SIZE || $arq['size'] > 5 * 1024 * 1024) {
        responder(['erro' => 'A imagem é grande demais (máximo 5 MB)'], 400);
    }
    if ($arq['error'] !== UPLOAD_ERR_OK) responder(['erro' => 'Falha ao receber a imagem'], 400);

    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($arq['tmp_name']);
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
        responder(['erro' => 'Use uma imagem JPG, PNG ou WebP'], 400);
    }
    return enviarImagemCloudinary($arq['tmp_name']);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // só updates publicados aparecem para os jogadores
        $todos = buscarRegistros('updates');
        $publicados = array_values(array_filter($todos, fn($u) => ($u['status'] ?? '') === 'publicado'));
        responder($publicados);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!perfilUsuario($uid)['admin']) responder(['erro' => 'Só administradores'], 403);

        $status = ($_POST['status'] ?? '') === 'rascunho' ? 'rascunho' : 'publicado';
        $titulo = trim($_POST['titulo'] ?? '');
        $desc   = trim($_POST['descricao'] ?? '');
        if ($titulo === '') responder(['erro' => 'Coloque pelo menos o título'], 400);
        if ($status === 'publicado' && $desc === '') {
            responder(['erro' => 'Preencha a descrição curta'], 400);
        }

        // Novidades: só entram as linhas com título E descrição (o resto é ignorado)
        $novidades = [];
        $titulos    = $_POST['novidade-titulo']    ?? [];
        $descricoes = $_POST['novidade-descricao'] ?? [];
        $icones     = $_POST['novidade-icone']     ?? [];
        foreach ($titulos as $i => $t) {
            $t = trim((string) $t);
            $d = trim($descricoes[$i] ?? '');
            if ($t === '' && $d === '') continue;
            if ($t === '' || $d === '') {
                responder(['erro' => 'Toda novidade precisa de título e descrição'], 400);
            }
            $novidades[] = [
                'titulo'    => mb_substr($t, 0, 40),
                'descricao' => mb_substr($d, 0, 100),
                'imagem'    => $icones[$i] ?? 'logo',
            ];
        }

        $perfil = perfilUsuario($uid);
        $novo = [
            'titulo'             => mb_substr($titulo, 0, 60),
            'versao'             => mb_substr(trim($_POST['versao'] ?? ''), 0, 12),
            'descricaoCurta'     => mb_substr($desc, 0, 120),
            'imagemDestaque'     => receberImagem('imagem'),
            'conteudoDetalhado'  => mb_substr(trim($_POST['conteudo'] ?? ''), 0, 2000),
            'status'             => $status,
            'novidades'          => $novidades,
            'autorUid'           => $perfil['id'],
            'autor'              => $perfil['nome'],
            'createdAt'          => timestamp(),
            'dataAtualizacao'    => timestamp(),
        ];
        responder(adicionarRegistro('updates', $novo), 201);
    }

    responder(['erro' => 'Método não permitido'], 405);
} catch (Exception $e) {
    responder(['erro' => $e->getMessage()], 500);
}