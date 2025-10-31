-- enum roles (si pas déjà créé)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'client', 'commercant', 'livreur');
  END IF;
END$$;

-- users table (avec champs livreur détaillés + verification flag)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role,
  is_whatsapp_verified BOOLEAN DEFAULT FALSE,

  -- Champs spécifiques aux livreurs
  vehicle_plate VARCHAR(50),
  id_document_type VARCHAR(50),
  id_document_number VARCHAR(100),
  id_document_url TEXT,
  profile_photo_url TEXT,
  registration_status VARCHAR(30) DEFAULT 'pending', -- pending, approved, rejected

  created_at TIMESTAMP DEFAULT NOW()
);

-- Politique: ne pas attribuer de rôle par défaut (client/commerçant non enregistrés en base)
-- S'assure qu'aucun DEFAULT n'est présent sur la colonne role
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- table pour gérer la "session" WhatsApp / token à 6 chiffres
CREATE TABLE IF NOT EXISTS whatsapp_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tokens de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- table audit simple
-- Table d'audit partitionnée + gestion de rétention (30 jours)
-- Parent partitionné par range sur created_at
-- Note: la contrainte PRIMARY KEY doit inclure la colonne de partition (created_at)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL NOT NULL,
  user_id INTEGER,
  action VARCHAR(255),
  meta JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Constraint FK (user_id nullable pour autoriser SET NULL lors de suppression utilisateur)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_audit_user') THEN
    ALTER TABLE audit_logs
      ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Index utile pour recherches par utilisateur/temps (propagé aux partitions sur PG moderne)
CREATE INDEX IF NOT EXISTS idx_audit_user_created_at ON audit_logs (user_id, created_at DESC);
