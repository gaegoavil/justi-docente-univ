import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StatusChecker } from "@/components/StatusChecker";

export const Route = createFileRoute("/consultar")({
  head: () => ({
    meta: [
      { title: "Consultar Estado | Mesa de Ayuda Docente" },
      { name: "description", content: "Consulte el estado de su justificación con su código de seguimiento." },
      { property: "og:title", content: "Consultar Estado de Justificación" },
      { property: "og:description", content: "Verifique el estado de su solicitud de justificación docente." },
    ],
  }),
  component: ConsultarPage,
});

function ConsultarPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Consultar Estado</h1>
            <p className="text-muted-foreground font-[family-name:var(--font-body)]">
              Ingrese su código de seguimiento o DNI para verificar el estado de su justificación.
            </p>
          </div>
          <StatusChecker />
        </div>
      </main>
      <Footer />
    </div>
  );
}
