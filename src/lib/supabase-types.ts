export type EstadoJustificacion =
  | "pendiente"
  | "en_revision"
  | "aprobada"
  | "observada"
  | "rechazada"
  | "subsanada";

export type TipoJustificacion =
  | "tardanza"
  | "inasistencia"
  | "incumplimiento"
  | "permiso"
  | "reprogramacion"
  | "otro";

export interface JustificacionRow {
  id: string;
  codigo_seguimiento: string;
  correo_docente: string;
  nombre_completo: string;
  dni_codigo_docente: string;
  celular: string;
  facultad_area: string;
  curso_asignatura: string;
  tipo_justificacion: TipoJustificacion;
  fecha_incidencia: string;
  hora_incidencia: string;
  turno: string;
  modalidad: string;
  sede_aula_enlace: string | null;
  cantidad_estudiantes_afectados: number | null;
  descripcion: string;
  motivo_principal: string;
  impacto_academico: string | null;
  accion_correctiva: string | null;
  fecha_regularizacion: string | null;
  estado: EstadoJustificacion;
  observaciones_admin: string | null;
  archivo_url: string | null;
  archivo_path: string | null;
  archivo_tipo: string | null;
  fecha_registro: string;
  fecha_revision: string | null;
}

export interface JustificacionInsert
  extends Omit<JustificacionRow, "id" | "fecha_registro" | "fecha_revision" | "estado"> {
  estado?: EstadoJustificacion;
}

export interface PerfilUsuarioRow {
  id: string;
  correo: string;
  nombre_completo: string | null;
  rol: "docente" | "coordinador";
  creado_en: string;
}

export interface Database {
  public: {
    Tables: {
      justificaciones_docentes: {
        Row: JustificacionRow;
        Insert: JustificacionInsert;
        Update: Partial<JustificacionRow>;
      };
      perfiles_usuarios: {
        Row: PerfilUsuarioRow;
        Insert: Omit<PerfilUsuarioRow, "id" | "creado_en">;
        Update: Partial<PerfilUsuarioRow>;
      };
    };
  };
}
