export interface Justificacion {
  id: string;
  codigo_seguimiento: string;
  nombre_completo: string;
  dni_codigo_docente: string;
  correo_institucional: string;
  celular: string;
  facultad_area: string;
  curso_asignatura: string;
  tipo_justificacion: "tardanza" | "inasistencia" | "incumplimiento" | "permiso" | "reprogramacion" | "otro";
  fecha_incidencia: string;
  hora_incidencia: string;
  turno: "mañana" | "tarde" | "noche";
  modalidad: "presencial" | "virtual" | "semipresencial";
  sede_aula_enlace: string;
  cantidad_estudiantes_afectados?: number;
  descripcion: string;
  motivo_principal: string;
  impacto_academico: string;
  accion_correctiva: string;
  fecha_regularizacion?: string;
  archivos_adjuntos: ArchivoAdjunto[];
  declaracion_jurada: boolean;
  estado: "pendiente" | "en_revision" | "aprobada" | "observada" | "rechazada";
  observaciones_admin?: string;
  fecha_registro: string;
  fecha_revision?: string;
}

export interface ArchivoAdjunto {
  nombre: string;
  tipo: string;
  tamano: number;
  url?: string;
}

export type TipoJustificacion = Justificacion["tipo_justificacion"];
export type EstadoJustificacion = Justificacion["estado"];

export function generarCodigoSeguimiento(): string {
  const prefix = "JD";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function getEstadoLabel(estado: EstadoJustificacion): string {
  const labels: Record<EstadoJustificacion, string> = {
    pendiente: "Pendiente de revisión",
    en_revision: "En revisión",
    aprobada: "Aprobada",
    observada: "Observada",
    rechazada: "Rechazada",
  };
  return labels[estado];
}

export function getEstadoColor(estado: EstadoJustificacion): string {
  const colors: Record<EstadoJustificacion, string> = {
    pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    en_revision: "bg-blue-100 text-blue-800 border-blue-300",
    aprobada: "bg-green-100 text-green-800 border-green-300",
    observada: "bg-orange-100 text-orange-800 border-orange-300",
    rechazada: "bg-red-100 text-red-800 border-red-300",
  };
  return colors[estado];
}

export function getTipoLabel(tipo: TipoJustificacion): string {
  const labels: Record<TipoJustificacion, string> = {
    tardanza: "Tardanza",
    inasistencia: "Inasistencia",
    incumplimiento: "Incumplimiento",
    permiso: "Permiso",
    reprogramacion: "Reprogramación",
    otro: "Otro",
  };
  return labels[tipo];
}
