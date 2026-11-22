<?php

// __DIR__ = .../ReportLog_Web/src/db
// dirname(__DIR__, 4) = C:\wamp64  → chaveAPI_ReportLog fica ao lado do www e é algo privado!


require_once 'seguranca.php';
seguranca();

return [
    'firebase_credentials' => dirname(__DIR__, 4) . '/chaveAPI_ReportLog/firebase.json',
    'cacert'               => dirname(__DIR__, 4) . '/chaveAPI_ReportLog/cacert.pem',
    'firebase_api_key'     => 'AIzaSyBAq6rRn8HIJCbDWaY_H7a5H9jzYZHHm1U',
    'cloudinary_cloud'  => 'kahqkw8n',
    'cloudinary_key'    => '753467164487524',
    'cloudinary_secret' => 'm648BXzZ9Yi1B2kmqfvU5OcW6L0',
];

