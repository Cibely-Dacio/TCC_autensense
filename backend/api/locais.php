<?php
require_once "../configg/conexao.php";

$sql = "SELECT 
            id,
            nome AS name,
            categoria AS cat,
            cidade AS city,
            endereco AS address,
            imagem AS image,
            ruido AS noise,
            iluminacao AS light,
            movimento AS flow,
            nivel_sensorial AS sensory,
            latitude AS lat,
            longitude AS lng
        FROM locais
        ORDER BY nome ASC";

$resultado = $conn->query($sql);

$locais = [];

if ($resultado) {
    while ($linha = $resultado->fetch_assoc()) {
        $linha["id"] = (int) $linha["id"];
        $linha["noise"] = (int) $linha["noise"];
        $linha["light"] = (int) $linha["light"];
        $linha["flow"] = (int) $linha["flow"];
        $linha["lat"] = (float) $linha["lat"];
        $linha["lng"] = (float) $linha["lng"];

        $locais[] = $linha;
    }

    echo json_encode($locais, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode([
        "erro" => true,
        "mensagem" => "Erro ao buscar locais: " . $conn->error
    ], JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>