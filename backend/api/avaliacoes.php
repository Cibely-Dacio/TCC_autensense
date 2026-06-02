<?php
require_once "../configg/conexao.php";

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "GET") {
    $usuario_id = isset($_GET["usuario_id"]) ? (int) $_GET["usuario_id"] : 0;

    if ($usuario_id > 0) {
        $stmt = $conn->prepare("
            SELECT 
                a.id,
                a.usuario_id,
                a.local_id,
                l.nome AS local_nome,
                a.ruido,
                a.iluminacao,
                a.movimento,
                a.comentario,
                a.criado_em
            FROM avaliacoes a
            INNER JOIN locais l ON l.id = a.local_id
            WHERE a.usuario_id = ?
            ORDER BY a.criado_em DESC
        ");
        $stmt->bind_param("i", $usuario_id);
    } else {
        $stmt = $conn->prepare("
            SELECT 
                a.id,
                a.usuario_id,
                a.local_id,
                l.nome AS local_nome,
                a.ruido,
                a.iluminacao,
                a.movimento,
                a.comentario,
                a.criado_em
            FROM avaliacoes a
            INNER JOIN locais l ON l.id = a.local_id
            ORDER BY a.criado_em DESC
        ");
    }

    $stmt->execute();
    $resultado = $stmt->get_result();

    $avaliacoes = [];

    while ($linha = $resultado->fetch_assoc()) {
        $linha["id"] = (int) $linha["id"];
        $linha["usuario_id"] = $linha["usuario_id"] !== null ? (int) $linha["usuario_id"] : null;
        $linha["local_id"] = (int) $linha["local_id"];
        $linha["ruido"] = (int) $linha["ruido"];
        $linha["iluminacao"] = (int) $linha["iluminacao"];
        $linha["movimento"] = (int) $linha["movimento"];

        $avaliacoes[] = $linha;
    }

    echo json_encode($avaliacoes, JSON_UNESCAPED_UNICODE);
    $stmt->close();
    exit;
}

if ($metodo === "POST") {
    $dados = json_decode(file_get_contents("php://input"), true);

    $usuario_id = isset($dados["usuario_id"]) ? (int) $dados["usuario_id"] : null;
    $local_id = isset($dados["local_id"]) ? (int) $dados["local_id"] : 0;
    $ruido = isset($dados["ruido"]) ? (int) $dados["ruido"] : 3;
    $iluminacao = isset($dados["iluminacao"]) ? (int) $dados["iluminacao"] : 3;
    $movimento = isset($dados["movimento"]) ? (int) $dados["movimento"] : 3;
    $comentario = trim($dados["comentario"] ?? "");

    if ($local_id <= 0) {
        http_response_code(400);
        echo json_encode(["erro" => true, "mensagem" => "Local inválido."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $conn->prepare("
        INSERT INTO avaliacoes 
        (usuario_id, local_id, ruido, iluminacao, movimento, comentario)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param("iiiiis", $usuario_id, $local_id, $ruido, $iluminacao, $movimento, $comentario);

    if ($stmt->execute()) {
        echo json_encode([
            "erro" => false,
            "mensagem" => "Avaliação salva com sucesso.",
            "id" => $stmt->insert_id
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode([
            "erro" => true,
            "mensagem" => "Erro ao salvar avaliação: " . $conn->error
        ], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
    exit;
}

http_response_code(405);
echo json_encode(["erro" => true, "mensagem" => "Método não permitido."], JSON_UNESCAPED_UNICODE);

$conn->close();
?>