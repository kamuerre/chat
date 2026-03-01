CREATE database chat;
use chat;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grupos (
id INT auto_increment primary key,
nombre varchar(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios_grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_grupo INT NOT NULL,

    CONSTRAINT fk_usuarios_grupos_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_usuarios_grupos_grupo
        FOREIGN KEY (id_grupo)
        REFERENCES grupos(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    texto TEXT NOT NULL,
    id_usuario INT NOT NULL,
    id_grupo INT NOT NULL,    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
     CONSTRAINT fk_mensajes_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_mensajes_grupo
        FOREIGN KEY (id_grupo)
        REFERENCES grupos(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
ALTER TABLE usuarios_grupos
  ADD UNIQUE KEY uq_usuario_grupo (id_usuario, id_grupo),
  ADD INDEX idx_grupo (id_grupo);

ALTER TABLE mensajes
  ADD INDEX idx_grupo_fecha (id_grupo, creado_en),
  ADD INDEX idx_usuario_fecha (id_usuario, creado_en);
  
  USE chat;

INSERT INTO usuarios (nombre, email, password_hash)
VALUES 
('Ana', 'ana@chat.com', '$2a$10$uKl5ocpnRIyaikZzWdYVBuSIQIR.cQOuNB7IAP5ZtgVAHxY9aR522'),
('Bruno', 'bruno@chat.com', '$2a$10$uKl5ocpnRIyaikZzWdYVBuSIQIR.cQOuNB7IAP5ZtgVAHxY9aR522');

INSERT INTO grupos (nombre) VALUES ('General');
SELECT id FROM grupos WHERE nombre='General';

INSERT INTO usuarios_grupos (id_usuario, id_grupo)
VALUES 
(1, 1),
(2, 1);