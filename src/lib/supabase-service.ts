import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type {
  JustificacionRow,
  JustificacionInsert,
  EstadoJustificacion,
} from "@/lib/supabase-types";
import { mockJustificaciones, type Justificacion } from "@/lib/justificacion";

// ─── Código de seguimiento ──────────────────────────────────
let ultimoContador: number | null = null;

export async function generarCodigoSeguimientoUnico(): Promise<string> {
  const anio = new Date().getFullYear();

  if (isSupabaseConfigured()) {
    const { count } = await supabase
      .from("justificaciones_docentes")
      .select("*", { count: "exact", head: true });

    const siguiente = (count ?? 0) + 1;
    return `JBM-${anio}-${String(siguiente).padStart(4, "0")}`;
  }

  // Fallback local
  if (ultimoContador === null) ultimoContador = mockJustificaciones.length;
  ultimoContador++;
  return `JBM-${anio}-${String(ultimoContador).padStart(4, "0")}`;
}

// ─── Crear justificación ────────────────────────────────────
export async function crearJustificacion(
  data: JustificacionInsert
): Promise<{ data: JustificacionRow | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: "Supabase no está configurado." };
  }

  const { data: row, error } = await supabase
    .from("justificaciones_docentes")
    .insert(data as any)
    .select()
    .single();

  if (error) {
    console.error("Error al crear justificación:", error);
    return { data: null, error: error.message };
  }
  return { data: row as JustificacionRow, error: null };
}

// ─── Obtener justificaciones por correo ─────────────────────
export async function obtenerJustificacionesPorCorreo(
  correo: string
): Promise<JustificacionRow[]> {
  if (!isSupabaseConfigured()) {
    return mockJustificaciones.filter(
      (j) => j.correo_institucional.toLowerCase() === correo.toLowerCase()
    ) as unknown as JustificacionRow[];
  }

  const { data, error } = await supabase
    .from("justificaciones_docentes")
    .select("*")
    .eq("correo_docente", correo.toLowerCase())
    .order("fecha_registro", { ascending: false });

  if (error) {
    console.error("Error al obtener justificaciones:", error);
    return [];
  }
  return (data || []) as JustificacionRow[];
}

// ─── Obtener todas (coordinador) ────────────────────────────
export async function obtenerTodasJustificaciones(): Promise<JustificacionRow[]> {
  if (!isSupabaseConfigured()) {
    return mockJustificaciones as unknown as JustificacionRow[];
  }

  const { data, error } = await supabase
    .from("justificaciones_docentes")
    .select("*")
    .order("fecha_registro", { ascending: false });

  if (error) {
    console.error("Error al obtener justificaciones:", error);
    return [];
  }
  return (data || []) as JustificacionRow[];
}

// ─── Actualizar estado y observaciones ──────────────────────
export async function actualizarJustificacion(
  id: string,
  updates: {
    estado?: EstadoJustificacion;
    observaciones_admin?: string;
  }
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase no está configurado." };
  }

  const { error } = await supabase
    .from("justificaciones_docentes")
    .update({
      ...updates,
      fecha_revision: new Date().toISOString(),
    } as any)
    .eq("id", id);

  if (error) {
    console.error("Error al actualizar justificación:", error);
    return { error: error.message };
  }
  return { error: null };
}

// ─── Subir evidencia ────────────────────────────────────────
export async function subirEvidencia(
  file: File,
  codigoSeguimiento: string
): Promise<{ url: string | null; path: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { url: null, path: null, error: "Supabase no está configurado." };
  }

  const extension = file.name.split(".").pop();
  const filePath = `${codigoSeguimiento}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("evidencias_justificaciones")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("Error al subir archivo:", error);
    return { url: null, path: null, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from("evidencias_justificaciones")
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl, path: filePath, error: null };
}

// ─── Obtener URL de evidencia ───────────────────────────────
export function obtenerUrlEvidencia(path: string): string {
  const { data } = supabase.storage
    .from("evidencias_justificaciones")
    .getPublicUrl(path);
  return data.publicUrl;
}

// ─── Adaptador: JustificacionRow → Justificacion (legacy) ──
export function rowToJustificacion(row: JustificacionRow): Justificacion {
  return {
    id: row.id,
    codigo_seguimiento: row.codigo_seguimiento,
    nombre_completo: row.nombre_completo,
    dni_codigo_docente: row.dni_codigo_docente,
    correo_institucional: row.correo_docente,
    celular: row.celular,
    facultad_area: row.facultad_area,
    curso_asignatura: row.curso_asignatura,
    tipo_justificacion: row.tipo_justificacion,
    fecha_incidencia: row.fecha_incidencia,
    hora_incidencia: row.hora_incidencia,
    turno: row.turno as Justificacion["turno"],
    modalidad: row.modalidad as Justificacion["modalidad"],
    sede_aula_enlace: row.sede_aula_enlace || "",
    cantidad_estudiantes_afectados: row.cantidad_estudiantes_afectados ?? undefined,
    descripcion: row.descripcion,
    motivo_principal: row.motivo_principal,
    impacto_academico: row.impacto_academico || "",
    accion_correctiva: row.accion_correctiva || "",
    fecha_regularizacion: row.fecha_regularizacion ?? undefined,
    archivos_adjuntos: row.archivo_url
      ? [{ nombre: row.archivo_path?.split("/").pop() || "archivo", tipo: row.archivo_tipo || "", tamano: 0, url: row.archivo_url }]
      : [],
    declaracion_jurada: true,
    estado: row.estado,
    observaciones_admin: row.observaciones_admin ?? undefined,
    fecha_registro: row.fecha_registro,
    fecha_revision: row.fecha_revision ?? undefined,
  };
}
