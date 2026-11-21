<?php
require __DIR__ . '/../db/funcoes.php';
require __DIR__ . '/../db/sessao.php';

header('Content-Type: application/json; charset=utf-8');

function responder($dados, $status = 200) {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

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

$uid = uidLogado();
if (!$uid) responder(['erro' => 'Faça login para continuar'], 401);

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') responder(['erro' => 'Método não permitido'], 405);

    if (($_POST['acao'] ?? '') !== 'salvar') responder(['erro' => 'Ação desconhecida'], 400);

    $nome      = trim($_POST['nome'] ?? '');
    $descricao = trim($_POST['descricao'] ?? '');
    if ($nome === '') responder(['erro' => 'Informe um nome de usuário'], 400);

    // Só estes campos podem ser alterados; "admin" nunca passa por aqui
    $campos = [
        'nome'      => mb_substr($nome, 0, 24),
        'descricao' => mb_substr($descricao, 0, 100),
    ];

        if (!empty($_POST['padrao_foto']))   $campos['fotoPerfil'] = null;
    if (!empty($_POST['padrao_banner'])) $campos['fotoCapa']   = null;

    // Imagens novas (se o usuário escolheu)
    if ($url = receberImagem('foto')) $campos['fotoPerfil'] = $url;
    if ($url = receberImagem('capa')) $campos['fotoCapa']   = $url;

    atualizarRegistro('usuarios', $uid, $campos);
    responder(perfilUsuario($uid));

} catch (Exception $e) {
    responder(['erro' => $e->getMessage()], 500);
}