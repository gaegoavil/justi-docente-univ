import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, User, ShieldCheck, BarChart3, FileText, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useRole } from "@/lib/roles";

const docenteItems = [
  { label: "Inicio", to: "/" as const },
  { label: "Registrar justificación", to: "/registrar" as const },
  { label: "Mis solicitudes", to: "/consultar" as const },
  { label: "Soporte", to: "/soporte" as const },
];

const coordinadorItems = [
  { label: "Inicio", to: "/" as const, icon: undefined },
  { label: "Panel Administrativo", to: "/admin" as const, icon: ShieldCheck },
  { label: "Solicitudes", to: "/solicitudes" as const, icon: FileText },
  { label: "Reportes", to: "/reportes" as const, icon: BarChart3 },
  { label: "Soporte", to: "/soporte" as const, icon: undefined },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isCoordinador, isDocente } = useRole();

  const navItems = isCoordinador ? coordinadorItems : docenteItems;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-primary/20 shadow-sm">
      {/* Top bar */}
      <div className="bg-institutional text-institutional-foreground text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="font-[family-name:var(--font-heading)] tracking-wide">Universidad Jaime Bausate y Meza — Uso interno institucional</span>
          <div className="hidden sm:flex items-center gap-4">
            <RoleSwitcher />
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo-bausate.png"
              alt="Logo Universidad Jaime Bausate y Meza"
              className="h-11 w-11 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-primary leading-tight font-[family-name:var(--font-heading)]">
                {isCoordinador ? "Panel de Gestión" : "Mesa de Ayuda"}
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                {isCoordinador ? "Coordinación Académica" : "Justificaciones Docentes"}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = 'icon' in item ? item.icon : undefined;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname === item.to
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            {isCoordinador && (
              <Link to="/solicitudes" className="hidden md:inline-flex">
                <Button variant="accent" size="sm">
                  <Clock className="h-4 w-4" />
                  Revisar pendientes
                </Button>
              </Link>
            )}
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
            <div className="flex justify-center pb-3 border-b mb-2">
              <RoleSwitcher />
            </div>

            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 flex items-center gap-1.5">
              {isDocente ? (
                <><User className="h-3 w-3" /> Portal Docente</>
              ) : (
                <><ShieldCheck className="h-3 w-3" /> Panel de Coordinación</>
              )}
            </div>

            {navItems.map((item) => (
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

            {isDocente && (
              <Link to="/registrar" onClick={() => setMobileOpen(false)}>
                <Button variant="accent" size="sm" className="w-full mt-2">
                  Nueva justificación
                </Button>
              </Link>
            )}
            {isCoordinador && (
              <Link to="/solicitudes" onClick={() => setMobileOpen(false)}>
                <Button variant="accent" size="sm" className="w-full mt-2">
                  <Clock className="h-4 w-4" />
                  Revisar pendientes
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
