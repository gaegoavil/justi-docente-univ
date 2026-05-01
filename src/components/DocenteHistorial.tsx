import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Clock3,
  CheckCircle2,
} from "lucide-react";
import {
  mockJustificaciones,
  type Justificacion,
  getEstadoColor,
  getEstadoLabel,
  getTipoLabel,
} from "@/lib/justificacion";
import { useRole } from "@/lib/roles";
import {
  isSupabaseConfigured,
} from "@/integrations/supabase/client";
import {
  listarJustificacionesPorCorreo,
  guardarReprogramacion,
} from "@/lib/supabase-service";

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

  const [openReprogramacion, setOpenReprogramacion] = useState(false);
  const [reprogFecha, setReprogFecha] = useState("");
  const [reprogHora, setReprogHora] = useState("");
  const [reprogObs, setReprogObs] = useState("");
  const [savingReprog, setSavingReprog] = useState(false);

  const loadSolicitudes = async () => {
    setLoading(true);
    setError(null);

    try {
      const correo = (email || "").trim().toLowerCase();

      if (!correo) {
        setSolicitudes([]);
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        const filtered = mockJustificaciones
          .filter(
            (item) => item.correo_institucional.trim().toLowerCase() === correo,
          )
          .sort((a, b) => b.fecha_registro.localeCompare(a.fecha_registro));

        setSolicitudes(filtered);
        setLoading(false);
        return;
      }

      const result = await listarJustificacionesPorCorreo(correo);

      if (result.error) {
        setError(result.error);
        setSolicitudes([]);
      } else {
        setSolicitudes(result.data || []);
      }
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

  const handleGuardarReprogramacion = async () => {
    if (!selected || !reprogFecha || !reprogHora) return;

    setSavingReprog(true);

    try {
      const result = await guardarReprogramacion({
        id: selected.id,
        reprogramacion_fecha: reprogFecha,
        reprogramacion_hora: reprogHora,
        reprogramacion_observacion: reprogObs,
      });

      if (result.error) {
        setError(result.error);
        setSavingReprog(false);
        return;
      }

      if (result.data) {
        setSolicitudes((prev) =>
          prev.map((item) => (item.id === selected.id ? result.data! : item)),
        );
        setSelected(result.data);
      }

      setOpenReprogramacion(false);
      setReprogFecha("");
      setReprogHora("");
      setReprogObs("");
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la reprogramación.");
    } finally {
      setSavingReprog(false);
    }
  };

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
                Cuando registre una justificación, aparecerá listada en esta sección.
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
                          <span className="font-medium">Asignatura:</span>{" "}
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

                      {item.estado === "aprobada" && !item.reprogramacion_fecha && (
                        <div className="pt-1">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelected(item);
                              setOpenReprogramacion(true);
                            }}
                          >
                            Registrar reprogramación
                          </Button>
                        </div>
                      )}

                      {item.reprogramacion_fecha && (
                        <div className="rounded-lg border bg-primary/5 p-3 text-sm">
                          <p className="font-medium text-foreground">
                            Reprogramación registrada
                          </p>
                          <p className="mt-1 text-foreground/80">
                            Fecha: {item.reprogramacion_fecha}
                          </p>
                          <p className="text-foreground/80">
                            Hora: {item.reprogramacion_hora || "—"}
                          </p>
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
                  <DetailItem label="DNI" value={selected.dni_codigo_docente} />
                  <DetailItem label="Celular" value={selected.celular} />
                  <DetailItem label="Escuela" value={selected.facultad_area} />
                  <DetailItem
                    label="Asignatura"
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
                  <DetailItem label="Modalidad" value={selected.modalidad} />
                  <DetailItem
                    label="Fecha de registro"
                    value={new Date(selected.fecha_registro).toLocaleString("es-PE")}
                  />
                  <DetailItem
                    label="Fecha de revisión"
                    value={
                      selected.fecha_revision
                        ? new Date(selected.fecha_revision).toLocaleString("es-PE")
                        : "Aún no revisado"
                    }
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
                        Aún no se han registrado observaciones para esta solicitud.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {selected.reprogramacion_fecha && (
                  <Card className="border-border/60">
                    <CardContent className="p-5">
                      <h3 className="mb-3 text-base font-semibold text-foreground">
                        Reprogramación registrada
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <DetailItem
                          label="Fecha de reprogramación"
                          value={selected.reprogramacion_fecha}
                        />
                        <DetailItem
                          label="Hora de reprogramación"
                          value={selected.reprogramacion_hora}
                        />
                      </div>

                      {selected.reprogramacion_observacion && (
                        <div className="mt-4">
                          <p className="mb-1 text-sm font-medium text-foreground">
                            Observación
                          </p>
                          <p className="text-sm text-foreground/80">
                            {selected.reprogramacion_observacion}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selected.estado === "aprobada" && !selected.reprogramacion_fecha && (
                  <div className="pt-2">
                    <Button onClick={() => setOpenReprogramacion(true)}>
                      Registrar reprogramación
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={openReprogramacion}
        onOpenChange={setOpenReprogramacion}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar reprogramación</DialogTitle>
            <DialogDescription>
              Complete los datos básicos para reprogramar la clase justificada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Fecha de reprogramación
              </label>
              <Input
                type="date"
                value={reprogFecha}
                onChange={(e) => setReprogFecha(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Hora de reprogramación
              </label>
              <Input
                type="time"
                value={reprogHora}
                onChange={(e) => setReprogHora(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Observación
              </label>
              <Textarea
                rows={3}
                value={reprogObs}
                onChange={(e) => setReprogObs(e.target.value)}
                placeholder="Ej: Clase reprogramada para recuperar la sesión pendiente."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setOpenReprogramacion(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarReprogramacion}
                disabled={savingReprog}
              >
                {savingReprog ? "Guardando..." : "Guardar reprogramación"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
