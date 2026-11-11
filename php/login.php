<?php
session_start();
?>


<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Acesse o portal do jogo Reporlog.">
<title>Login | Reporlog</title>
<link rel="stylesheet" href="../css/global.css">
<link rel="stylesheet" href="../css/styles.css">
</head>
<body class="element-login-reporlog">

<header class="cabealho-reporlog" aria-label="Cabeçalho do Reporlog">
<img src="../assets/images/logo-reportlog.png" alt="Logotipo Reporlog" class="logo-reporlog">
<p class="logo-text">Reporlog</p>
<p class="text-wrapper">Jogue | Evolua | Conquiste.</p>
<p class="div">PORTAL DO JOGO</p>
<div class="divisor" aria-hidden="true"></div>
</header>
<form
      class="formulrio-de-acesso"
      method="post"
      aria-labelledby="login-title"
    >
<h1 class="text-wrapper-2" id="login-title">LOGIN</h1>
<p class="p" id="login-description">
Entre para acompanhar os updates do Reporlog.
      </p>
<label class="text-wrapper-3" for="email">E-mail</label>
<div class="div-wrapper">
<input
          class="text-wrapper-4"
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          autocomplete="email"
          required
          aria-describedby="login-description"
        >
</div>
<label class="text-wrapper-5" for="senha">Senha</label>
<div class="div-wrapper">
<input
          class="text-wrapper-4"
          id="senha"
          name="senha"
          type="password"
          placeholder="Senha"
          autocomplete="current-password"
          required
        >
</div>
<button class="entrar" type="submit">
<span class="text-wrapper-6">Entrar</span>
</button>
<a class="text-wrapper-7" href="#recuperar-senha">
Esqueci minha senha
      </a>
<a class="criar-conta" href="#criar-conta">
<span class="text-wrapper-8">Criar conta</span>
</a>
<footer class="reporlog-jogo-de-v">
Reporlog&nbsp;&nbsp;·&nbsp;&nbsp;Jogo de vôlei em pixel art
      </footer>
</form>

</body>
</html>