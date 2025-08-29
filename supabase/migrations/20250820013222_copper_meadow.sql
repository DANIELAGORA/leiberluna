/*
  # Esquema inicial para FELIPE - Sistema Fiscal IA
  
  1. Nuevas Tablas
    - `profiles` - Perfiles de usuarios fiscales
    - `cases` - Casos y expedientes fiscales  
    - `documents` - Documentos legales y evidencias
    - `ai_conversations` - Conversaciones con IA
    - `calendar_events` - Eventos y audiencias
    - `notifications` - Sistema de notificaciones
    - `audit_logs` - Logs de auditoría
    
  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas de acceso por usuario
    - Auditoría completa de cambios
    
  3. Funcionalidades
    - Triggers para auditoría automática
    - Funciones para estadísticas
    - Índices optimizados para consultas
*/

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  position text NOT NULL,
  fiscalia text NOT NULL,
  phone text,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de casos fiscales
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number text UNIQUE NOT NULL,
  title text NOT NULL,
  defendant text NOT NULL,
  crime_type text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'archived')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  description text,
  investigator text NOT NULL,
  evidence_count integer DEFAULT 0,
  witness_count integer DEFAULT 0,
  next_hearing timestamptz,
  metadata jsonb DEFAULT '{}',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'analyzed', 'reviewed')),
  confidence integer DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  summary text,
  key_points text[] DEFAULT '{}',
  issues text[] DEFAULT '{}',
  file_url text,
  file_size bigint,
  mime_type text,
  analysis_metadata jsonb DEFAULT '{}',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de conversaciones IA
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text,
  messages jsonb NOT NULL DEFAULT '[]',
  model_used text DEFAULT 'codellama',
  total_tokens integer DEFAULT 0,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de eventos de calendario
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('audiencia', 'diligencia', 'reunion', 'termino')),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text,
  participants text[] DEFAULT '{}',
  case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  metadata jsonb DEFAULT '{}',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read boolean DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Políticas RLS para cases
CREATE POLICY "Los usuarios pueden ver sus propios casos"
  ON cases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear casos"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios casos"
  ON cases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios casos"
  ON cases FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para documents
CREATE POLICY "Los usuarios pueden ver sus propios documentos"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear documentos"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios documentos"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para ai_conversations
CREATE POLICY "Los usuarios pueden ver sus propias conversaciones"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear conversaciones"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias conversaciones"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para calendar_events
CREATE POLICY "Los usuarios pueden ver sus propios eventos"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear eventos"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios eventos"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para notifications
CREATE POLICY "Los usuarios pueden ver sus propias notificaciones"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias notificaciones"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para audit_logs
CREATE POLICY "Los usuarios pueden ver logs de sus propias acciones"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events(case_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Índices de texto completo
CREATE INDEX IF NOT EXISTS idx_cases_search ON cases USING gin(to_tsvector('spanish', title || ' ' || defendant || ' ' || crime_type));
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents USING gin(to_tsvector('spanish', name || ' ' || COALESCE(summary, '')));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función de auditoría
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id, created_at)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid(), now());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id, created_at)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid(), now());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id, created_at)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid(), now());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers de auditoría
CREATE TRIGGER audit_cases AFTER INSERT OR UPDATE OR DELETE ON cases FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_calendar_events AFTER INSERT OR UPDATE OR DELETE ON calendar_events FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Función para estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_cases', (SELECT COUNT(*) FROM cases WHERE user_id = user_uuid),
        'active_cases', (SELECT COUNT(*) FROM cases WHERE user_id = user_uuid AND status = 'active'),
        'pending_cases', (SELECT COUNT(*) FROM cases WHERE user_id = user_uuid AND status = 'pending'),
        'completed_cases', (SELECT COUNT(*) FROM cases WHERE user_id = user_uuid AND status = 'completed'),
        'critical_cases', (SELECT COUNT(*) FROM cases WHERE user_id = user_uuid AND priority = 'critical'),
        'total_documents', (SELECT COUNT(*) FROM documents WHERE user_id = user_uuid),
        'analyzed_documents', (SELECT COUNT(*) FROM documents WHERE user_id = user_uuid AND status = 'analyzed'),
        'upcoming_events', (SELECT COUNT(*) FROM calendar_events WHERE user_id = user_uuid AND start_time > now() AND start_time < now() + interval '7 days'),
        'unread_notifications', (SELECT COUNT(*) FROM notifications WHERE user_id = user_uuid AND is_read = false)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar casos
CREATE OR REPLACE FUNCTION search_cases(user_uuid uuid, search_term text)
RETURNS TABLE (
    id uuid,
    case_number text,
    title text,
    defendant text,
    crime_type text,
    status text,
    priority text,
    progress integer,
    created_at timestamptz,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.case_number,
        c.title,
        c.defendant,
        c.crime_type,
        c.status,
        c.priority,
        c.progress,
        c.created_at,
        ts_rank(to_tsvector('spanish', c.title || ' ' || c.defendant || ' ' || c.crime_type), plainto_tsquery('spanish', search_term)) as rank
    FROM cases c
    WHERE c.user_id = user_uuid
    AND (
        search_term = '' OR
        to_tsvector('spanish', c.title || ' ' || c.defendant || ' ' || c.crime_type) @@ plainto_tsquery('spanish', search_term) OR
        c.case_number ILIKE '%' || search_term || '%'
    )
    ORDER BY rank DESC, c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Datos de ejemplo para desarrollo
INSERT INTO profiles (id, email, full_name, position, fiscalia) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'ana.rodriguez@fiscalia.gov.co', 'Dra. Ana Rodríguez Martínez', 'Fiscal 25 Local', 'Fiscalía 25 Local - Bogotá'),
  ('550e8400-e29b-41d4-a716-446655440001', 'carlos.mendoza@fiscalia.gov.co', 'Dr. Carlos Mendoza Silva', 'Fiscal Especializado', 'Unidad de Delitos Económicos')
ON CONFLICT (email) DO NOTHING;

-- Casos de ejemplo
INSERT INTO cases (case_number, title, defendant, crime_type, status, priority, progress, investigator, evidence_count, witness_count, user_id) VALUES
  ('FIS-2024-001', 'Investigación por Fraude Fiscal Empresarial', 'Empresa ABC S.A.S.', 'Delitos contra el orden económico social', 'active', 'high', 65, 'Dr. Carlos Mendoza', 12, 5, '550e8400-e29b-41d4-a716-446655440000'),
  ('FIS-2024-002', 'Lavado de Activos - Sector Financiero', 'Juan Carlos Pérez', 'Lavado de activos', 'active', 'critical', 40, 'Dra. María González', 8, 3, '550e8400-e29b-41d4-a716-446655440000'),
  ('FIS-2024-003', 'Delito Informático - Estafa Virtual', 'Ana María López', 'Delitos informáticos', 'pending', 'medium', 25, 'Dr. Roberto Silva', 4, 2, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (case_number) DO NOTHING;