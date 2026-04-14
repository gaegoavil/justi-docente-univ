import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Eye,
  FileText,
  CalendarDays,
  Mail,
  User,
  BookOpen,
  Building2,
  Clock3,
} from "lucide-react";
import {
  mockJustificaciones,
  type Justificacion,
  getEstadoColor,
  getEstadoLabel,
  getTipoLabel,
} from "@/lib/justificacion";
import { useRole } from "@/lib/roles";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

function mapRowToJustificacion(row: any): Justificacion {
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
    turno: row.turno,
    modalidad: row.modalidad,
    sede_aula_enlace: row.sede_aula_enlace || "",
    descripcion: row.descripcion,
    motivo_principal: row.descripcion,
    impacto_academico: "",
    accion_correctiva: "",
    cantidad_estudiantes_afectados: undefined,
    fecha_regularizacion: undefined,
    declaracion_jurada: false,
    archivos_adjuntos: row.archivo_url
      ? [
          {
            nombre: row.archivo_path?.split("/").pop() || "evidencia",
            tipo: row.archivo_tipo || "archivo",
            tamano: 0,
            url: row.archivo_url,
          },
        ]
      : [],
    estado: row.estado,
    observaciones_admin: row.observaciones_admin || "",
    fecha_registro: row.fecha_registro,
    fecha_revision: row.fecha_revision || undefined,
  };
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export function DocenteHistorial() {
  const { email } = useRole();
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<Justificacion[]>([]);
  const [selected, setSelected] = useState<Justificacion | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSolicitudes = async () => {
    setLoading(true);
    setError(null);

    try {
      const correo = (email || "").toLowerCase().trim();

      if (!correo) {
        setSolicitudes([]);
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        const filtered = mockJustificaciones
          .filter(
            (item) => item.correo_institucional.toLowerCase().trim() === correo,
          )
          .sort((a, b) => b.fecha_registro.localeCompare(a.fecha_registro));

        setSolicitudes(filtered);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("justificaciones_docentes")
        .select("*")
        .eq("correo_docente", correo)
        .order("fecha_registro", { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map(mapRowToJustificacion);
      setSolicitudes(mapped);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar tus solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolicitudes();
  }, [email]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Mis solicitudes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Aquí puede revisar el estado de sus justificaciones registradas.
            </p>
          </div>

          <Button variant="outline" onClick={loadSolicitudes} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Historial de justificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Cargando solicitudes...
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-base font-medium text-foreground">
                No se encontraron solicitudes registradas.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cuando registre una justificación, aparecerá listada en esta
                sección.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {solicitudes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-background p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getEstadoColor(item.estado)}
                        >
                          {getEstadoLabel(item.estado)}
                        </Badge>
                        <Badge variant="secondary">
                          {getTipoLabel(item.tipo_justificacion)}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-lg font-semibold text-foreground">
                          {item.codigo_seguimiento}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Registrado el{" "}
                          {new Date(item.fecha_registro).toLocaleString("es-PE")}
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm text-foreground/90 md:grid-cols-2">
                        <p>
                          <span className="font-medium">Curso:</span>{" "}
                          {item.curso_asignatura}
                        </p>
                        <p>
                          <span className="font-medium">Escuela:</span>{" "}
                          {item.facultad_area}
                        </p>
                        <p>
                          <span className="font-medium">Fecha de incidencia:</span>{" "}
                          {item.fecha_incidencia}
                        </p>
                        <p>
                          <span className="font-medium">Hora:</span>{" "}
                          {item.hora_incidencia}
                        </p>
                      </div>

                      {item.observaciones_admin ? (
                        <div className="rounded-lg bg-muted/40 p-3 text-sm">
                          <span className="font-medium text-foreground">
                            Observación administrativa:
                          </span>{" "}
                          <span className="text-foreground/80">
                            {item.observaciones_admin}
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                          Aún no hay observaciones administrativas registradas.
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setSelected(item);
                          setOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Ver detalle
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Detalle de mi solicitud
                </DialogTitle>
                <DialogDescription>
                  Información registrada y estado actual de la justificación.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className={getEstadoColor(selected.estado)}
                  >
                    {getEstadoLabel(selected.estado)}
                  </Badge>
                  <Badge variant="secondary">
                    {getTipoLabel(selected.tipo_justificacion)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Código: {selected.codigo_seguimiento}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <DetailItem label="Docente" value={selected.nombre_completo} />
                  <DetailItem
                    label="Correo institucional"
                    value={selected.correo_institucional}
                  />
                  <DetailItem
                    label="DNI / Código docente"
                    value={selected.dni_codigo_docente}
                  />
                  <DetailItem label="Celular" value={selected.celular} />
                  <DetailItem label="Escuela" value={selected.facultad_area} />
                  <DetailItem
                    label="Curso / Asignatura"
                    value={selected.curso_asignatura}
                  />
                  <DetailItem
                    label="Fecha de la incidencia"
                    value={selected.fecha_incidencia}
                  />
                  <DetailItem
                    label="Hora de la incidencia"
                    value={selected.hora_incidencia}
                  />
                  <DetailItem label="Turno" value={selected.turno} />
                  <DetailItem label="Modalidad" value={selected.modalidad} />
                  <DetailItem
                    label="Aula"
                    value={selected.sede_aula_enlace || "—"}
                  />
                  <DetailItem
                    label="Fecha de registro"
                    value={new Date(selected.fecha_registro).toLocaleString("es-PE")}
                  />
                </div>

                <Card className="border-border/60">
                  <CardContent className="p-5">
                    <h3 className="mb-2 text-base font-semibold text-foreground">
                      Descripción de lo sucedido
                    </h3>
                    <p className="text-sm leading-6 text-foreground/90">
                      {selected.descripcion}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardContent className="p-5">
                    <h3 className="mb-3 text-base font-semibold text-foreground">
                      Evidencia adjunta
                    </h3>

                    {selected.archivos_adjuntos.length > 0 ? (
                      <a
                        href={selected.archivos_adjuntos[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Abrir evidencia
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No se adjuntó evidencia en esta solicitud.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardContent className="p-5">
                    <h3 className="mb-3 text-base font-semibold text-foreground">
                      Observaciones de coordinación
                    </h3>

                    {selected.observaciones_admin ? (
                      <p className="text-sm leading-6 text-foreground/90">
                        {selected.observaciones_admin}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Aún no se han registrado observaciones para esta
                        solicitud.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
