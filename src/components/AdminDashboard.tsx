import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  Eye,
  RefreshCw,
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  FileText,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  mockJustificaciones,
  type Justificacion,
  getEstadoColor,
  getEstadoLabel,
  getTipoLabel,
  type EstadoJustificacion,
} from "@/lib/justificacion";
import {
  listarTodasLasJustificaciones,
  actualizarRevisionJustificacion,
} from "@/lib/supabase-service";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

type FiltroEstado = "todos" | EstadoJustificacion;
type FiltroTipo = "todos" | "tardanza" | "inasistencia";

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
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

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [solicitudes, setSolicitudes] = useState<Justificacion[]>([]);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<FiltroTipo>("todos");
  const [selected, setSelected] = useState<Justificacion | null>(null);
  const [open, setOpen] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoJustificacion | "">("");
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadSolicitudes = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        setSolicitudes(mockJustificaciones);
        return;
      }

      const result = await listarTodasLasJustificaciones();

      if (result.error) {
        setError(result.error);
        setSolicitudes([]);
      } else {
        setSolicitudes(result.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información.");
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((item) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        !term ||
        item.nombre_completo.toLowerCase().includes(term) ||
        item.correo_institucional.toLowerCase().includes(term) ||
        item.codigo_seguimiento.toLowerCase().includes(term) ||
        item.curso_asignatura.toLowerCase().includes(term) ||
        item.facultad_area.toLowerCase().includes(term);

      const matchesEstado =
        estadoFiltro === "todos" || item.estado === estadoFiltro;

      const matchesTipo =
        tipoFiltro === "todos" || item.tipo_justificacion === tipoFiltro;

      return matchesSearch && matchesEstado && matchesTipo;
    });
  }, [solicitudes, search, estadoFiltro, tipoFiltro]);

  const stats = useMemo(() => {
    return {
      total: solicitudes.length,
      pendientes: solicitudes.filter((x) => x.estado === "pendiente").length,
      enRevision: solicitudes.filter((x) => x.estado === "en_revision").length,
      aprobadas: solicitudes.filter((x) => x.estado === "aprobada").length,
      observadas: solicitudes.filter((x) => x.estado === "observada").length,
      rechazadas: solicitudes.filter((x) => x.estado === "rechazada").length,
    };
  }, [solicitudes]);

  const openDetail = (item: Justificacion) => {
    setSelected(item);
    setNuevoEstado(item.estado);
    setObservaciones(item.observaciones_admin || "");
    setOpen(true);
  };

  const handleGuardarRevision = async () => {
    if (!selected || !nuevoEstado) return;

    setSaving(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const result = await actualizarRevisionJustificacion({
          id: selected.id,
          estado: nuevoEstado,
          observaciones_admin: observaciones,
        });

        if (result.error) {
          setError(result.error);
          setSaving(false);
          return;
        }

        if (result.data) {
          setSolicitudes((prev) =>
            prev.map((item) => (item.id === selected.id ? result.data! : item)),
          );
          setSelected(result.data);
        }
      } else {
        const updated: Justificacion = {
          ...selected,
          estado: nuevoEstado,
          observaciones_admin: observaciones,
          fecha_revision: new Date().toISOString(),
        };

        setSolicitudes((prev) =>
          prev.map((item) => (item.id === selected.id ? updated : item)),
        );
        setSelected(updated);
      }

      setOpen(false);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar la solicitud.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Panel Administrativo
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestión, revisión y seguimiento institucional de justificaciones
              docentes.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={loadSolicitudes}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total de solicitudes"
          value={stats.total}
          icon={ClipboardList}
        />
        <StatCard title="Pendientes" value={stats.pendientes} icon={Clock3} />
        <StatCard
          title="En revisión"
          value={stats.enRevision}
          icon={RefreshCw}
        />
        <StatCard
          title="Aprobadas"
          value={stats.aprobadas}
          icon={CheckCircle2}
        />
        <StatCard
          title="Observadas"
          value={stats.observadas}
          icon={AlertTriangle}
        />
        <StatCard
          title="Rechazadas"
          value={stats.rechazadas}
          icon={XCircle}
        />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por docente, correo, código, asignatura o escuela"
              className="pl-9"
            />
          </div>

          <Select
            value={estadoFiltro}
            onValueChange={(value) => setEstadoFiltro(value as FiltroEstado)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en_revision">En revisión</SelectItem>
              <SelectItem value="aprobada">Aprobada</SelectItem>
              <SelectItem value="observada">Observada</SelectItem>
              <SelectItem value="rechazada">Rechazada</SelectItem>
              <SelectItem value="subsanada">Subsanada</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={tipoFiltro}
            onValueChange={(value) => setTipoFiltro(value as FiltroTipo)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="tardanza">Tardanza</SelectItem>
              <SelectItem value="inasistencia">Inasistencia</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Solicitudes registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Cargando solicitudes...
            </div>
          ) : filteredSolicitudes.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No se encontraron solicitudes con los filtros actuales.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-3 py-3 font-semibold">Código</th>
                    <th className="px-3 py-3 font-semibold">Docente</th>
                    <th className="px-3 py-3 font-semibold">Correo</th>
                    <th className="px-3 py-3 font-semibold">Escuela</th>
                    <th className="px-3 py-3 font-semibold">Tipo</th>
                    <th className="px-3 py-3 font-semibold">Fecha</th>
                    <th className="px-3 py-3 font-semibold">Estado</th>
                    <th className="px-3 py-3 font-semibold">Evidencia</th>
                    <th className="px-3 py-3 font-semibold text-right">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSolicitudes.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-3 py-4 font-medium text-foreground">
                        {item.codigo_seguimiento}
                      </td>
                      <td className="px-3 py-4">{item.nombre_completo}</td>
                      <td className="px-3 py-4">{item.correo_institucional}</td>
                      <td className="px-3 py-4">{item.facultad_area}</td>
                      <td className="px-3 py-4">
                        {getTipoLabel(item.tipo_justificacion)}
                      </td>
                      <td className="px-3 py-4">{item.fecha_incidencia}</td>
                      <td className="px-3 py-4">
                        <Badge
                          variant="outline"
                          className={getEstadoColor(item.estado)}
                        >
                          {getEstadoLabel(item.estado)}
                        </Badge>
                      </td>
                      <td className="px-3 py-4">
                        {item.archivos_adjuntos.length > 0 ? (
                          <a
                            href={item.archivos_adjuntos[0].url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-primary hover:underline"
                          >
                            Ver archivo
                          </a>
                        ) : (
                          <span className="text-muted-foreground">
                            Sin archivo
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => openDetail(item)}
                        >
                          <Eye className="h-4 w-4" />
                          Ver detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  Detalle de solicitud
                </DialogTitle>
                <DialogDescription>
                  Revisión administrativa de la justificación registrada.
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
                    value={new Date(selected.fecha_registro).toLocaleString(
                      "es-PE",
                    )}
                  />
                  <DetailItem
                    label="Fecha de revisión"
                    value={
                      selected.fecha_revision
                        ? new Date(selected.fecha_revision).toLocaleString(
                            "es-PE",
                          )
                        : "Aún no revisado"
                    }
                  />
                </div>

                <Card className="border-border/60">
                  <CardContent className="p-5">
                    <h4 className="mb-2 text-base font-semibold text-foreground">
                      Descripción de lo sucedido
                    </h4>
                    <p className="text-sm leading-6 text-foreground/90">
                      {selected.descripcion}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h4 className="text-base font-semibold text-foreground">
                        Evidencia adjunta
                      </h4>
                    </div>

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
                        No se adjuntó evidencia.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardContent className="p-5">
                    <h4 className="mb-3 text-base font-semibold text-foreground">
                      Observaciones de coordinación
                    </h4>

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

                {selected.reprogramacion_fecha && (
                  <Card className="border-border/60">
                    <CardContent className="p-5">
                      <h4 className="mb-3 text-base font-semibold text-foreground">
                        Reprogramación registrada por el docente
                      </h4>

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

                <Card className="border-border/60">
                  <CardContent className="space-y-4 p-5">
                    <h4 className="text-base font-semibold text-foreground">
                      Revisión administrativa
                    </h4>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          Estado de la solicitud
                        </label>
                        <Select
                          value={nuevoEstado}
                          onValueChange={(value) =>
                            setNuevoEstado(value as EstadoJustificacion)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="en_revision">
                              En revisión
                            </SelectItem>
                            <SelectItem value="aprobada">Aprobada</SelectItem>
                            <SelectItem value="observada">Observada</SelectItem>
                            <SelectItem value="rechazada">Rechazada</SelectItem>
                            <SelectItem value="subsanada">Subsanada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            Fecha de revisión
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-foreground">
                          {selected.fecha_revision
                            ? new Date(selected.fecha_revision).toLocaleString(
                                "es-PE",
                              )
                            : "Aún no revisado"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Observaciones administrativas
                      </label>
                      <Textarea
                        rows={4}
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Ingrese observaciones de coordinación..."
                      />
                    </div>

                    <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleGuardarRevision} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Guardar cambios"
                        )}
                      </Button>
                    </div>
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
