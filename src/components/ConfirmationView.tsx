import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, FileText, Search } from "lucide-react";
import { motion } from "framer-motion";

interface ConfirmationViewProps {
  codigo: string;
  nombre: string;
  tipo: string;
  fecha: string;
  onReset: () => void;
}

export function ConfirmationView({ codigo, nombre, tipo, fecha, onReset }: ConfirmationViewProps) {
  const now = new Date();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-xl border shadow-sm p-8 md:p-12 text-center max-w-2xl mx-auto"
    >
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">
        ¡Justificación registrada exitosamente!
      </h2>
      <p className="text-muted-foreground mb-8 font-[family-name:var(--font-body)]">
        Su solicitud ha sido recibida y será revisada por la coordinación correspondiente.
      </p>

      <div className="bg-surface rounded-lg p-6 mb-8 text-left space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Código de seguimiento</span>
          <span className="font-bold text-primary text-lg font-mono">{codigo}</span>
        </div>
        <div className="border-t pt-3 flex justify-between">
          <span className="text-sm text-muted-foreground">Docente</span>
          <span className="text-sm text-foreground font-medium">{nombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Tipo de incidencia</span>
          <span className="text-sm text-foreground font-medium capitalize">{tipo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Fecha de incidencia</span>
          <span className="text-sm text-foreground font-medium">{fecha}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Fecha de registro</span>
          <span className="text-sm text-foreground font-medium">{now.toLocaleDateString("es-PE")} {now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Estado</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full border border-yellow-300">
            <Clock className="h-3.5 w-3.5" />
            Pendiente de revisión
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button onClick={onReset} variant="outline" size="lg">
          <FileText className="h-4 w-4" />
          Registrar otra justificación
        </Button>
        <Link to="/consultar">
          <Button size="lg">
            <Search className="h-4 w-4" />
            Consultar estado
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
