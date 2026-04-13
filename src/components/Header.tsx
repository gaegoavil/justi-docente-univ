import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, User, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo-university.png";

const docenteItems = [
  { label: "Inicio", to: "/" as const },
  { label: "Registrar justificación", to: "/registrar" as const },
  { label: "Mis solicitudes", to: "/consultar" as const },
  { label: "Soporte", to: "/soporte" as const },
];

const adminItems = [
  { label: "Panel administrativo", to: "/admin" as const },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-primary/20 shadow-sm">
      {/* Top bar */}
      <div className="bg-institutional text-institutional-foreground text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Universidad Jaime Bausate y Meza — Uso interno institucional</span>
          <div className="hidden sm:flex items-center gap-4">
            <Link
              to="/consultar"
              className={`flex items-center gap-1 transition-opacity ${!isAdmin ? "opacity-100 font-semibold" : "opacity-70 hover:opacity-100"}`}
            >
              <User className="h-3 w-3" />
              Portal Docente
            </Link>
            <Link
              to="/admin"
              className={`flex items-center gap-1 transition-opacity ${isAdmin ? "opacity-100 font-semibold" : "opacity-70 hover:opacity-100"}`}
            >
              <ShieldCheck className="h-3 w-3" />
              Administración
            </Link>
          </div>
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
            {docenteItems.map((item) => (
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
            <div className="w-px h-6 bg-border mx-2" />
            {adminItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === item.to
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
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
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 flex items-center gap-1.5">
              <User className="h-3 w-3" />
              Portal Docente
            </div>
            {docenteItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                  location.pathname === item.to
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t my-2" />
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              Administración
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium ${
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
