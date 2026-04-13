import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useRole } from "@/lib/roles";
import {
  getEstadoLabel,
  getEstadoColor,
  getTipoLabel,
  type Justificacion,
} from "@/lib/justificacion";
import {
  obtenerJustificacionesPorCorreo,
  rowToJustificacion,
} from "@/lib/supabase-service";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { mockJustificaciones } from "@/lib/justificacion";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
  Info,
  Inbox,
  Loader2,
} from "lucide-react";

const estadoIcons: Record<string, React.ReactNode> = {
  pendiente: <Clock className="h-5 w-5" />,
  en_revision: <Eye className="h-5 w-5" />,
  aprobada: <CheckCircle className="h-5 w-5" />,
  observada: <AlertTriangle className="h-5 w-5" />,
  rechazada: <XCircle className="h-5 w-5" />,
  subsanada: <RefreshCw className="h-5 w-5" />,
};

export function DocenteHistorial() {
  const { email } = useRole();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Justificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      if (isSupabaseConfigured() && email) {
        const rows = await obtenerJustificacionesPorCorreo(email);
        setResultados(rows.map(rowToJustificacion));
      } else {
        // Fallback mock
        setResultados(
          mockJustificaciones.filter(
            (j) => j.correo_institucional.toLowerCase() === (email || "").toLowerCase()
          )
        );
      }
      setLoading(false);
    }
    cargar();
  }, [email]);

  const selected = selectedId ? resultados.find((j) => j.id === selectedId) : null;

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
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-2 text-primary font-semibold text-lg hover:underline"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver a mis solicitudes
        </button>

        <div className="bg-card rounded-2xl border-2 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <h2 className="text-2xl font-bold text-foreground">Detalle de solicitud</h2>
            <span
              className={`inline-flex items-center gap-2 text-base font-bold px-4 py-2 rounded-full border-2 ${getEstadoColor(selected.estado)}`}
            >
              {estadoIcons[selected.estado]}
              {getEstadoLabel(selected.estado)}
            </span>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard label="Código de seguimiento" value={selected.codigo_seguimiento} mono />
              <InfoCard label="Tipo de incidencia" value={getTipoLabel(selected.tipo_justificacion)} />
              <InfoCard label="Curso" value={selected.curso_asignatura} />
              <InfoCard label="Facultad" value={selected.facultad_area} />
              <InfoCard label="Fecha de incidencia" value={new Date(selected.fecha_incidencia).toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
              <InfoCard label="Turno" value={selected.turno} capitalize />
              <InfoCard label="Modalidad" value={selected.modalidad} capitalize />
              <InfoCard label="Sede / Aula" value={selected.sede_aula_enlace || "No especificado"} />
            </div>

            <div className="bg-surface rounded-xl p-5 border">
              <h3 className="font-bold text-foreground text-lg mb-2">Descripción</h3>
              <p className="text-foreground/80 text-base leading-relaxed">{selected.descripcion}</p>
            </div>

            <div className="bg-surface rounded-xl p-5 border">
              <h3 className="font-bold text-foreground text-lg mb-2">Motivo principal</h3>
              <p className="text-foreground/80 text-base">{selected.motivo_principal}</p>
            </div>

            {selected.archivos_adjuntos.length > 0 && (
              <div className="bg-surface rounded-xl p-5 border">
                <h3 className="font-bold text-foreground text-lg mb-3">Archivos adjuntos</h3>
                <div className="space-y-2">
                  {selected.archivos_adjuntos.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card rounded-lg px-4 py-3 border">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-foreground font-medium">{a.nombre}</span>
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
              <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground text-lg">Observaciones de coordinación</h3>
                </div>
                <p className="text-foreground/80 text-base leading-relaxed">{selected.observaciones_admin}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                label="Fecha de registro"
                value={new Date(selected.fecha_registro).toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              />
              {selected.fecha_revision && (
                <InfoCard
                  label="Fecha de revisión"
                  value={new Date(selected.fecha_revision).toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Inbox className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            Mostrando solicitudes de: <span className="text-primary">{email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Sus justificaciones se cargan automáticamente con su correo institucional.
          </p>
        </div>
      </div>

      {resultados.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">
            {resultados.length} solicitud(es) encontrada(s)
          </h3>
          {resultados.map((j) => (
            <button
              key={j.id}
              onClick={() => setSelectedId(j.id)}
              className="w-full text-left bg-card rounded-2xl border-2 p-5 md:p-6 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border ${getEstadoColor(j.estado)}`}
                    >
                      {estadoIcons[j.estado]}
                      {getEstadoLabel(j.estado)}
                    </span>
                    <span className="text-sm font-mono text-primary font-bold">
                      {j.codigo_seguimiento}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-1">
                    {getTipoLabel(j.tipo_justificacion)} — {j.curso_asignatura}
                  </div>
                  <div className="text-muted-foreground">
                    {new Date(j.fecha_incidencia).toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                  {j.observaciones_admin && (
                    <div className="mt-2 text-sm text-primary/80 flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" /> Tiene observaciones de coordinación
                    </div>
                  )}
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border-2 shadow-sm p-10 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            No tiene solicitudes registradas
          </h3>
          <p className="text-muted-foreground text-lg mb-6">
            Aún no se han encontrado justificaciones asociadas a su correo institucional.
          </p>
          <Link to="/registrar">
            <Button size="lg" className="text-lg px-8 py-6">
              <FileText className="h-5 w-5" />
              Registrar una justificación
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, mono, capitalize: cap }: { label: string; value: string; mono?: boolean; capitalize?: boolean }) {
  return (
    <div className="bg-surface rounded-xl p-4 border">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className={`text-base font-semibold text-foreground ${mono ? "font-mono text-primary" : ""} ${cap ? "capitalize" : ""}`}>
        {value}
      </div>
    </div>
  );
}
