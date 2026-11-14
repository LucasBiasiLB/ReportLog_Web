<?php
// tenha a extenção "better comments" ativada



//? 1. buscarRegistros($colecao, $id = null, $filtros = [])

// Parâmetro	Obrigatório	O que é
// $colecao	sim	Nome da coleção, como 'updates'
// $id	não	ID do documento, para buscar um só
// $filtros	não	Array ['campo' => valor], para filtrar por igualdade

// Retorna: um array de registros (todos ou filtrados), ou um único registro (com $id), ou null se o ID não existir.

//*TODO buscarRegistros('updates');                                   todos
//*TODO buscarRegistros('updates', '3d4fuAZ6gdFAxczBUEsl');           um só
//*TODO buscarRegistros('updates', null, ['authorUid' => $uid]);       filtrados

// Para filtrar sem passar ID, o segundo parâmetro tem que ser null. Com mais de um filtro, todos precisam ser verdadeiros ao mesmo tempo (E).




//? 2. adicionarRegistro($colecao, $dados, $id = null)

// Parâmetro	Obrigatório	O que é
// $colecao	sim	Nome da coleção
// $dados	sim	Array ['campo' => valor] com os campos do registro
// $id	não	ID escolhido por você; se omitir, o Firestore gera um

// Retorna: o registro criado, já com o campo id.

//*TODO         $novo = adicionarRegistro('updates', [
//*TODO             'titulo'          => 'Novos temas',
//*TODO             'versao'          => '1.2.1',
//*TODO             'status'          => 'publicado',
//*TODO             'dataAtualizacao' => timestamp('2026-11-12 15:00'),
//*TODO             'createdAt'       => timestamp(),
//*TODO             'novidades'       => [['titulo' => 'X', 'descricao' => 'Y', 'imagem' => 'logo']],
//*TODO         ]);
//*TODO         echo $novo['id'];



//? 3. deletarRegistro($colecao, $id)

// Parâmetro	Obrigatório	O que é
// $colecao	sim	Nome da coleção
// $id	sim	ID do documento a apagar

// Retorna: true. Se o ID não existir, o Firestore também responde com sucesso, então confirme antes que o registro existe, se isso importar.

//*TODO deletarRegistro('updates', $id);





//? 4. atualizarRegistro($colecao, $id, $dados)

// Parâmetro	Obrigatório	O que é
// $colecao	sim	Nome da coleção
// $id	sim	ID do documento a alterar
// $dados	sim	Só os campos que mudam: ['campo' => novoValor]

// Retorna: o registro atualizado, completo. Se o ID não existir, lança uma Exception (código 404), porque a função exige que o documento já exista.

//*TODO     atualizarRegistro('updates', $id, [
//*TODO         'titulo' => 'Novo título',
//*TODO         'status' => 'publicado',
//*TODO     ]);

// Os campos que você não enviar continuam como estão. Se enviar um array (como novidades), ele é substituído por inteiro.

//! Auxiliar: timestamp($quando = null)

//! Use dentro do $dados para campos de data. Sem parâmetro, é o momento atual. Com texto, é essa data (ex.: '2026-11-12 15:00', ou '2026-11-12T15:00:00Z' se já estiver em UTC).

//* Dois lembretes
//* As funções lançam Exception em caso de erro, então, nas páginas, use try { ... } catch (Exception $e) { ... } para não mostrar a falha crua ao visitante.
//* O $id do registro vem no campo id que buscarRegistros já devolve, então, para editar ou apagar, você normalmente passa esse valor adiante (por exemplo, num link ou formulário).