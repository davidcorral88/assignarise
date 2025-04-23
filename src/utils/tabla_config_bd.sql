
-- Script para crear la tabla de configuración de revisión diaria
-- Ejecutar este script en la base de datos PostgreSQL

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS review_config (
  id SERIAL PRIMARY KEY,
  enabled CHAR(1) NOT NULL DEFAULT 'N', -- 'S' para activado, 'N' para desactivado
  review_time VARCHAR(5) NOT NULL DEFAULT '09:00', -- formato HH:MM
  notification_emails TEXT, -- emails separados por comas
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insertar configuración por defecto si la tabla está vacía
INSERT INTO review_config (enabled, review_time, notification_emails)
SELECT 'N', '09:00', ''
WHERE NOT EXISTS (SELECT 1 FROM review_config);

-- Añadir campo email_notification a la tabla de usuarios si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'email_notification'
    ) THEN
        ALTER TABLE users ADD COLUMN email_notification BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Añadir también una ruta en la API para manejar esta configuración
-- Esto requerirá crear un nuevo archivo en src/api/routes/review-config.js
-- Y registrarlo en src/api/server.js
