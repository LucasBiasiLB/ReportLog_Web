<?php

session_start();

if (isset($_SESSION['user_id'])) {
    header('Location: index.php/dashboard.php');
    exit();
} else {
    header('Location: php/login.php');
    exit();
}