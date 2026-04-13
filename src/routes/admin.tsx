import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "@/components/AdminDashboard";
import { useRole } from "@/lib/roles";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel Administrativo | Mesa de Ayuda Docente" },
      { name: "description", content: "Panel de gestión y revisión de justificaciones docentes." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isCoordinador } = useRole();

  if (!isCoordinador) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-surface flex items-center justify-center py-16">
          <div className="max-w-md text-center px-4">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Acceso restringido
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Esta sección está disponible únicamente para coordinadores y personal administrativo autorizado.
            </p>
            <Link to="/">
              <Button variant="default" size="lg">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="max-w-7xl mx-auto px-4">
          <AdminDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
