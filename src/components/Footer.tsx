import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/logo-university.png";

export function Footer() {
  return (
    <footer className="institutional-gradient text-institutional-foreground">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Logo Universidad" className="h-12 w-12 object-contain" loading="lazy" />
              <div>
                <div className="font-bold font-[family-name:var(--font-heading)] text-lg">
                  Universidad Jaime Bausate y Meza
                </div>
                <div className="text-sm opacity-80">
                  Mesa de Ayuda – Justificaciones Docentes
                </div>
              </div>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              Plataforma institucional de uso interno para el registro y seguimiento de
              justificaciones docentes. Sistema de gestión y control de incidencias académicas.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 opacity-80">
              Enlaces rápidos
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="opacity-70 hover:opacity-100 transition-opacity">Inicio</Link></li>
              <li><Link to="/registrar" className="opacity-70 hover:opacity-100 transition-opacity">Registrar justificación</Link></li>
              <li><Link to="/consultar" className="opacity-70 hover:opacity-100 transition-opacity">Consultar estado</Link></li>
              <li><Link to="/soporte" className="opacity-70 hover:opacity-100 transition-opacity">Soporte</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 opacity-80">
              Contacto de Coordinación
            </h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li>📧 coordinacion@bausate.edu.pe</li>
              <li>📞 (01) 715-6600</li>
              <li>📍 Jr. San Martín 540, Jesús María, Lima</li>
              <li>🕐 Lunes a Viernes: 8:00 – 18:00</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-institutional-foreground/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center text-xs opacity-60">
          <span>© 2026 Universidad Jaime Bausate y Meza. Todos los derechos reservados.</span>
          <span>Uso interno institucional</span>
        </div>
      </div>
    </footer>
  );
}
