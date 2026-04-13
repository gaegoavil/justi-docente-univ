import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getEstadoLabel,
  getEstadoColor,
  getTipoLabel,
  type Justificacion,
  type EstadoJustificacion,
} from "@/lib/justificacion";
import {
  obtenerTodasJustificaciones,
  actualizarJustificacion,
  rowToJustificacion,
} from "@/lib/supabase-service";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import {
  Search,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  Download,
  ArrowLeft,
  RefreshCw,
  Save,
  Loader2,
} from "lucide-react";

const estadoIcons: Record<string, React.ReactNode> = {
  pendiente: <Clock className="h-4 w-4" />,
  en_revision: <Eye className="h-4 w-4" />,
  aprobada: <CheckCircle className="h-4 w-4" />,
  observada: <AlertTriangle className="h-4 w-4" />,
  rechazada: <XCircle className="h-4 w-4" />,
  subsanada: <RefreshCw className="h-4 w-4" />,
};

export function AdminDashboard() {
  const [data, setData] = useState<Justificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<string>("");
  const [nuevaObservacion, setNuevaObservacion] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    const rows = await obtenerTodasJustificaciones();
    if (isSupabaseConfigured()) {
      setData(rows.map(rowToJustificacion));
    } else {
      setData(rows as unknown as Justificacion[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const stats = {
    total: data.length,
    pendiente: data.filter((j) => j.estado === "pendiente").length,
    en_revision: data.filter((j) => j.estado === "en_revision").length,
    aprobada: data.filter((j) => j.estado === "aprobada").length,
    observada: data.filter((j) => j.estado === "observada").length,
    rechazada: data.filter((j) => j.estado === "rechazada").length,
    subsanada: data.filter((j) => j.estado === "subsanada").length,
  };

  const filtered = data.filter((j) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      j.nombre_completo.toLowerCase().includes(s) ||
      j.codigo_seguimiento.toLowerCase().includes(s) ||
      j.curso_asignatura.toLowerCase().includes(s) ||
      j.correo_institucional.toLowerCase().includes(s) ||
      j.dni_codigo_docente.toLowerCase().includes(s);
    const matchEstado = filterEstado === "todos" || j.estado === filterEstado;
    const matchTipo = filterTipo === "todos" || j.tipo_justificacion === filterTipo;
    return matchSearch && matchEstado && matchTipo;
  });

  const selected = selectedId ? data.find((j) => j.id === selectedId) : null;

  const handleSaveChanges = async () => {
    if (!selected) return;

    if (isSupabaseConfigured()) {
      setSaving(true);
      const result = await actualizarJustificacion(selected.id, {
        estado: (nuevoEstado || undefined) as EstadoJustificacion | undefined,
        observaciones_admin: nuevaObservacion || undefined,
      });
      setSaving(false);

      if (result.error) {
        alert(`Error al guardar: ${result.error}`);
        return;
      }
      await cargarDatos();
    } else {
      // Fallback local
      setData((prev) =>
        prev.map((j) =>
          j.id === selected.id
            ? {
                ...j,
                estado: (nuevoEstado || j.estado) as EstadoJustificacion,
                observaciones_admin: nuevaObservacion || j.observaciones_admin,
                fecha_revision: new Date().toISOString(),
              }
            : j
        )
      );
    }

    setSelectedId(null);
    setNuevoEstado("");
    setNuevaObservacion("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando solicitudes...</span>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => { setSelectedId(null); setNuevoEstado(""); setNuevaObservacion(""); }}
          className="flex items-center gap-2 text-primary font-semibold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </button>

        <div className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Detalle de solicitud</h3>
              <p className="text-sm text-muted-foreground font-mono">{selected.codigo_seguimiento}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border ${getEstadoColor(selected.estado)}`}>
              {estadoIcons[selected.estado]}
              {getEstadoLabel(selected.estado)}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm mb-6">
            <Detail label="Docente" value={selected.nombre_completo} />
            <Detail label="DNI / Código" value={selected.dni_codigo_docente} />
            <Detail label="Correo" value={selected.correo_institucional} />
            <Detail label="Celular" value={selected.celular} />
            <Detail label="Facultad" value={selected.facultad_area} />
            <Detail label="Curso" value={selected.curso_asignatura} />
            <Detail label="Tipo" value={getTipoLabel(selected.tipo_justificacion)} />
            <Detail label="Fecha incidencia" value={new Date(selected.fecha_incidencia).toLocaleDateString("es-PE")} />
            <Detail label="Hora" value={selected.hora_incidencia} />
            <Detail label="Turno" value={selected.turno} capitalize />
            <Detail label="Modalidad" value={selected.modalidad} capitalize />
            <Detail label="Sede/Aula" value={selected.sede_aula_enlace || "—"} />
            {selected.cantidad_estudiantes_afectados && (
              <Detail label="Estudiantes afectados" value={String(selected.cantidad_estudiantes_afectados)} />
            )}
            <Detail label="Fecha registro" value={new Date(selected.fecha_registro).toLocaleDateString("es-PE")} />
            {selected.fecha_revision && (
              <Detail label="Fecha revisión" value={new Date(selected.fecha_revision).toLocaleDateString("es-PE")} />
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-surface rounded-lg p-4 border">
              <h4 className="font-semibold text-foreground mb-1">Descripción</h4>
              <p className="text-sm text-foreground/80 font-[family-name:var(--font-body)]">{selected.descripcion}</p>
            </div>
            <div className="bg-surface rounded-lg p-4 border">
              <h4 className="font-semibold text-foreground mb-1">Motivo principal</h4>
              <p className="text-sm text-foreground/80 font-[family-name:var(--font-body)]">{selected.motivo_principal}</p>
            </div>
            {selected.impacto_academico && (
              <div className="bg-surface rounded-lg p-4 border">
                <h4 className="font-semibold text-foreground mb-1">Impacto académico</h4>
                <p className="text-sm text-foreground/80 font-[family-name:var(--font-body)]">{selected.impacto_academico}</p>
              </div>
            )}
            {selected.accion_correctiva && (
              <div className="bg-surface rounded-lg p-4 border">
                <h4 className="font-semibold text-foreground mb-1">Acción correctiva</h4>
                <p className="text-sm text-foreground/80 font-[family-name:var(--font-body)]">{selected.accion_correctiva}</p>
              </div>
            )}
          </div>

          {selected.archivos_adjuntos.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-foreground mb-2">Archivos adjuntos</h4>
              <div className="space-y-2">
                {selected.archivos_adjuntos.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 bg-surface rounded-lg px-4 py-2 border text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">{a.nombre}</span>
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline ml-auto">
                        Ver archivo
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.observaciones_admin && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-foreground mb-1">Observaciones anteriores</h4>
              <p className="text-sm text-foreground/80 font-[family-name:var(--font-body)]">{selected.observaciones_admin}</p>
            </div>
          )}

          {/* Admin actions */}
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-bold text-foreground text-lg">Acciones administrativas</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="font-semibold">Cambiar estado</Label>
                <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar nuevo estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_revision">En revisión</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="observada">Observada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                    <SelectItem value="subsanada">Subsanada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-semibold">Fecha de revisión</Label>
                <Input type="date" className="mt-1" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
            </div>
            <div>
              <Label className="font-semibold">Agregar observación</Label>
              <Textarea
                rows={3}
                className="mt-1"
                value={nuevaObservacion}
                onChange={(e) => setNuevaObservacion(e.target.value)}
                placeholder="Escriba sus observaciones sobre esta solicitud..."
              />
            </div>
            <Button onClick={handleSaveChanges} size="lg" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel Administrativo</h1>
          <p className="text-muted-foreground font-[family-name:var(--font-body)]">
            Gestión y revisión de justificaciones docentes
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={cargarDatos}>
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total", value: stats.total, icon: BarChart3, color: "bg-primary/10 text-primary" },
          { label: "Pendientes", value: stats.pendiente, icon: Clock, color: "bg-yellow-100 text-yellow-700" },
          { label: "En revisión", value: stats.en_revision, icon: Eye, color: "bg-blue-100 text-blue-700" },
          { label: "Aprobadas", value: stats.aprobada, icon: CheckCircle, color: "bg-green-100 text-green-700" },
          { label: "Observadas", value: stats.observada, icon: AlertTriangle, color: "bg-orange-100 text-orange-700" },
          { label: "Rechazadas", value: stats.rechazada, icon: XCircle, color: "bg-red-100 text-red-700" },
          { label: "Subsanadas", value: stats.subsanada, icon: RefreshCw, color: "bg-teal-100 text-teal-700" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-3 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border p-4 shadow-sm flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código, correo, DNI o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-44">
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
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
        </div>
        <div className="w-44">
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="tardanza">Tardanza</SelectItem>
              <SelectItem value="inasistencia">Inasistencia</SelectItem>
              <SelectItem value="incumplimiento">Incumplimiento</SelectItem>
              <SelectItem value="permiso">Permiso</SelectItem>
              <SelectItem value="reprogramacion">Reprogramación</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Código</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Docente</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">Curso</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Fecha</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j) => (
                <tr key={j.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary font-bold">{j.codigo_seguimiento}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{j.nombre_completo}</div>
                    <div className="text-xs text-muted-foreground">{j.correo_institucional}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell capitalize">{getTipoLabel(j.tipo_justificacion)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{j.curso_asignatura}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${getEstadoColor(j.estado)}`}>
                      {estadoIcons[j.estado]}
                      <span className="hidden sm:inline">{getEstadoLabel(j.estado)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {new Date(j.fecha_registro).toLocaleDateString("es-PE")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedId(j.id)}>
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No se encontraron registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isSupabaseConfigured() && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground font-[family-name:var(--font-body)]">
          <strong className="text-foreground">Nota:</strong> Supabase no está configurado. Se muestran datos de demostración. Configure VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para datos reales.
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, capitalize: cap }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="bg-surface rounded-lg p-3 border">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium text-foreground ${cap ? "capitalize" : ""}`}>{value}</div>
    </div>
  );
}
