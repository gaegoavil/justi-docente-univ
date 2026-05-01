export interface ArchivoAdjunto {
  nombre: string;
  tipo: string;
  tamano: number;
  url?: string;
}

export interface Justificacion {
  id: string;
  codigo_seguimiento: string;
  nombre_completo: string;
  dni_codigo_docente: string;
  correo_institucional: string;
  celular: string;
  facultad_area: string; // En UI ahora se muestra como "Escuela"
  curso_asignatura: string;
  tipo_justificacion: "tardanza" | "inasistencia";
  fecha_incidencia: string;
  hora_incidencia: string;
  turno?: "mañana" | "tarde" | "noche";
  modalidad: "presencial" | "virtual" | "semipresencial";
  sede_aula_enlace: string; // En UI ahora se muestra como "Aula"
  descripcion: string;

  // Campos legacy: se mantienen opcionales para no romper otras vistas
  cantidad_estudiantes_afectados?: number;
  motivo_principal?: string;
  impacto_academico?: string;
  accion_correctiva?: string;
  fecha_regularizacion?: string;
  declaracion_jurada?: boolean;
  reprogramacion_fecha?: string;
  reprogramacion_hora?: string;
  reprogramacion_observacion?: string;

  archivos_adjuntos: ArchivoAdjunto[];
  estado:
    | "pendiente"
    | "en_revision"
    | "aprobada"
    | "observada"
    | "rechazada"
    | "subsanada";
  observaciones_admin?: string;
  fecha_registro: string;
  fecha_revision?: string;
}

export type TipoJustificacion = Justificacion["tipo_justificacion"];
export type EstadoJustificacion = Justificacion["estado"];

export function generarCodigoSeguimiento(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JBM-${year}-${random}`;
}

export function getEstadoLabel(estado: EstadoJustificacion): string {
  const labels: Record<EstadoJustificacion, string> = {
    pendiente: "Pendiente de revisión",
    en_revision: "En revisión",
    aprobada: "Aprobada",
    observada: "Observada",
    rechazada: "Rechazada",
    subsanada: "Subsanada",
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
    subsanada: "bg-teal-100 text-teal-800 border-teal-300",
  };

  return colors[estado];
}

export function getTipoLabel(tipo: TipoJustificacion): string {
  const labels: Record<TipoJustificacion, string> = {
    tardanza: "Tardanza",
    inasistencia: "Inasistencia",
  };

  return labels[tipo];
}

// Mock data compartida entre vistas
export const mockJustificaciones: Justificacion[] = [
  {
    id: "1",
    codigo_seguimiento: "JBM-2026-0001",
    nombre_completo: "María García López",
    dni_codigo_docente: "45678901",
    correo_institucional: "mgarcia@bausate.edu.pe",
    celular: "987654321",
    facultad_area: "Periodismo",
    curso_asignatura: "Periodismo Digital I",
    tipo_justificacion: "inasistencia",
    fecha_incidencia: "2026-04-12",
    hora_incidencia: "08:00",
    turno: "mañana",
    modalidad: "presencial",
    sede_aula_enlace: "Aula 301",
    descripcion:
      "No pude asistir a clases por una emergencia médica personal. Se adjunta el sustento correspondiente.",
    archivos_adjuntos: [
      {
        nombre: "certificado_medico.pdf",
        tipo: "application/pdf",
        tamano: 245000,
      },
    ],
    estado: "pendiente",
    fecha_registro: "2026-04-12T10:00:00",
  },
  {
    id: "2",
    codigo_seguimiento: "JBM-2026-0002",
    nombre_completo: "Carlos Rodríguez Mendoza",
    dni_codigo_docente: "32165498",
    correo_institucional: "crodriguez@bausate.edu.pe",
    celular: "912345678",
    facultad_area: "Comunicación Audiovisual",
    curso_asignatura: "Comunicación Social II",
    tipo_justificacion: "tardanza",
    fecha_incidencia: "2026-04-11",
    hora_incidencia: "14:00",
    turno: "tarde",
    modalidad: "presencial",
    sede_aula_enlace: "Aula 205",
    descripcion:
      "Llegué tarde debido a una congestión vehicular imprevista en el trayecto hacia la universidad.",
    archivos_adjuntos: [],
    estado: "en_revision",
    observaciones_admin:
      "Solicitud en proceso de revisión por parte de coordinación.",
    fecha_registro: "2026-04-11T09:30:00",
  },
  {
    id: "3",
    codigo_seguimiento: "JBM-2026-0003",
    nombre_completo: "Ana Martínez Soto",
    dni_codigo_docente: "78945612",
    correo_institucional: "amartinez@bausate.edu.pe",
    celular: "945678123",
    facultad_area: "Administración",
    curso_asignatura: "Gestión Empresarial",
    tipo_justificacion: "inasistencia",
    fecha_incidencia: "2026-04-10",
    hora_incidencia: "19:00",
    turno: "noche",
    modalidad: "virtual",
    sede_aula_enlace: "Aula virtual",
    descripcion:
      "No fue posible dictar la sesión programada por un problema de salud presentado horas antes del inicio de clase.",
    archivos_adjuntos: [
      {
        nombre: "sustento_salud.pdf",
        tipo: "application/pdf",
        tamano: 180000,
      },
    ],
    estado: "aprobada",
    observaciones_admin: "Justificación revisada y aprobada.",
    fecha_registro: "2026-04-10T14:00:00",
    fecha_revision: "2026-04-10T16:30:00",
  },
  {
    id: "4",
    codigo_seguimiento: "JBM-2026-0004",
    nombre_completo: "Pedro Sánchez Quispe",
    dni_codigo_docente: "65432198",
    correo_institucional: "psanchez@bausate.edu.pe",
    celular: "956789012",
    facultad_area: "Contabilidad",
    curso_asignatura: "Contabilidad Financiera",
    tipo_justificacion: "tardanza",
    fecha_incidencia: "2026-04-09",
    hora_incidencia: "16:00",
    turno: "tarde",
    modalidad: "presencial",
    sede_aula_enlace: "Aula 104",
    descripcion:
      "Se registró una tardanza por inconvenientes de traslado hacia la sede.",
    archivos_adjuntos: [],
    estado: "observada",
    observaciones_admin:
      "Se solicita ampliar la descripción de lo sucedido y adjuntar sustento si corresponde.",
    fecha_registro: "2026-04-09T16:00:00",
    fecha_revision: "2026-04-09T18:00:00",
  },
  {
    id: "5",
    codigo_seguimiento: "JBM-2026-0005",
    nombre_completo: "Laura Díaz Flores",
    dni_codigo_docente: "12345678",
    correo_institucional: "ldiaz@bausate.edu.pe",
    celular: "967890123",
    facultad_area: "Ingeniería Informática – Sistemas de Información",
    curso_asignatura: "Base de Datos I",
    tipo_justificacion: "inasistencia",
    fecha_incidencia: "2026-04-08",
    hora_incidencia: "11:00",
    turno: "mañana",
    modalidad: "presencial",
    sede_aula_enlace: "Aula 102",
    descripcion:
      "No se pudo asistir a la sesión por una situación familiar imprevista presentada el mismo día.",
    archivos_adjuntos: [],
    estado: "rechazada",
    observaciones_admin:
      "No se presentó sustento suficiente para validar la justificación.",
    fecha_registro: "2026-04-08T11:00:00",
    fecha_revision: "2026-04-08T15:00:00",
  },
  {
    id: "6",
    codigo_seguimiento: "JBM-2026-0006",
    nombre_completo: "María García López",
    dni_codigo_docente: "45678901",
    correo_institucional: "mgarcia@bausate.edu.pe",
    celular: "987654321",
    facultad_area: "Periodismo",
    curso_asignatura: "Periodismo Digital I",
    tipo_justificacion: "tardanza",
    fecha_incidencia: "2026-04-05",
    hora_incidencia: "08:00",
    turno: "mañana",
    modalidad: "presencial",
    sede_aula_enlace: "Aula 301",
    descripcion:
      "Llegué tarde por un inconveniente temporal con el transporte público.",
    archivos_adjuntos: [],
    estado: "subsanada",
    observaciones_admin:
      "Caso subsanado luego de la ampliación de información presentada por la docente.",
    fecha_registro: "2026-04-05T09:00:00",
    fecha_revision: "2026-04-06T10:00:00",
  },
];
