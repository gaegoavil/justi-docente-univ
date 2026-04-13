import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEstadoLabel, getEstadoColor, getTipoLabel, type Justificacion, type EstadoJustificacion } from "@/lib/justificacion";
import { Search, FileText, Eye, Clock, Users, CheckCircle, AlertTriangle, XCircle, BarChart3, Download } from "lucide-react";

const mockJustificaciones: Partial<Justificacion>[] = [
  { id: "1", codigo_seguimiento: "JD-A1B2C3-XY01", nombre_completo: "María García López", tipo_justificacion: "inasistencia", estado: "pendiente", fecha_registro: "2026-04-12T10:00:00", curso_asignatura: "Periodismo Digital I", facultad_area: "Periodismo" },
  { id: "2", codigo_seguimiento: "JD-D4E5F6-ZZ02", nombre_completo: "Carlos Rodríguez M.", tipo_justificacion: "tardanza", estado: "en_revision", fecha_registro: "2026-04-11T09:30:00", curso_asignatura: "Comunicación Social II", facultad_area: "Comunicaciones" },
  { id: "3", codigo_seguimiento: "JD-G7H8I9-WW03", nombre_completo: "Ana Martínez Soto", tipo_justificacion: "permiso", estado: "aprobada", fecha_registro: "2026-04-10T14:00:00", curso_asignatura: "Ética Periodística", facultad_area: "Periodismo" },
  { id: "4", codigo_seguimiento: "JD-J0K1L2-VV04", nombre_completo: "Pedro Sánchez Q.", tipo_justificacion: "reprogramacion", estado: "observada", fecha_registro: "2026-04-09T16:00:00", curso_asignatura: "Fotografía Periodística", facultad_area: "Periodismo" },
  { id: "5", codigo_seguimiento: "JD-M3N4O5-UU05", nombre_completo: "Laura Díaz Flores", tipo_justificacion: "incumplimiento", estado: "rechazada", fecha_registro: "2026-04-08T11:00:00", curso_asignatura: "Redacción Periodística", facultad_area: "Periodismo" },
];

const estadoIcons: Record<string, React.ReactNode> = {
  pendiente: <Clock className="h-5 w-5" />,
  en_revision: <Eye className="h-5 w-5" />,
  aprobada: <CheckCircle className="h-5 w-5" />,
  observada: <AlertTriangle className="h-5 w-5" />,
  rechazada: <XCircle className="h-5 w-5" />,
};

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stats = {
    total: mockJustificaciones.length,
    pendiente: mockJustificaciones.filter((j) => j.estado === "pendiente").length,
    en_revision: mockJustificaciones.filter((j) => j.estado === "en_revision").length,
    aprobada: mockJustificaciones.filter((j) => j.estado === "aprobada").length,
    observada: mockJustificaciones.filter((j) => j.estado === "observada").length,
    rechazada: mockJustificaciones.filter((j) => j.estado === "rechazada").length,
  };

  const filtered = mockJustificaciones.filter((j) => {
    const matchSearch =
      !searchTerm ||
      j.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.codigo_seguimiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.curso_asignatura?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === "todos" || j.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const selected = selectedId ? mockJustificaciones.find((j) => j.id === selectedId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel Administrativo</h1>
          <p className="text-muted-foreground font-[family-name:var(--font-body)]">
            Gestión y revisión de justificaciones docentes
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
          Exportar registros
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total", value: stats.total, icon: BarChart3, color: "bg-primary/10 text-primary" },
          { label: "Pendientes", value: stats.pendiente, icon: Clock, color: "bg-yellow-100 text-yellow-700" },
          { label: "En revisión", value: stats.en_revision, icon: Eye, color: "bg-blue-100 text-blue-700" },
          { label: "Aprobadas", value: stats.aprobada, icon: CheckCircle, color: "bg-green-100 text-green-700" },
          { label: "Observadas", value: stats.observada, icon: AlertTriangle, color: "bg-orange-100 text-orange-700" },
          { label: "Rechazadas", value: stats.rechazada, icon: XCircle, color: "bg-red-100 text-red-700" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
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
              placeholder="Buscar por nombre, código o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en_revision">En revisión</SelectItem>
              <SelectItem value="aprobada">Aprobada</SelectItem>
              <SelectItem value="observada">Observada</SelectItem>
              <SelectItem value="rechazada">Rechazada</SelectItem>
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
                  <td className="px-4 py-3 font-medium">{j.nombre_completo}</td>
                  <td className="px-4 py-3 hidden md:table-cell capitalize">{getTipoLabel(j.tipo_justificacion!)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{j.curso_asignatura}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${getEstadoColor(j.estado!)}`}>
                      {estadoIcons[j.estado!]}
                      <span className="hidden sm:inline">{getEstadoLabel(j.estado!)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {new Date(j.fecha_registro!).toLocaleDateString("es-PE")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedId(j.id!)}>
                      <Eye className="h-4 w-4" />
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

      {/* Detail modal/panel */}
      {selected && (
        <div className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Detalle de solicitud</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>Cerrar</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div><span className="text-muted-foreground">Código:</span> <span className="font-mono font-bold text-primary ml-2">{selected.codigo_seguimiento}</span></div>
            <div><span className="text-muted-foreground">Docente:</span> <span className="font-medium ml-2">{selected.nombre_completo}</span></div>
            <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium ml-2 capitalize">{getTipoLabel(selected.tipo_justificacion!)}</span></div>
            <div><span className="text-muted-foreground">Curso:</span> <span className="font-medium ml-2">{selected.curso_asignatura}</span></div>
            <div><span className="text-muted-foreground">Facultad:</span> <span className="font-medium ml-2">{selected.facultad_area}</span></div>
            <div><span className="text-muted-foreground">Estado:</span> <span className={`ml-2 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${getEstadoColor(selected.estado!)}`}>{getEstadoLabel(selected.estado!)}</span></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Select>
              <SelectTrigger className="w-48"><SelectValue placeholder="Cambiar estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_revision">En revisión</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="observada">Observada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">Guardar cambios</Button>
          </div>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground font-[family-name:var(--font-body)]">
        <strong className="text-foreground">Nota:</strong> Este panel muestra datos de demostración. Al conectar con Lovable Cloud, los registros serán reales y persistentes.
      </div>
    </div>
  );
}
