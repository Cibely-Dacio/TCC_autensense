<?php
require_once "../configg/conexao.php";

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "POST") {
    $dados = json_decode(file_get_contents("php://input"), true);

    $acao = $dados["acao"] ?? "";
    $nome = trim($dados["nome"] ?? "");
    $email = trim($dados["email"] ?? "");
    $senha = trim($dados["senha"] ?? "");

    if ($acao === "registrar") {
        if ($nome === "" || $email === "" || $senha === "") {
            http_response_code(400);
            echo json_encode(["erro" => true, "mensagem" => "Preencha todos os campos."], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $nome, $email, $senhaHash);

        if ($stmt->execute()) {
            echo json_encode([
                "erro" => false,
                "mensagem" => "Conta criada com sucesso.",
                "usuario" => [
                    "id" => $stmt->insert_id,
                    "nome" => $nome,
                    "email" => $email
                ]
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(["erro" => true, "mensagem" => "Erro ao criar conta."], JSON_UNESCAPED_UNICODE);
        }

        $stmt->close();
        exit;
    }

    if ($acao === "login") {
        if ($email === "" || $senha === "") {
            http_response_code(400);
            echo json_encode(["erro" => true, "mensagem" => "Informe e-mail e senha."], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $conn->prepare("SELECT id, nome, email, senha FROM usuarios WHERE email = ? LIMIT 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();

        $resultado = $stmt->get_result();

        if ($usuario = $resultado->fetch_assoc()) {
            if (password_verify($senha, $usuario["senha"])) {
                echo json_encode([
                    "erro" => false,
                    "mensagem" => "Login realizado com sucesso.",
                    "usuario" => [
                        "id" => (int) $usuario["id"],
                        "nome" => $usuario["nome"],
                        "email" => $usuario["email"]
                    ]
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(401);
                echo json_encode(["erro" => true, "mensagem" => "Senha incorreta."], JSON_UNESCAPED_UNICODE);
            }
        } else {
            http_response_code(404);
            echo json_encode(["erro" => true, "mensagem" => "Usuário não encontrado."], JSON_UNESCAPED_UNICODE);
        }

        $stmt->close();
        exit;
    }

    if ($acao === "recuperar") {
        if ($email === "") {
            http_response_code(400);
            echo json_encode(["erro" => true, "mensagem" => "Informe o e-mail."], JSON_UNESCAPED_UNICODE);
            exit;
        }

        echo json_encode([
            "erro" => false,
            "mensagem" => "Solicitação de recuperação registrada. Em uma versão final, o link seria enviado por e-mail."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

http_response_code(405);
echo json_encode(["erro" => true, "mensagem" => "Método não permitido."], JSON_UNESCAPED_UNICODE);

$conn->close();
?>