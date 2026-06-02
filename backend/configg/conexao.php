<?php
header("Content-Type: application/json; charset=UTF-8");

$host = "127.0.0.1";
$porta = 3307;
$usuario = "root";
$senha = "";
$banco = "autensense_db";

$conn = new mysqli($host, $usuario, $senha, $banco, $porta);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "erro" => true,
        "mensagem" => "Erro ao conectar ao banco: " . $conn->connect_error
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$conn->set_charset("utf8mb4");
?>