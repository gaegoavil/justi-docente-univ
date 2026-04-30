import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRole } from "@/lib/roles";
import { ShieldAlert, Search, Eye, Clock, CheckCircle, AlertTriangle, XCircle, RefreshCw, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  getEstadoLabel,
  getEstadoColor,
  getTipoLabel,
  type Justificacion,
} from "@/lib/justificacion";
import { listarTodasLasJustificaciones } from "@/lib/supabase-service";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export const Route = createFileRoute("/solicitudes")({
  head: () => ({
    meta: [
      { title: "Solicitudes | Panel Administrativo" },
      { name: "description", content: "Listado operativo y gestión de solicitudes de justificación docente." },
    ],
  }),
  component: SolicitudesPage,
});

const estadoIcons: Record<string, React.ReactNode> = {
  pendiente: <Clock className="h-4 w-4" />,
  en_revision: <Eye className="h-4 w-4" />,
  aprobada: <CheckCircle className="h-4 w-4" />,
  observada: <AlertTriangle className="h-4 w-4" />,
  rechazada: <XCircle className="h-4 w-4" />,
  subsanada: <RefreshCw className="h-4 w-4" />,
};

function SolicitudesPage() {
  const { isCoordinador } = useRole();
  const [data, setData] = useState<Justificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");

useEffect(() => {
  (async () => {
    const result = await listarTodasLasJustificaciones();
    setData(result.data || []);
    setLoading(false);
  })();
}, []);

  if (!isCoordinador) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-surface flex items-center justify-center py-16">
          <div className="max-w-md text-center px-4">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Acceso restringido</h1>
            <p className="text-muted-foreground text-lg mb-6">
              Esta sección está disponible únicamente para coordinadores y personal administrativo autorizado.
            </p>
            <Link to="/">
              <Button variant="default" size="lg">Volver al inicio</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filtered = data.filter((j) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      j.nombre_completo.toLowerCase().includes(s) ||
      j.codigo_seguimiento.toLowerCase().includes(s) ||
      j.correo_institucional.toLowerCase().includes(s) ||
      j.dni_codigo_docente.toLowerCase().includes(s);
    const matchEstado = filterEstado === "todos" || j.estado === filterEstado;
    const matchTipo = filterTipo === "todos" || j.tipo_justificacion === filterTipo;
    return matchSearch && matchEstado && matchTipo;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          {/* Header de sección */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Solicitudes</h1>
            <p className="text-muted-foreground font-[family-name:var(--font-body)]">
              Revisión y seguimiento operativo de justificaciones docentes
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-card rounded-xl border p-4 shadow-sm flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, código, correo o DNI..."
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

          {/* Tabla */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Cargando solicitudes...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-xl border p-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No se encontraron solicitudes con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Código</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Docente</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Correo</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Tipo</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Estado</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">Fecha</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">Evidencia</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((j) => (
                      <tr key={j.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-primary font-bold">{j.codigo_seguimiento}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{j.nombre_completo}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{j.correo_institucional}</td>
                        <td className="px-4 py-3 hidden md:table-cell capitalize">{getTipoLabel(j.tipo_justificacion)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${getEstadoColor(j.estado)}`}>
                            {estadoIcons[j.estado]}
                            {getEstadoLabel(j.estado)}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                          {new Date(j.fecha_registro).toLocaleDateString("es-PE")}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {j.archivos_adjuntos.length > 0 ? (
                            <span className="text-xs text-primary font-medium">{j.archivos_adjuntos.length} archivo(s)</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link to="/admin">
                            <Button variant="ghost" size="sm" className="text-primary text-xs">
                              <Eye className="h-3 w-3" /> Ver
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t bg-muted/30 text-sm text-muted-foreground">
                Mostrando {filtered.length} de {data.length} solicitudes
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
