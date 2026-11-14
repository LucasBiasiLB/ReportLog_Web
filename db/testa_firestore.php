<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require __DIR__ . '/funcoes.php';

echo '<pre>';
try {
    // CREATE
    $novo = adicionarRegistro('updates', [
        'status'           => 'rascunho',
        'versao'           => '0.0.1',
        'titulo'           => 'TESTE do site',
        'descricaoCurta'   => 'Registro de teste',
        'conteudoDetalhado'=> 'Pode apagar',
        'autorUid'         => 'UID_DE_TESTE',
        'autor'            => 'Teste',
        'dataAtualizacao'  => timestamp(),
        'createdAt'        => timestamp(),
        'novidades'        => [
            ['titulo' => 'Item 1', 'descricao' => 'Teste', 'imagem' => 'logo'],
        ],
    ]);
    echo "CRIADO:\n"; print_r($novo);
    $id = $novo['id'];

    // UPDATE
    atualizarRegistro('updates', $id, ['titulo' => 'TESTE editado']);

    // READ (um)
    echo "LIDO:\n"; print_r(buscarRegistros('updates', $id));

    // READ (filtrado por autorUid)
    echo "FILTRADO:\n"; print_r(buscarRegistros('updates', null, ['autorUid' => 'UID_DE_TESTE']));

    // READ (todos)
    echo 'TOTAL na coleção: ' . count(buscarRegistros('updates')) . "\n";

    // DELETE
    deletarRegistro('updates', $id);
    echo "DELETADO\n";
} catch (Exception $e) {
    echo 'ERRO: ' . $e->getMessage();
}
echo '</pre>';