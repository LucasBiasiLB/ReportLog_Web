<?php
// criado de forma temporaria so para ter ajuda visual basicamente falando

function carregarChave() {
    $config = require __DIR__ . '/config.local.php';
    return json_decode(file_get_contents($config['firebase_credentials']), true);
}

function base64url($dados) {
    return rtrim(strtr(base64_encode($dados), '+/', '-_'), '=');
}

function pegarToken() {
    static $token = null; // guarda durante a requisição, para não pedir toda hora
    if ($token) return $token;

    $chave = carregarChave();
    $agora = time();

    $cabecalho = base64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $corpo = base64url(json_encode([
        'iss'   => $chave['client_email'],
        'scope' => 'https://www.googleapis.com/auth/datastore',
        'aud'   => 'https://oauth2.googleapis.com/token',
        'iat'   => $agora,
        'exp'   => $agora + 3600,
    ]));

    $assinatura = '';
    openssl_sign("$cabecalho.$corpo", $assinatura, $chave['private_key'], 'sha256WithRSAEncryption');
    $jwt = "$cabecalho.$corpo." . base64url($assinatura);

    $ch = curl_init('https://oauth2.googleapis.com/token');
    $config = require __DIR__ . '/config.local.php';
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]),
        CURLOPT_CAINFO         => $config['cacert'],
    ]);
    $bruto = curl_exec($ch);
    $erroCurl = curl_error($ch);
    curl_close($ch);
    $resposta = json_decode($bruto, true);

    if (empty($resposta['access_token'])) {
        die('Falha ao obter token. Erro do cURL: ' . $erroCurl . ' | Resposta: ' . $bruto);
    }
    return $token = $resposta['access_token'];
}

// O Firestore devolve cada valor com o tipo junto, ex.: {"stringValue": "Maria"}.
// Esta função tira o "embrulho" e deixa só o valor.
function converterValor($v) {
    if (isset($v['stringValue']))    return $v['stringValue'];
    if (isset($v['integerValue']))   return (int) $v['integerValue'];
    if (isset($v['doubleValue']))    return (float) $v['doubleValue'];
    if (isset($v['booleanValue']))   return $v['booleanValue'];
    if (isset($v['timestampValue'])) return $v['timestampValue'];
    if (isset($v['referenceValue'])) return $v['referenceValue'];
    if (array_key_exists('nullValue', $v)) return null;
    if (isset($v['mapValue'])) {
        $mapa = [];
        foreach ($v['mapValue']['fields'] ?? [] as $k => $x) $mapa[$k] = converterValor($x);
        return $mapa;
    }
    if (isset($v['arrayValue'])) {
        return array_map('converterValor', $v['arrayValue']['values'] ?? []);
    }
    return $v;
}

// ---------- Auxiliares ----------

function configLocal() {
    static $cfg = null;
    if ($cfg === null) $cfg = require __DIR__ . '/config.local.php';
    return $cfg;
}

function urlBase() {
    $projeto = carregarChave()['project_id'];
    return "https://firestore.googleapis.com/v1/projects/$projeto/databases/(default)/documents";
}

// Faz qualquer chamada ao Firestore e lança Exception se vier erro
function firestoreRequest($metodo, $url, $corpo = null) {
    $cabecalhos = ['Authorization: Bearer ' . pegarToken()];
    $opcoes = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $metodo,
    ];
    $cfg = configLocal();
    if (!empty($cfg['cacert'])) $opcoes[CURLOPT_CAINFO] = $cfg['cacert'];

    if ($corpo !== null) {
        $cabecalhos[] = 'Content-Type: application/json';
        $opcoes[CURLOPT_POSTFIELDS] = json_encode($corpo, JSON_UNESCAPED_UNICODE);
    }
    $opcoes[CURLOPT_HTTPHEADER] = $cabecalhos;

    $ch = curl_init($url);
    curl_setopt_array($ch, $opcoes);
    $bruto = curl_exec($ch);
    $erro  = curl_error($ch);
    curl_close($ch);

    if ($bruto === false) throw new Exception("Erro de conexão: $erro");

    $resposta = json_decode($bruto, true);
    if (isset($resposta['error'])) {
        throw new Exception('Firestore: ' . ($resposta['error']['message'] ?? $bruto),
                            (int) ($resposta['error']['code'] ?? 0));
    }
    return $resposta;
}


// Marca um valor como timestamp na hora de gravar
class TimestampFS {
    public $valor;
    public function __construct($valor) { $this->valor = $valor; }
}

// timestamp()                      -> agora
// timestamp('2026-11-12 15:00')    -> essa data (interpretada no fuso do servidor)
function timestamp($quando = null) {
    $data = new DateTime($quando ?? 'now');
    $data->setTimezone(new DateTimeZone('UTC'));
    return new TimestampFS($data->format('Y-m-d\TH:i:s.v\Z'));
}

// PHP -> formato do Firestore (o contrário do converterValor)
function paraValorFirestore($v) {
    if ($v instanceof TimestampFS) return ['timestampValue' => $v->valor];
    if ($v === null)    return ['nullValue' => null];
    if (is_bool($v))    return ['booleanValue' => $v];
    if (is_int($v))     return ['integerValue' => (string) $v];
    if (is_float($v))   return ['doubleValue' => $v];
    if (is_array($v)) {
        if (array_is_list($v)) {
            return ['arrayValue' => ['values' => array_map('paraValorFirestore', $v)]];
        }
        return ['mapValue' => ['fields' => paraCamposFirestore($v)]];
    }
    return ['stringValue' => (string) $v];
}

function paraCamposFirestore($dados) {
    $campos = [];
    foreach ($dados as $nome => $valor) $campos[$nome] = paraValorFirestore($valor);
    return (object) $campos;
}

function documentoParaArray($doc) {
    $item = ['id' => basename($doc['name'])];
    foreach ($doc['fields'] ?? [] as $campo => $valor) {
        $item[$campo] = converterValor($valor);
    }
    return $item;
}

// ---------- CRUD ----------

// 1) READ
//   buscarRegistros('updates')                          -> todos
//   buscarRegistros('updates', 'ID')                    -> um (ou null se não existir)
//   buscarRegistros('updates', null, ['autorUid' => X]) -> filtrados
function buscarRegistros($colecao, $id = null, $filtros = []) {
    // Um registro
    if ($id !== null) {
        try {
            return documentoParaArray(
                firestoreRequest('GET', urlBase() . "/$colecao/" . rawurlencode($id))
            );
        } catch (Exception $e) {
            if ($e->getCode() === 404) return null;
            throw $e;
        }
    }

    // Filtrados (igualdade)
    if (!empty($filtros)) {
        $lista = [];
        foreach ($filtros as $campo => $valor) {
            $lista[] = ['fieldFilter' => [
                'field' => ['fieldPath' => $campo],
                'op'    => 'EQUAL',
                'value' => paraValorFirestore($valor),
            ]];
        }
        $where = count($lista) === 1
            ? $lista[0]
            : ['compositeFilter' => ['op' => 'AND', 'filters' => $lista]];

        $resposta = firestoreRequest('POST', urlBase() . ':runQuery', [
            'structuredQuery' => [
                'from'  => [['collectionId' => $colecao]],
                'where' => $where,
            ],
        ]);

        $registros = [];
        foreach ($resposta as $linha) {
            if (isset($linha['document'])) $registros[] = documentoParaArray($linha['document']);
        }
        return $registros;
    }

    // Todos (com paginação)
    $registros = [];
    $pagina = null;
    do {
        $url = urlBase() . "/$colecao?pageSize=100" . ($pagina ? '&pageToken=' . urlencode($pagina) : '');
        $resposta = firestoreRequest('GET', $url);
        foreach ($resposta['documents'] ?? [] as $doc) $registros[] = documentoParaArray($doc);
        $pagina = $resposta['nextPageToken'] ?? null;
    } while ($pagina);

    return $registros;
}

// 2) CREATE: devolve o registro criado, já com o 'id'
function adicionarRegistro($colecao, $dados, $id = null) {
    $url = urlBase() . "/$colecao" . ($id ? '?documentId=' . urlencode($id) : '');
    $doc = firestoreRequest('POST', $url, ['fields' => paraCamposFirestore($dados)]);
    return documentoParaArray($doc);
}

// 3) DELETE
function deletarRegistro($colecao, $id) {
    firestoreRequest('DELETE', urlBase() . "/$colecao/" . rawurlencode($id));
    return true;
}

// 4) UPDATE: altera só os campos enviados; os outros ficam como estão
function atualizarRegistro($colecao, $id, $dados) {
    $url = urlBase() . "/$colecao/" . rawurlencode($id) . '?currentDocument.exists=true';
    foreach (array_keys($dados) as $campo) {
        $url .= '&updateMask.fieldPaths=' . rawurlencode($campo);
    }
    return documentoParaArray(
        firestoreRequest('PATCH', $url, ['fields' => paraCamposFirestore($dados)])
    );
}