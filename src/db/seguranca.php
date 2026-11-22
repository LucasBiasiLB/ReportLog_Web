<?php
// Só redireciona se acessado direto pela URL; quando outro arquivo faz
// require/include, $_SERVER['SCRIPT_NAME'] é a página que pediu, não este arquivo.

if (basename($_SERVER['SCRIPT_NAME']) === basename(__FILE__)) {
    header('Location: ../tabs/index.html');
    exit;
}
function seguranca() {
    if (basename($_SERVER['SCRIPT_NAME']) === basename(__FILE__)) {
        header('Location: ../tabs/index.html');
        exit;
    }
}

