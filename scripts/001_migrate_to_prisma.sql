-- Criação da tabela users (se não existir)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'common' CHECK (role IN ('admin', 'common')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice no email para busca mais rápida
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Inserir usuários de teste (apenas se não existirem)
INSERT INTO users (email, password_hash, name, role)
SELECT 'admin@example.com', '$2a$10$rW3qKPqQhG3J8YhN0Zx5OehqYkZLJKxJYhZhO5dW9fKJhN4Zx5Oeh', 'Administrador', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');

INSERT INTO users (email, password_hash, name, role)
SELECT 'user@example.com', '$2a$10$rW3qKPqQhG3J8YhN0Zx5OehqYkZLJKxJYhZhO5dW9fKJhN4Zx5Oeh', 'Usuário Comum', 'common'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@example.com');

-- Nota: A senha para ambos os usuários é: admin123 / user123
-- Hash bcrypt: $2a$10$rW3qKPqQhG3J8YhN0Zx5OehqYkZLJKxJYhZhO5dW9fKJhN4Zx5Oeh
