export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RolUsuario = "docente" | "coordinador";

export type TipoJustificacion = "tardanza" | "inasistencia";

export type EstadoJustificacion =
  | "pendiente"
  | "en_revision"
  | "aprobada"
  | "observada"
  | "rechazada"
  | "subsanada";

export interface Database {
  public: {
    Tables: {
      perfiles_usuarios: {
        Row: {
          id: string;
          correo: string;
          nombre_completo: string | null;
          rol: RolUsuario;
          creado_en: string;
        };
        Insert: {
          id?: string;
          correo: string;
          nombre_completo?: string | null;
          rol: RolUsuario;
          creado_en?: string;
        };
        Update: {
          id?: string;
          correo?: string;
          nombre_completo?: string | null;
          rol?: RolUsuario;
          creado_en?: string;
        };
        Relationships: [];
      };

      justificaciones_docentes: {
        Row: {
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
        };
        Insert: {
          id?: string;
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
          sede_aula_enlace?: string | null;
          cantidad_estudiantes_afectados?: number | null;
          descripcion: string;
          motivo_principal: string;
          impacto_academico?: string | null;
          accion_correctiva?: string | null;
          fecha_regularizacion?: string | null;
          estado?: EstadoJustificacion;
          observaciones_admin?: string | null;
          archivo_url?: string | null;
          archivo_path?: string | null;
          archivo_tipo?: string | null;
          fecha_registro?: string;
          fecha_revision?: string | null;
        };
        Update: {
          id?: string;
          codigo_seguimiento?: string;
          correo_docente?: string;
          nombre_completo?: string;
          dni_codigo_docente?: string;
          celular?: string;
          facultad_area?: string;
          curso_asignatura?: string;
          tipo_justificacion?: TipoJustificacion;
          fecha_incidencia?: string;
          hora_incidencia?: string;
          turno?: string;
          modalidad?: string;
          sede_aula_enlace?: string | null;
          cantidad_estudiantes_afectados?: number | null;
          descripcion?: string;
          motivo_principal?: string;
          impacto_academico?: string | null;
          accion_correctiva?: string | null;
          fecha_regularizacion?: string | null;
          estado?: EstadoJustificacion;
          observaciones_admin?: string | null;
          archivo_url?: string | null;
          archivo_path?: string | null;
          archivo_tipo?: string | null;
          fecha_registro?: string;
          fecha_revision?: string | null;
        };
        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type PerfilUsuarioRow =
  Database["public"]["Tables"]["perfiles_usuarios"]["Row"];
export type PerfilUsuarioInsert =
  Database["public"]["Tables"]["perfiles_usuarios"]["Insert"];
export type PerfilUsuarioUpdate =
  Database["public"]["Tables"]["perfiles_usuarios"]["Update"];

export type JustificacionRow =
  Database["public"]["Tables"]["justificaciones_docentes"]["Row"];
export type JustificacionInsert =
  Database["public"]["Tables"]["justificaciones_docentes"]["Insert"];
export type JustificacionUpdate =
  Database["public"]["Tables"]["justificaciones_docentes"]["Update"];
