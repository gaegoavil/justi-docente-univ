import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Clock, FileText, AlertCircle } from "lucide-react";
import { getEstadoLabel, getEstadoColor, getTipoLabel, type Justificacion } from "@/lib/justificacion";

// Mock data for demo
const mockData: Partial<Justificacion>[] = [
  {
    codigo_seguimiento: "JD-DEMO01-ABCD",
    nombre_completo: "María García López",
    tipo_justificacion: "inasistencia",
    fecha_incidencia: "2026-04-10",
    estado: "en_revision",
    fecha_registro: "2026-04-10T14:30:00",
    observaciones_admin: "Se está verificando la documentación presentada.",
    curso_asignatura: "Periodismo Digital I",
  },
];

export function StatusChecker() {
  const [searchType, setSearchType] = useState<"codigo" | "dni">("codigo");
  const [searchValue, setSearchValue] = useState("");
  const [result, setResult] = useState<Partial<Justificacion> | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setError("Ingrese un valor para buscar");
      return;
    }
    setError("");
    setSearched(true);
    // Demo: show mock if matches, otherwise null
    const found = mockData.find(
      (j) =>
        j.codigo_seguimiento?.toLowerCase() === searchValue.toLowerCase() ||
        j.nombre_completo?.toLowerCase().includes(searchValue.toLowerCase())
    );
    setResult(found || null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSearchType("codigo")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === "codigo"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Código de seguimiento
            </button>
            <button
              type="button"
              onClick={() => setSearchType("dni")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === "dni"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              DNI / Correo
            </button>
          </div>

          <div>
            <Label htmlFor="search">
              {searchType === "codigo" ? "Código de seguimiento" : "DNI o correo institucional"}
            </Label>
            <div className="flex gap-3 mt-1">
              <Input
                id="search"
                value={searchValue}
                onChange={(e) => { setSearchValue(e.target.value); setError(""); }}
                placeholder={searchType === "codigo" ? "Ej: JD-DEMO01-ABCD" : "Ej: 45678901"}
                className={error ? "border-destructive" : ""}
              />
              <Button type="submit" size="lg">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}
          </div>
        </form>
      </div>

      {searched && result && (
        <div className="bg-card rounded-xl border shadow-sm p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-bold text-foreground">Resultado de la consulta</h3>
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${getEstadoColor(result.estado!)}`}>
              <Clock className="h-3.5 w-3.5" />
              {getEstadoLabel(result.estado!)}
            </span>
          </div>

          <div className="bg-surface rounded-lg p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código</span>
              <span className="font-mono font-bold text-primary">{result.codigo_seguimiento}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-muted-foreground">Docente</span>
              <span className="font-medium">{result.nombre_completo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium">{getTipoLabel(result.tipo_justificacion!)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Curso</span>
              <span className="font-medium">{result.curso_asignatura}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de incidencia</span>
              <span className="font-medium">{result.fecha_incidencia}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de registro</span>
              <span className="font-medium">{new Date(result.fecha_registro!).toLocaleDateString("es-PE")}</span>
            </div>
            {result.observaciones_admin && (
              <div className="border-t pt-3">
                <span className="text-muted-foreground block mb-1">Observaciones de coordinación</span>
                <p className="text-foreground bg-muted/50 rounded-md p-3">{result.observaciones_admin}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {searched && !result && (
        <div className="bg-card rounded-xl border shadow-sm p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">No se encontraron resultados</h3>
          <p className="text-muted-foreground text-sm font-[family-name:var(--font-body)]">
            Verifique que el código de seguimiento o DNI ingresado sea correcto.
          </p>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground font-[family-name:var(--font-body)]">
        <strong className="text-foreground">Nota:</strong> Para fines demostrativos, ingrese el código <span className="font-mono font-bold text-primary">JD-DEMO01-ABCD</span> para ver un ejemplo de consulta.
      </div>
    </div>
  );
}
