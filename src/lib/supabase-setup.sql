-- ============================================================
-- SQL para crear las tablas en Supabase
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- 1. Tabla de perfiles de usuarios
CREATE TABLE IF NOT EXISTS perfiles_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correo TEXT UNIQUE NOT NULL,
  nombre_completo TEXT,
  rol TEXT NOT NULL CHECK (rol IN ('docente', 'coordinador')),
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla principal de justificaciones docentes
CREATE TABLE IF NOT EXISTS justificaciones_docentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_seguimiento TEXT UNIQUE NOT NULL,
  correo_docente TEXT NOT NULL,
  nombre_completo TEXT NOT NULL,
  dni_codigo_docente TEXT NOT NULL,
  celular TEXT NOT NULL,
  facultad_area TEXT NOT NULL,
  curso_asignatura TEXT NOT NULL,
  tipo_justificacion TEXT NOT NULL CHECK (tipo_justificacion IN ('tardanza','inasistencia','incumplimiento','permiso','reprogramacion','otro')),
  fecha_incidencia DATE NOT NULL,
  hora_incidencia TEXT NOT NULL,
  turno TEXT NOT NULL CHECK (turno IN ('mañana','tarde','noche')),
  modalidad TEXT NOT NULL CHECK (modalidad IN ('presencial','virtual','semipresencial')),
  sede_aula_enlace TEXT,
  cantidad_estudiantes_afectados INT,
  descripcion TEXT NOT NULL,
  motivo_principal TEXT NOT NULL,
  impacto_academico TEXT,
  accion_correctiva TEXT,
  fecha_regularizacion DATE,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','en_revision','aprobada','observada','rechazada','subsanada')),
  observaciones_admin TEXT,
  archivo_url TEXT,
  archivo_path TEXT,
  archivo_tipo TEXT,
  fecha_registro TIMESTAMPTZ DEFAULT now(),
  fecha_revision TIMESTAMPTZ
);

-- 3. Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_justificaciones_correo ON justificaciones_docentes(correo_docente);
CREATE INDEX IF NOT EXISTS idx_justificaciones_estado ON justificaciones_docentes(estado);
CREATE INDEX IF NOT EXISTS idx_justificaciones_codigo ON justificaciones_docentes(codigo_seguimiento);

-- 4. RLS (Row Level Security) - Ajustar según necesidad
ALTER TABLE justificaciones_docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles_usuarios ENABLE ROW LEVEL SECURITY;

-- Política: permitir lectura y escritura pública (ajustar en producción)
CREATE POLICY "Permitir todo en justificaciones" ON justificaciones_docentes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo en perfiles" ON perfiles_usuarios
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Storage: crear bucket para evidencias
-- (Ejecutar desde el dashboard de Supabase → Storage → New Bucket)
-- Nombre: evidencias_justificaciones
-- Público: Sí (para URLs directas)
-- Tamaño máximo: 10MB
