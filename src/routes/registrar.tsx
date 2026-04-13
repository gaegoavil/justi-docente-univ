import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RegistrationForm } from "@/components/RegistrationForm";

export const Route = createFileRoute("/registrar")({
  head: () => ({
    meta: [
      { title: "Registrar Justificación | Mesa de Ayuda Docente" },
      { name: "description", content: "Complete el formulario para registrar su justificación docente." },
      { property: "og:title", content: "Registrar Justificación Docente" },
      { property: "og:description", content: "Formulario de registro de justificaciones docentes – Universidad Jaime Bausate y Meza." },
    ],
  }),
  component: RegistrarPage,
});

function RegistrarPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Registro de Justificación Docente</h1>
            <p className="text-muted-foreground font-[family-name:var(--font-body)]">
              Complete la información requerida y adjunte evidencia de sustento.
            </p>
          </div>
          <RegistrationForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
