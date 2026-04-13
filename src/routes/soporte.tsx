import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/soporte")({
  head: () => ({
    meta: [
      { title: "Soporte | Mesa de Ayuda Docente" },
      { name: "description", content: "Información de contacto y soporte para justificaciones docentes." },
      { property: "og:title", content: "Soporte – Mesa de Ayuda" },
      { property: "og:description", content: "Contacte a la coordinación académica para soporte sobre justificaciones docentes." },
    ],
  }),
  component: SoportePage,
});

function SoportePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-surface py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-3">Soporte y Contacto</h1>
            <p className="text-muted-foreground font-[family-name:var(--font-body)]">
              Si necesita asistencia con el proceso de justificación, puede comunicarse con nosotros.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              { icon: Mail, label: "Correo electrónico", value: "coordinacion@bausate.edu.pe", desc: "Respuesta en 24-48 horas hábiles" },
              { icon: Phone, label: "Teléfono", value: "(01) 715-6600", desc: "Lunes a Viernes" },
              { icon: MapPin, label: "Dirección", value: "Jr. San Martín 540, Jesús María", desc: "Lima, Perú" },
              { icon: Clock, label: "Horario de atención", value: "8:00 AM – 6:00 PM", desc: "Lunes a Viernes" },
            ].map((item) => (
              <div key={item.label} className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">{item.label}</h3>
                </div>
                <p className="text-foreground font-semibold font-[family-name:var(--font-body)]">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-card rounded-xl border p-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-3">¿Tiene una consulta específica?</h2>
            <p className="text-muted-foreground font-[family-name:var(--font-body)] mb-1">
              Para consultas sobre el estado de una justificación específica, utilice la sección de
            </p>
            <a href="/consultar" className="text-primary font-semibold hover:underline">Consultar estado</a>
            <p className="text-muted-foreground font-[family-name:var(--font-body)] mt-1">
              e ingrese su código de seguimiento.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
