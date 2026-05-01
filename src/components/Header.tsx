import { Link, useLocation } from "@tanstack/react-router";
import {
  Menu,
  X,
  User,
  ShieldCheck,
  BarChart3,
  FileText,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useRole } from "@/lib/roles";

const docenteItems = [
  { label: "Inicio", to: "/" as const, icon: undefined },
  { label: "Registrar justificación", to: "/registrar" as const, icon: FileText },
  { label: "Mis solicitudes", to: "/consultar" as const, icon: undefined },
  { label: "Soporte", to: "/soporte" as const, icon: undefined },
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
  const isDocenteHome = isDocente && location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-primary/20 bg-background/95 shadow-sm backdrop-blur-sm">
      {/* Top bar */}
      <div className="bg-institutional py-1.5 text-xs text-institutional-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <span className="font-[family-name:var(--font-heading)] tracking-wide">
            Universidad Jaime Bausate y Meza — Uso interno institucional
          </span>
          <div className="hidden items-center gap-4 sm:flex">
            <RoleSwitcher />
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img
              src="/logo-bausate.png"
              alt="Logo Universidad Jaime Bausate y Meza"
              className="h-11 w-11 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="hidden sm:block">
              <div className="font-[family-name:var(--font-heading)] text-sm font-bold leading-tight text-primary">
                {isCoordinador ? "Panel de Gestión" : "Mesa de Ayuda"}
              </div>
              <div className="text-xs leading-tight text-muted-foreground">
                {isCoordinador ? "Coordinación Académica" : "Justificaciones Docentes"}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          {!isDocenteHome && (
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      location.pathname === item.to
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

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

            {!isDocenteHome && (
              <button
                type="button"
                className="rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && !isDocenteHome && (
        <div className="border-t bg-background lg:hidden">
          <div className="space-y-1 px-4 py-3">
            <div className="mb-2 flex justify-center border-b pb-3">
              <RoleSwitcher />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isDocente ? (
                <>
                  <User className="h-3 w-3" /> Portal Docente
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3 w-3" /> Panel de Coordinación
                </>
              )}
            </div>

            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2.5 text-base font-medium ${
                  location.pathname === item.to
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isCoordinador && (
              <Link to="/solicitudes" onClick={() => setMobileOpen(false)}>
                <Button variant="accent" size="sm" className="mt-2 w-full">
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
