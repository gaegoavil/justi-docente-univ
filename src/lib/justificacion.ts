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
  estado: "pendiente" | "en_revision" | "aprobada" | "observada" | "rechazada" | "subsanada";
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
    incumplimiento: "Incumplimiento",
    permiso: "Permiso",
    reprogramacion: "Reprogramación",
    otro: "Otro",
  };
  return labels[tipo];
}

// Mock data shared between views
export const mockJustificaciones: Justificacion[] = [
  {
    id: "1",
    codigo_seguimiento: "JD-A1B2C3-XY01",
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
    descripcion: "No pude asistir a clases por emergencia médica personal. Adjunto certificado médico del Hospital Rebagliati.",
    motivo_principal: "Emergencia médica",
    impacto_academico: "35 estudiantes no recibieron clase programada",
    accion_correctiva: "Clase de recuperación programada para el 15 de abril",
    archivos_adjuntos: [{ nombre: "certificado_medico.pdf", tipo: "application/pdf", tamano: 245000 }],
    declaracion_jurada: true,
    estado: "pendiente",
    fecha_registro: "2026-04-12T10:00:00",
    cantidad_estudiantes_afectados: 35,
  },
  {
    id: "2",
    codigo_seguimiento: "JD-D4E5F6-ZZ02",
    nombre_completo: "Carlos Rodríguez Mendoza",
    dni_codigo_docente: "32165498",
    correo_institucional: "crodriguez@bausate.edu.pe",
    celular: "912345678",
    facultad_area: "Comunicaciones",
    curso_asignatura: "Comunicación Social II",
    tipo_justificacion: "tardanza",
    fecha_incidencia: "2026-04-11",
    hora_incidencia: "14:00",
    turno: "tarde",
    modalidad: "presencial",
    sede_aula_enlace: "Aula 205",
    descripcion: "Llegué 25 minutos tarde debido a un accidente vehicular en la Av. Brasil que generó un embotellamiento severo.",
    motivo_principal: "Tráfico vehicular por accidente",
    impacto_academico: "Se redujo la sesión de clase en 25 minutos",
    accion_correctiva: "Se extenderá la siguiente sesión para recuperar contenido",
    archivos_adjuntos: [],
    declaracion_jurada: true,
    estado: "en_revision",
    observaciones_admin: "Se está verificando la información proporcionada sobre el accidente vehicular.",
    fecha_registro: "2026-04-11T09:30:00",
  },
  {
    id: "3",
    codigo_seguimiento: "JD-G7H8I9-WW03",
    nombre_completo: "Ana Martínez Soto",
    dni_codigo_docente: "78945612",
    correo_institucional: "amartinez@bausate.edu.pe",
    celular: "945678123",
    facultad_area: "Periodismo",
    curso_asignatura: "Ética Periodística",
    tipo_justificacion: "permiso",
    fecha_incidencia: "2026-04-10",
    hora_incidencia: "10:00",
    turno: "mañana",
    modalidad: "virtual",
    sede_aula_enlace: "Zoom - Sala 123",
    descripcion: "Solicité permiso para asistir a un congreso internacional de ética en medios en la ciudad de Buenos Aires.",
    motivo_principal: "Congreso internacional",
    impacto_academico: "Se dejó material asincrónico para los estudiantes",
    accion_correctiva: "Material compartido previamente y sesión de Q&A posterior",
    archivos_adjuntos: [{ nombre: "invitacion_congreso.pdf", tipo: "application/pdf", tamano: 180000 }],
    declaracion_jurada: true,
    estado: "aprobada",
    observaciones_admin: "Permiso aprobado. Se verificó la invitación al congreso internacional.",
    fecha_registro: "2026-04-10T14:00:00",
    fecha_revision: "2026-04-10T16:30:00",
  },
  {
    id: "4",
    codigo_seguimiento: "JD-J0K1L2-VV04",
    nombre_completo: "Pedro Sánchez Quispe",
    dni_codigo_docente: "65432198",
    correo_institucional: "psanchez@bausate.edu.pe",
    celular: "956789012",
    facultad_area: "Periodismo",
    curso_asignatura: "Fotografía Periodística",
    tipo_justificacion: "reprogramacion",
    fecha_incidencia: "2026-04-09",
    hora_incidencia: "16:00",
    turno: "tarde",
    modalidad: "semipresencial",
    sede_aula_enlace: "Laboratorio de Fotografía",
    descripcion: "Solicito reprogramación de evaluación práctica debido a fallas en el equipo fotográfico del laboratorio.",
    motivo_principal: "Falla de equipos del laboratorio",
    impacto_academico: "Evaluación práctica no pudo realizarse",
    accion_correctiva: "Reprogramar para cuando los equipos estén reparados",
    archivos_adjuntos: [{ nombre: "reporte_falla_equipos.pdf", tipo: "application/pdf", tamano: 320000 }],
    declaracion_jurada: true,
    estado: "observada",
    observaciones_admin: "Se requiere informe técnico del área de soporte sobre el estado de los equipos.",
    fecha_registro: "2026-04-09T16:00:00",
    fecha_revision: "2026-04-09T18:00:00",
  },
  {
    id: "5",
    codigo_seguimiento: "JD-M3N4O5-UU05",
    nombre_completo: "Laura Díaz Flores",
    dni_codigo_docente: "12345678",
    correo_institucional: "ldiaz@bausate.edu.pe",
    celular: "967890123",
    facultad_area: "Periodismo",
    curso_asignatura: "Redacción Periodística",
    tipo_justificacion: "incumplimiento",
    fecha_incidencia: "2026-04-08",
    hora_incidencia: "11:00",
    turno: "mañana",
    modalidad: "presencial",
    sede_aula_enlace: "Aula 102",
    descripcion: "No se entregaron las notas del primer parcial dentro del plazo establecido por la coordinación.",
    motivo_principal: "Carga administrativa excesiva",
    impacto_academico: "Retraso en publicación de notas del primer parcial",
    accion_correctiva: "Entrega de notas al día siguiente",
    archivos_adjuntos: [],
    declaracion_jurada: true,
    estado: "rechazada",
    observaciones_admin: "No se presentó justificación suficiente para el incumplimiento del plazo.",
    fecha_registro: "2026-04-08T11:00:00",
    fecha_revision: "2026-04-08T15:00:00",
  },
  {
    id: "6",
    codigo_seguimiento: "JD-P6Q7R8-TT06",
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
    descripcion: "Llegué 15 minutos tarde por problemas con el transporte público.",
    motivo_principal: "Problemas de transporte",
    impacto_academico: "Inicio de clase retrasado 15 minutos",
    accion_correctiva: "Se compensó extendiendo la sesión",
    archivos_adjuntos: [],
    declaracion_jurada: true,
    estado: "subsanada",
    observaciones_admin: "Subsanada. El docente presentó la documentación adicional solicitada.",
    fecha_registro: "2026-04-05T09:00:00",
    fecha_revision: "2026-04-06T10:00:00",
  },
];
