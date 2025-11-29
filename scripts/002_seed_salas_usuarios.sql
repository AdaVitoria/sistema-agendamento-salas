-- Criar alguns usuários de teste com diferentes cargos
INSERT INTO usuarios (email, password_hash, nome, cargo, tipo_usuario, created_at, updated_at)
VALUES 
  -- Admin Diretor (senha: admin123)
  ('diretor@empresa.com', '$2b$10$YourHashHere', 'Carlos Diretor', 'Diretor', 'Admin', NOW(), NOW()),
  -- Gerente (senha: gerente123)
  ('gerente@empresa.com', '$2b$10$YourHashHere', 'Maria Gerente', 'Gerente', 'Comum', NOW(), NOW()),
  -- Coordenador (senha: coord123)
  ('coordenador@empresa.com', '$2b$10$YourHashHere', 'João Coordenador', 'Coordenador', 'Comum', NOW(), NOW()),
  -- Funcionário (senha: func123)
  ('funcionario@empresa.com', '$2b$10$YourHashHere', 'Ana Funcionária', 'Funcionario', 'Comum', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Criar salas de exemplo com diferentes níveis de acesso
INSERT INTO salas (nome, capacidade, tipo_sala, nivel_acesso, "criadorId")
SELECT 
  sala.nome,
  sala.capacidade,
  sala.tipo_sala::tipo_sala,
  sala.nivel_acesso::nivel_acesso,
  (SELECT id FROM usuarios WHERE tipo_usuario = 'Admin' LIMIT 1)
FROM (VALUES
  ('Sala de Reunião 1', 10, 'reuniao', 'Funcionario'),
  ('Sala de Reunião 2', 8, 'reuniao', 'Funcionario'),
  ('Sala de Trabalho A', 6, 'trabalho', 'Coordenador'),
  ('Sala Executiva', 15, 'reuniao', 'Gerente'),
  ('Sala da Diretoria', 20, 'reuniao', 'Diretor'),
  ('Sala de Videoconferência', 12, 'videoconferencia', 'Coordenador')
) AS sala(nome, capacidade, tipo_sala, nivel_acesso)
ON CONFLICT DO NOTHING;

-- Criar alguns agendamentos de exemplo
INSERT INTO agendamentos (codigo_agendamento, nome, data, hora_inicio, hora_fim, status, "criadorId", "salaId")
SELECT 
  'AGD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  agend.nome,
  agend.data,
  agend.hora_inicio::time,
  agend.hora_fim::time,
  agend.status::status,
  (SELECT id FROM usuarios WHERE cargo = agend.cargo_criador LIMIT 1),
  (SELECT id FROM salas WHERE nome = agend.sala_nome LIMIT 1)
FROM (VALUES
  ('Reunião de Equipe', CURRENT_DATE + INTERVAL '1 day', '09:00', '10:00', 'ativo', 'Gerente', 'Sala de Reunião 1'),
  ('Apresentação Projeto', CURRENT_DATE + INTERVAL '2 days', '14:00', '15:30', 'pendente', 'Coordenador', 'Sala Executiva'),
  ('Treinamento', CURRENT_DATE + INTERVAL '3 days', '10:00', '12:00', 'ativo', 'Diretor', 'Sala de Videoconferência')
) AS agend(nome, data, hora_inicio, hora_fim, status, cargo_criador, sala_nome)
WHERE EXISTS (SELECT 1 FROM usuarios WHERE cargo = agend.cargo_criador)
  AND EXISTS (SELECT 1 FROM salas WHERE nome = agend.sala_nome)
ON CONFLICT DO NOTHING;
