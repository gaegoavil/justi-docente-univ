import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  BarChart3,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  FileText,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  getEstadoLabel,
  getEstadoColor,
  getTipoLabel,
  type Justificacion,
} from "@/lib/justificacion";
import {
  obtenerTodasJustificaciones,
  rowToJustificacion,
} from "@/lib/supabase-service";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

const estadoIcons: Record<string, React.ReactNode> = {
  pendiente: <Clock className="h-4 w-4" />,
  en_revision: <Eye className="h-4 w-4" />,
  aprobada: <CheckCircle className="h-4 w-4" />,
  observada: <AlertTriangle className="h-4 w-4" />,
  rechazada: <XCircle className="h-4 w-4" />,
  subsanada: <RefreshCw className="h-4 w-4" />,
};

export function AdminHome() {
  const [data, setData] = useState<Justificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const rows = await obtenerTodasJustificaciones();
      if (isSupabaseConfigured()) {
        setData(rows.map(rowToJustificacion));
      } else {
        setData(rows as unknown as Justificacion[]);
      }
      setLoading(false);
    })();
  }, []);

  const stats = {
    total: data.length,
    pendiente: data.filter((j) => j.estado === "pendiente").length,
    en_revision: data.filter((j) => j.estado === "en_revision").length,
    aprobada: data.filter((j) => j.estado === "aprobada").length,
    observada: data.filter((j) => j.estado === "observada").length,
    rechazada: data.filter((j) => j.estado === "rechazada").length,
  };

  const recientes = [...data]
    .sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())
    .slice(0, 5);

  return (
    <>
      {/* HERO ADMINISTRATIVO */}
      <section className="relative min-h-[420px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-mesa-ayuda.jpg"
            alt="Campus Universidad Jaime Bausate y Meza"
            className="w-full h-full object-cover brightness-[0.2] saturate-[0.3]"
            width={1920}
            height={1080}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-[hsl(var(--institutional-dark))]/90" />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--institutional-dark))]/80 to-[hsl(var(--primary))]/85" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm text-primary-foreground mb-6 border border-primary-foreground/25">
              <ShieldCheck className="h-4 w-4" />
              Coordinación Académica
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Panel de Gestión de Justificaciones Docentes
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              Centro de revisión, seguimiento y control institucional de incidencias docentes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/admin">
                <Button variant="hero" size="xl">
                  <BarChart3 className="h-5 w-5" />
                  Ir al panel
                </Button>
              </Link>
              <Link to="/solicitudes">
                <Button variant="heroOutline" size="xl">
                  <Eye className="h-5 w-5" />
                  Ver solicitudes
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* KPI CARDS */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Estado de atención de incidencias
            </h2>
            <p className="text-muted-foreground">
              Resumen general de solicitudes registradas en el sistema
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Cargando métricas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Total", value: stats.total, icon: BarChart3, color: "bg-primary/10 text-primary" },
                { label: "Pendientes", value: stats.pendiente, icon: Clock, color: "bg-yellow-100 text-yellow-700" },
                { label: "En revisión", value: stats.en_revision, icon: Eye, color: "bg-blue-100 text-blue-700" },
                { label: "Aprobadas", value: stats.aprobada, icon: CheckCircle, color: "bg-green-100 text-green-700" },
                { label: "Observadas", value: stats.observada, icon: AlertTriangle, color: "bg-orange-100 text-orange-700" },
                { label: "Rechazadas", value: stats.rechazada, icon: XCircle, color: "bg-red-100 text-red-700" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border p-5 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Accesos rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/admin" className="group">
              <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Panel Administrativo
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Dashboard completo con métricas, filtros avanzados y gestión integral de solicitudes.
                </p>
                <span className="text-primary text-sm font-semibold flex items-center gap-1">
                  Acceder <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
            <Link to="/solicitudes" className="group">
              <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-yellow-700" />
                </div>
                <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Solicitudes
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Listado operativo para revisión y seguimiento de casos individuales.
                </p>
                <span className="text-primary text-sm font-semibold flex items-center gap-1">
                  Revisar <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
            <Link to="/reportes" className="group">
              <div className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Reportes
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Métricas institucionales, estadísticas y exportación de datos.
                </p>
                <span className="text-primary text-sm font-semibold flex items-center gap-1">
                  Ver reportes <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ACTIVIDAD RECIENTE — solo las últimas 5, sin tabla completa */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Actividad reciente</h2>
              <p className="text-muted-foreground text-sm">Últimas solicitudes registradas</p>
            </div>
            <Link to="/solicitudes">
              <Button variant="outline" size="sm">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recientes.length === 0 ? (
            <div className="bg-card rounded-xl border p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay solicitudes registradas aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recientes.map((j) => (
                <div key={j.id} className="bg-card rounded-xl border p-4 shadow-sm flex items-center gap-4 flex-wrap">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${getEstadoColor(j.estado)}`}>
                      {estadoIcons[j.estado]}
                      {getEstadoLabel(j.estado)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">{j.nombre_completo}</div>
                    <div className="text-xs text-muted-foreground">
                      {j.codigo_seguimiento} · {getTipoLabel(j.tipo_justificacion)} · {new Date(j.fecha_registro).toLocaleDateString("es-PE")}
                    </div>
                  </div>
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Ver detalle <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
