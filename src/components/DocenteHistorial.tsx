import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import {
  getEstadoLabel,
  getEstadoColor,
  getTipoLabel,
  mockJustificaciones,
  type Justificacion,
} from "@/lib/justificacion";
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  ArrowLeft,
  Mail,
  RefreshCw,
  ChevronRight,
  Info,
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
  const [correo, setCorreo] = useState("");
  const [dniCodigo, setDniCodigo] = useState("");
  const [resultados, setResultados] = useState<Justificacion[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim()) {
      setError("Ingrese su correo institucional para buscar");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("Ingrese un correo válido");
      return;
    }
    setError("");
    setSearched(true);
    setSelectedId(null);

    const found = mockJustificaciones.filter((j) => {
      const matchCorreo = j.correo_institucional.toLowerCase() === correo.toLowerCase();
      const matchDni = dniCodigo.trim()
        ? j.dni_codigo_docente.toLowerCase() === dniCodigo.toLowerCase()
        : true;
      return matchCorreo && matchDni;
    });
    setResultados(found);
  };

  const selected = selectedId ? resultados.find((j) => j.id === selectedId) : null;

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
            {/* Info cards */}
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

            {/* Description */}
            <div className="bg-surface rounded-xl p-5 border">
              <h3 className="font-bold text-foreground text-lg mb-2">Descripción</h3>
              <p className="text-foreground/80 text-base leading-relaxed font-[family-name:var(--font-body)]">
                {selected.descripcion}
              </p>
            </div>

            {/* Motivo */}
            <div className="bg-surface rounded-xl p-5 border">
              <h3 className="font-bold text-foreground text-lg mb-2">Motivo principal</h3>
              <p className="text-foreground/80 text-base font-[family-name:var(--font-body)]">
                {selected.motivo_principal}
              </p>
            </div>

            {/* Archivos */}
            {selected.archivos_adjuntos.length > 0 && (
              <div className="bg-surface rounded-xl p-5 border">
                <h3 className="font-bold text-foreground text-lg mb-3">Archivos adjuntos</h3>
                <div className="space-y-2">
                  {selected.archivos_adjuntos.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card rounded-lg px-4 py-3 border">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-foreground font-medium">{a.nombre}</span>
                      <span className="text-muted-foreground text-sm">
                        ({(a.tamano / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observaciones admin */}
            {selected.observaciones_admin && (
              <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground text-lg">Observaciones de coordinación</h3>
                </div>
                <p className="text-foreground/80 text-base leading-relaxed font-[family-name:var(--font-body)]">
                  {selected.observaciones_admin}
                </p>
              </div>
            )}

            {/* Dates */}
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
      {/* Search form */}
      <div className="bg-card rounded-2xl border-2 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Buscar mis solicitudes</h2>
            <p className="text-muted-foreground font-[family-name:var(--font-body)]">
              Ingrese su correo institucional para ver sus justificaciones
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-5">
          <div>
            <Label htmlFor="correo-buscar" className="text-base font-semibold">
              Correo institucional *
            </Label>
            <Input
              id="correo-buscar"
              type="email"
              value={correo}
              onChange={(e) => { setCorreo(e.target.value); setError(""); }}
              placeholder="Ej: mgarcia@bausate.edu.pe"
              className={`h-14 text-lg ${error ? "border-destructive" : ""}`}
            />
            {error && (
              <p className="text-base text-destructive flex items-center gap-2 mt-2 font-[family-name:var(--font-body)]">
                <AlertTriangle className="h-4 w-4" /> {error}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="dni-buscar" className="text-base font-semibold">
              DNI o código de docente <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="dni-buscar"
              value={dniCodigo}
              onChange={(e) => setDniCodigo(e.target.value)}
              placeholder="Ej: 45678901"
              className="h-14 text-lg"
            />
          </div>

          <Button type="submit" size="xl" className="w-full text-lg">
            <Search className="h-5 w-5" />
            Buscar mis solicitudes
          </Button>
        </form>
      </div>

      {/* Results */}
      {searched && resultados.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">
            Se encontraron {resultados.length} solicitud(es)
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
                  <div className="text-muted-foreground font-[family-name:var(--font-body)]">
                    {new Date(j.fecha_incidencia).toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {searched && resultados.length === 0 && (
        <div className="bg-card rounded-2xl border-2 shadow-sm p-10 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            No se encontraron solicitudes
          </h3>
          <p className="text-muted-foreground text-lg mb-6 font-[family-name:var(--font-body)]">
            No hay justificaciones registradas con ese correo institucional.
          </p>
          <Link to="/registrar">
            <Button size="xl" className="text-lg">
              <FileText className="h-5 w-5" />
              Registrar una justificación
            </Button>
          </Link>
        </div>
      )}

      {/* Demo note */}
      <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5 text-base text-muted-foreground font-[family-name:var(--font-body)]">
        <strong className="text-foreground">Nota de demostración:</strong> Pruebe con el correo{" "}
        <span className="font-mono font-bold text-primary">mgarcia@bausate.edu.pe</span> para ver un ejemplo.
      </div>
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
