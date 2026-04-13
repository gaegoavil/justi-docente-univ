import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo-university.png";

const navItems = [
  { label: "Inicio", to: "/" },
  { label: "Registrar justificación", to: "/registrar" },
  { label: "Consultar estado", to: "/consultar" },
  { label: "Panel administrativo", to: "/admin" },
  { label: "Soporte", to: "/soporte" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-primary/20 shadow-sm">
      {/* Top bar */}
      <div className="bg-institutional text-institutional-foreground text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Universidad Jaime Bausate y Meza — Uso interno institucional</span>
          <span className="hidden sm:inline">Sistema de Gestión Docente</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logoImg} alt="Logo Universidad" className="h-10 w-10 object-contain" />
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-primary leading-tight font-[family-name:var(--font-heading)]">
                Mesa de Ayuda
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                Justificaciones Docentes
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.to
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link to="/registrar" className="hidden md:inline-flex">
              <Button variant="accent" size="sm">Nueva justificación</Button>
            </Link>
            <button
              className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.to
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/registrar" onClick={() => setMobileOpen(false)}>
              <Button variant="accent" size="sm" className="w-full mt-2">
                Nueva justificación
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
