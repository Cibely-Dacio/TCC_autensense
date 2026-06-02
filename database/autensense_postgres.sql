-- Script de criação do banco de dados para PostgreSQL (Vercel/Supabase/Neon)

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    cidade VARCHAR(150) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    imagem VARCHAR(255) DEFAULT NULL,
    ruido INT NOT NULL DEFAULT 3,
    iluminacao INT NOT NULL DEFAULT 3,
    movimento INT NOT NULL DEFAULT 3,
    nivel_sensorial VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT DEFAULT NULL,
    local_id INT NOT NULL,
    ruido INT NOT NULL DEFAULT 3,
    iluminacao INT NOT NULL DEFAULT 3,
    movimento INT NOT NULL DEFAULT 3,
    comentario TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (local_id) REFERENCES locais(id) ON DELETE CASCADE
);

CREATE TABLE favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    local_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (local_id) REFERENCES locais(id) ON DELETE CASCADE,
    UNIQUE (usuario_id, local_id)
);

CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    usuario_id INT DEFAULT NULL,
    nome VARCHAR(255) NOT NULL,
    idade INT DEFAULT NULL,
    nivel_suporte VARCHAR(50),
    sensibilidade_ruido INT NOT NULL DEFAULT 3,
    sensibilidade_luz INT NOT NULL DEFAULT 3,
    sensibilidade_movimento INT NOT NULL DEFAULT 3,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
