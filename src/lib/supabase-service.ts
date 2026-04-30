import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import {
  generarCodigoSeguimiento,
  type ArchivoAdjunto,
  type EstadoJustificacion,
  type Justificacion,
} from "@/lib/justificacion";
import type {
  JustificacionInsert,
  JustificacionRow,
  JustificacionUpdate,
} from "@/lib/supabase-types";

const BUCKET_NAME = "evidencias_justificaciones";

type ServiceResult<T> = {
  data: T | null;
  error: string | null;
};

type UploadResult = {
  url: string | null;
  path: string | null;
  error: string | null;
};

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function buildAdjuntos(row: JustificacionRow): ArchivoAdjunto[] {
  if (!row.archivo_url) return [];

  return [
    {
      nombre: row.archivo_path?.split("/").pop() || "evidencia",
      tipo: row.archivo_tipo || "archivo",
      tamano: 0,
      url: row.archivo_url,
    },
  ];
}

export function rowToJustificacion(row: JustificacionRow): Justificacion {
  return {
    id: row.id,
    codigo_seguimiento: row.codigo_seguimiento,
    nombre_completo: row.nombre_completo,
    dni_codigo_docente: row.dni_codigo_docente,
    correo_institucional: row.correo_docente,
    celular: row.celular,
    facultad_area: row.facultad_area, // En UI se muestra como "Escuela"
    curso_asignatura: row.curso_asignatura,
    tipo_justificacion: row.tipo_justificacion,
    fecha_incidencia: row.fecha_incidencia,
    hora_incidencia: row.hora_incidencia,
    turno: row.turno as "mañana" | "tarde" | "noche",
    modalidad: row.modalidad as "presencial" | "virtual" | "semipresencial",
    sede_aula_enlace: row.sede_aula_enlace || "",
    descripcion: row.descripcion,

    // Campos legacy: se mantienen para compatibilidad
    cantidad_estudiantes_afectados: undefined,
    motivo_principal: row.descripcion,
    impacto_academico: "",
    accion_correctiva: "",
    fecha_regularizacion: undefined,
    declaracion_jurada: false,

    archivos_adjuntos: buildAdjuntos(row),
    estado: row.estado,
    observaciones_admin: row.observaciones_admin || "",
    fecha_registro: row.fecha_registro,
    fecha_revision: row.fecha_revision || undefined,
  };
}

export async function generarCodigoSeguimientoUnico(): Promise<string> {
  if (!isSupabaseConfigured()) {
    return generarCodigoSeguimiento();
  }

  const year = new Date().getFullYear();
  const prefix = `JBM-${year}-`;

  const { data, error } = await supabase
    .from("justificaciones_docentes")
    .select("codigo_seguimiento")
    .ilike("codigo_seguimiento", `${prefix}%`)
    .order("codigo_seguimiento", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return `${prefix}0001`;
  }

  const ultimoCodigo = data[0].codigo_seguimiento;
  const ultimoNumero = Number(ultimoCodigo.replace(prefix, "")) || 0;
  const siguienteNumero = String(ultimoNumero + 1).padStart(4, "0");

  return `${prefix}${siguienteNumero}`;
}

export async function subirEvidencia(
  file: File,
  codigoSeguimiento: string,
): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    return {
      url: null,
      path: null,
      error: "Supabase no está configurado.",
    };
  }

  try {
    const extension = file.name.split(".").pop() || "bin";
    const safeName = sanitizeFileName(file.name.replace(/\.[^/.]+$/, ""));
    const timestamp = Date.now();
    const filePath = `${codigoSeguimiento}/${timestamp}-${safeName}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return {
        url: null,
        path: null,
        error: uploadError.message,
      };
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: publicData.publicUrl,
      path: filePath,
      error: null,
    };
  } catch (err) {
    console.error("Error al subir evidencia:", err);
    return {
      url: null,
      path: null,
      error: "No se pudo subir la evidencia.",
    };
  }
}

export async function crearJustificacion(
  payload: JustificacionInsert,
): Promise<ServiceResult<Justificacion>> {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: "Supabase no está configurado.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("justificaciones_docentes")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return {
        data: null,
        error: error.message,
      };
    }

    return {
      data: rowToJustificacion(data),
      error: null,
    };
  } catch (err) {
    console.error("Error al crear justificación:", err);
    return {
      data: null,
      error: "No se pudo registrar la justificación.",
    };
  }
}

export async function listarJustificacionesPorCorreo(
  correo: string,
): Promise<ServiceResult<Justificacion[]>> {
  if (!isSupabaseConfigured()) {
    return {
      data: [],
      error: "Supabase no está configurado.",
    };
  }

  try {
    const correoNormalizado = correo.trim().toLowerCase();

    const { data, error } = await supabase
      .from("justificaciones_docentes")
      .select("*")
      .eq("correo_docente", correoNormalizado)
      .order("fecha_registro", { ascending: false });

    if (error) {
      return {
        data: null,
        error: error.message,
      };
    }

    return {
      data: (data || []).map(rowToJustificacion),
      error: null,
    };
  } catch (err) {
    console.error("Error al listar justificaciones por correo:", err);
    return {
      data: null,
      error: "No se pudieron cargar las solicitudes del docente.",
    };
  }
}

export async function listarTodasLasJustificaciones(): Promise<
  ServiceResult<Justificacion[]>
> {
  if (!isSupabaseConfigured()) {
    return {
      data: [],
      error: "Supabase no está configurado.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("justificaciones_docentes")
      .select("*")
      .order("fecha_registro", { ascending: false });

    if (error) {
      return {
        data: null,
        error: error.message,
      };
    }

    return {
      data: (data || []).map(rowToJustificacion),
      error: null,
    };
  } catch (err) {
    console.error("Error al listar todas las justificaciones:", err);
    return {
      data: null,
      error: "No se pudieron cargar las solicitudes.",
    };
  }
}

export async function obtenerTodasJustificaciones(): Promise<Justificacion[]> {
  const { data, error } = await listarTodasLasJustificaciones();
  if (error || !data) return [];
  return data;
}

export async function obtenerJustificacionPorId(
  id: string,
): Promise<ServiceResult<Justificacion>> {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: "Supabase no está configurado.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("justificaciones_docentes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return {
        data: null,
        error: error.message,
      };
    }

    return {
      data: rowToJustificacion(data),
      error: null,
    };
  } catch (err) {
    console.error("Error al obtener justificación:", err);
    return {
      data: null,
      error: "No se pudo obtener la justificación.",
    };
  }
}

export async function actualizarJustificacion(
  id: string,
  payload: JustificacionUpdate,
): Promise<ServiceResult<Justificacion>> {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: "Supabase no está configurado.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("justificaciones_docentes")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return {
        data: null,
        error: error.message,
      };
    }

    return {
      data: rowToJustificacion(data),
      error: null,
    };
  } catch (err) {
    console.error("Error al actualizar justificación:", err);
    return {
      data: null,
      error: "No se pudo actualizar la justificación.",
    };
  }
}

export async function actualizarRevisionJustificacion(params: {
  id: string;
  estado: EstadoJustificacion;
  observaciones_admin?: string;
}): Promise<ServiceResult<Justificacion>> {
  return actualizarJustificacion(params.id, {
    estado: params.estado,
    observaciones_admin: params.observaciones_admin || null,
    fecha_revision: new Date().toISOString(),
  });
}

export async function eliminarEvidenciaPorPath(
  path: string,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase no está configurado." };
  }

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    console.error("Error al eliminar evidencia:", err);
    return { error: "No se pudo eliminar la evidencia." };
  }
}
