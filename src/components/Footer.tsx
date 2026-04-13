import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer>
      {/* 3 institutional contact blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Email block - Red */}
        <div className="bg-accent-red text-accent-red-foreground px-6 py-8 flex items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent-red-foreground/15 flex items-center justify-center shrink-0">
            <Mail className="h-7 w-7" />
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-1">Correo institucional</div>
            <div className="text-lg font-bold">bausate@bausate.edu.pe</div>
          </div>
        </div>

        {/* Phone block - Blue */}
        <div className="bg-primary text-primary-foreground px-6 py-8 flex items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/15 flex items-center justify-center shrink-0">
            <Phone className="h-7 w-7" />
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-1">Charlemos</div>
            <div className="text-lg font-bold">+51 (1) 319 3523</div>
          </div>
        </div>

        {/* Location block - Dark */}
        <div className="bg-institutional text-institutional-foreground px-6 py-8 flex items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full bg-institutional-foreground/15 flex items-center justify-center shrink-0">
            <MapPin className="h-7 w-7" />
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-1">Visítenos</div>
            <div className="text-lg font-bold">Jirón Río de Janeiro 560, Jesús María</div>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="bg-institutional-dark text-institutional-foreground">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center text-xs opacity-60">
          <span>© 2026 Universidad Jaime Bausate y Meza. Todos los derechos reservados.</span>
          <span>Mesa de Ayuda — Uso interno institucional</span>
        </div>
      </div>
    </footer>
  );
}
