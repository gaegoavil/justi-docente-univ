import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocenteHistorial } from "@/components/DocenteHistorial";
import { Search } from "lucide-react";

export const Route = createFileRoute("/consultar")({
  head: () => ({
    meta: [
      { title: "Mis Solicitudes | Mesa de Ayuda Docente" },
      { name: "description", content: "Consulte el historial y estado de sus justificaciones docentes." },
      { property: "og:title", content: "Mis Solicitudes – Justificaciones Docentes" },
      { property: "og:description", content: "Consulte y revise el estado de sus justificaciones docentes." },
    ],
  }),
  component: ConsultarPage,
});

function ConsultarPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Mis Solicitudes
            </h1>
            <p className="text-lg text-muted-foreground font-[family-name:var(--font-body)] max-w-xl mx-auto">
              Consulte el estado de sus justificaciones, revise observaciones y vea el historial completo de sus solicitudes.
            </p>
          </div>
          <DocenteHistorial />
        </div>
      </main>
      <Footer />
    </div>
  );
}
