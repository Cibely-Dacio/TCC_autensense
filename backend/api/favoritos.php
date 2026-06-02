<?php
require_once "../configg/conexao.php";

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "GET") {
    $usuario_id = isset($_GET["usuario_id"]) ? (int) $_GET["usuario_id"] : 0;

    if ($usuario_id <= 0) {
        echo json_encode([], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $conn->prepare("
        SELECT 
            f.id,
            f.usuario_id,
            f.local_id,
            l.nome AS local_nome,
            l.categoria,
            l.endereco,
            l.imagem
        FROM favoritos f
        INNER JOIN locais l ON l.id = f.local_id
        WHERE f.usuario_id = ?
        ORDER BY f.criado_em DESC
    ");

    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();

    $resultado = $stmt->get_result();
    $favoritos = [];

    while ($linha = $resultado->fetch_assoc()) {
        $linha["id"] = (int) $linha["id"];
        $linha["usuario_id"] = (int) $linha["usuario_id"];
        $linha["local_id"] = (int) $linha["local_id"];

        $favoritos[] = $linha;
    }

    echo json_encode($favoritos, JSON_UNESCAPED_UNICODE);
    $stmt->close();
    exit;
}

if ($metodo === "POST") {
    $dados = json_decode(file_get_contents("php://input"), true);

    $usuario_id = isset($dados["usuario_id"]) ? (int) $dados["usuario_id"] : 0;
    $local_id = isset($dados["local_id"]) ? (int) $dados["local_id"] : 0;

    if ($usuario_id <= 0 || $local_id <= 0) {
        http_response_code(400);
        echo json_encode(["erro" => true, "mensagem" => "Dados inválidos."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO favoritos (usuario_id, local_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $usuario_id, $local_id);

    if ($stmt->execute()) {
        echo json_encode([
            "erro" => false,
            "mensagem" => "Favorito salvo com sucesso.",
            "id" => $stmt->insert_id
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode([
            "erro" => true,
            "mensagem" => "Erro ao salvar favorito."
        ], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
    exit;
}

if ($metodo === "DELETE") {
    $dados = json_decode(file_get_contents("php://input"), true);

    $usuario_id = isset($dados["usuario_id"]) ? (int) $dados["usuario_id"] : 0;
    $local_id = isset($dados["local_id"]) ? (int) $dados["local_id"] : 0;

    if ($usuario_id <= 0 || $local_id <= 0) {
        http_response_code(400);
        echo json_encode(["erro" => true, "mensagem" => "Dados inválidos."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM favoritos WHERE usuario_id = ? AND local_id = ?");
    $stmt->bind_param("ii", $usuario_id, $local_id);

    if ($stmt->execute()) {
        echo json_encode([
            "erro" => false,
            "mensagem" => "Favorito removido com sucesso."
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode([
            "erro" => true,
            "mensagem" => "Erro ao remover favorito."
        ], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
    exit;
}

http_response_code(405);
echo json_encode(["erro" => true, "mensagem" => "Método não permitido."], JSON_UNESCAPED_UNICODE);

$conn->close();
?>