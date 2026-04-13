import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "@/components/AdminDashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel Administrativo | Mesa de Ayuda Docente" },
      { name: "description", content: "Panel de gestión y revisión de justificaciones docentes." },
      { property: "og:title", content: "Panel Administrativo" },
      { property: "og:description", content: "Gestión de justificaciones docentes – Panel de coordinación." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
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
