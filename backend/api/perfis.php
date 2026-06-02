<?php
require_once "../configg/conexao.php";

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "GET") {
    $usuario_id = isset($_GET["usuario_id"]) ? (int) $_GET["usuario_id"] : 0;

    if ($usuario_id > 0) {
        $stmt = $conn->prepare("SELECT * FROM perfis WHERE usuario_id = ? ORDER BY criado_em DESC");
        $stmt->bind_param("i", $usuario_id);
    } else {
        $stmt = $conn->prepare("SELECT * FROM perfis ORDER BY criado_em DESC");
    }

    $stmt->execute();
    $resultado = $stmt->get_result();

    $perfis = [];

    while ($linha = $resultado->fetch_assoc()) {
        $linha["id"] = (int) $linha["id"];
        $linha["usuario_id"] = $linha["usuario_id"] !== null ? (int) $linha["usuario_id"] : null;
        $linha["idade"] = $linha["idade"] !== null ? (int) $linha["idade"] : null;
        $linha["sensibilidade_ruido"] = (int) $linha["sensibilidade_ruido"];
        $linha["sensibilidade_luz"] = (int) $linha["sensibilidade_luz"];
        $linha["sensibilidade_movimento"] = (int) $linha["sensibilidade_movimento"];

        $perfis[] = $linha;
    }

    echo json_encode($perfis, JSON_UNESCAPED_UNICODE);
    $stmt->close();
    exit;
}

if ($metodo === "POST") {
    $dados = json_decode(file_get_contents("php://input"), true);

    $usuario_id = isset($dados["usuario_id"]) ? (int) $dados["usuario_id"] : null;
    $nome = trim($dados["nome"] ?? "");
    $idade = isset($dados["idade"]) && $dados["idade"] !== "" ? (int) $dados["idade"] : null;
    $nivel_suporte = trim($dados["nivel_suporte"] ?? "");
    $sensibilidade_ruido = isset($dados["sensibilidade_ruido"]) ? (int) $dados["sensibilidade_ruido"] : 3;
    $sensibilidade_luz = isset($dados["sensibilidade_luz"]) ? (int) $dados["sensibilidade_luz"] : 3;
    $sensibilidade_movimento = isset($dados["sensibilidade_movimento"]) ? (int) $dados["sensibilidade_movimento"] : 3;
    $observacoes = trim($dados["observacoes"] ?? "");

    if ($nome === "") {
        http_response_code(400);
        echo json_encode(["erro" => true, "mensagem" => "Informe o nome do perfil."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $conn->prepare("
        INSERT INTO perfis 
        (usuario_id, nome, idade, nivel_suporte, sensibilidade_ruido, sensibilidade_luz, sensibilidade_movimento, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "isisiiis",
        $usuario_id,
        $nome,
        $idade,
        $nivel_suporte,
        $sensibilidade_ruido,
        $sensibilidade_luz,
        $sensibilidade_movimento,
        $observacoes
    );

    if ($stmt->execute()) {
        echo json_encode([
            "erro" => false,
            "mensagem" => "Perfil salvo com sucesso.",
            "id" => $stmt->insert_id
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode([
            "erro" => true,
            "mensagem" => "Erro ao salvar perfil: " . $conn->error
        ], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
    exit;
}

http_response_code(405);
echo json_encode(["erro" => true, "mensagem" => "Método não permitido."], JSON_UNESCAPED_UNICODE);

$conn->close();
?>