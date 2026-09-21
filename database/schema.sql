CREATE TABLE tb_admin(
    id_admin INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(60) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    CONSTRAINT uq_tb_admin_cpf cpf UNIQUE(cpf),
    CONSTRAINT uq_tb_admin email UNIQUE (email)
);

CREATE TABLE tb_hemocentro (
    id_hemocentro INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_admin INT NULL,
    nome VARCHAR(255),
    codigo_cnes VARCHAR(7) NOT NULL,
    senha_hash VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    status VARCHAR(8) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    bairro VARCHAR(255) NOT NULL,
    CONSTRAINT uq_tb_hemocentro_codigo_cnes UNIQUE (codigo_cnes),
    CONSTRAINT uq_tb_hemocentro_cnpj UNIQUE (cnpj),
    CONSTRAINT ck_tb_hemocentro_status CHECK (status IN ('pendente','aprovado','recusado'))
    CONSTRAINT fk_tb_hemocentro_tb_admin FOREIGN KEY (id_admin) REFERENCES
    tb_admin(id_admin)
    );
CREATE TABLE tb_contatos_hemocentro (
    id_contato INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contato VARCHAR(20) NOT NULL,
    id_hemocentro INT NOT NULL,
    CONSTRAINT fk_tb_contatos_hemocentro_tb_hemocentro FOREIGN KEY (id_hemocentro) REFERENCES
    tb_hemocentro(id_hemocentro)
);
CREATE TABLE tb_campanha(
    id_campanha INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_fechamento DATE NOT NULL,
    tipo_sanguineo_necessario VARCHAR(3) NOT NULL,
    urgencia VARCHAR(10) NOT NULL,
    id_hemocentro INT NOT NULL,
    CONSTRAINT ck_tb_campanha_tipo_sanguineo_necessario CHECK (tipo_sanguineo_necessario IN ('A+','A-','B+','B-','AB+','AB-','O+','O-'))
    CONSTRAINT fk_tb_campanha_tb_hemocentro FOREIGN KEY (id_hemocentro) REFERENCES tb_hemocentro(id_hemocentro)
);
CREATE TABLE tb_doador (
    id_doador INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(60) NOT NULL,
    tipo_sanguineo VARCHAR(3) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    peso FLOAT NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    data_nascimento DATE NOT NULL,
    CONSTRAINT uq_tb_doador_cpf UNIQUE (cpf),
    CONSTRAINT uq_tb_doador_email UNIQUE (email),
    CONSTRAINT ck_tb_doador_tipo_sanguineo CHECK (tipo_sanguineo IN ('A+','A-','B+','B-','AB+','AB-','O+','O-'))
);
CREATE TABLE tb_interesse(
    id_interesse INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_doador INT NOT NULL,
    id_campanha INT NOT NULL,
    CONSTRAINT fk_tb_interesse_tb_doador FOREIGN KEY (id_doador) REFERENCES tb_doador(id_doador),
    CONSTRAINT fk_tb_interesse_tb_campanha FOREIGN KEY (id_campanha) REFERENCES tb_campanha(id_campanha)
);
CREATE TABLE tb_doacao(
    id_doacao INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    data DATE,
    id_doador INT NOT NULL,
    id_hemocentro INT NOT NULL,
    id_interesse INT NOT NULL,
    CONSTRAINT fk_tb_doacao_tb_doador FOREIGN KEY (id_doador) REFERENCES tb_doador(id_doador),
    CONSTRAINT fk_tb_doacao_tb_hemocentro FOREIGN KEY (id_hemocentro) REFERENCES tb_hemocentro(id_hemocentro),
    CONSTRAINT fk_tb_doacao_tb_interesse FOREIGN KEY (id_interesse) REFERENCES tb_interesse(id_interesse)
);

