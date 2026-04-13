import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRole } from "@/lib/roles";
import { ShieldAlert, BarChart3, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getEstadoLabel,
  type Justificacion,
} from "@/lib/justificacion";
import {
  obtenerTodasJustificaciones,
  rowToJustificacion,
} from "@/lib/supabase-service";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes | Panel Administrativo" },
      { name: "description", content: "Métricas y reportes institucionales de justificaciones docentes." },
    ],
  }),
  component: ReportesPage,
});

function ReportesPage() {
  const { isCoordinador } = useRole();
  const [data, setData] = useState<Justificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isCoordinador) return;
    (async () => {
      const rows = await obtenerTodasJustificaciones();
      if (isSupabaseConfigured()) {
        setData(rows.map(rowToJustificacion));
      } else {
        setData(rows as unknown as Justificacion[]);
      }
      setLoading(false);
    })();
  }, [isCoordinador]);

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
              Esta sección está disponible únicamente para coordinadores autorizados.
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

  const stats = {
    total: data.length,
    pendiente: data.filter((j) => j.estado === "pendiente").length,
    en_revision: data.filter((j) => j.estado === "en_revision").length,
    aprobada: data.filter((j) => j.estado === "aprobada").length,
    observada: data.filter((j) => j.estado === "observada").length,
    rechazada: data.filter((j) => j.estado === "rechazada").length,
  };

  const tipoCount: Record<string, number> = {};
  data.forEach((j) => {
    tipoCount[j.tipo_justificacion] = (tipoCount[j.tipo_justificacion] || 0) + 1;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Reportes Institucionales</h1>
            </div>
            <p className="text-muted-foreground">
              Métricas institucionales y estadísticas de gestión de justificaciones docentes.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Cargando datos...</span>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary stats */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Resumen por estado</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(stats).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-xl border p-5 text-center shadow-sm"
                    >
                      <div className="text-3xl font-bold text-foreground">{value}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {key === "en_revision" ? "En revisión" : key}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* By type */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Distribución por tipo de incidencia</h2>
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left px-6 py-3 font-semibold text-foreground">Tipo de justificación</th>
                        <th className="text-right px-6 py-3 font-semibold text-foreground">Cantidad</th>
                        <th className="text-right px-6 py-3 font-semibold text-foreground">Porcentaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(tipoCount).map(([tipo, count]) => (
                        <tr key={tipo} className="border-b hover:bg-muted/30">
                          <td className="px-6 py-3 capitalize font-medium">{tipo}</td>
                          <td className="px-6 py-3 text-right">{count}</td>
                          <td className="px-6 py-3 text-right text-muted-foreground">
                            {stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))}
                      {Object.keys(tipoCount).length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                            Sin datos disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Export hint */}
              <div className="bg-card rounded-xl border p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Exportar datos</h3>
                  <p className="text-sm text-muted-foreground">
                    Para exportar reportes detallados, acceda al Panel Administrativo y utilice los filtros avanzados.
                  </p>
                </div>
                <Link to="/admin" className="ml-auto shrink-0">
                  <Button variant="outline" size="sm">Ir al panel</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
