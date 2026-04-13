import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Search, CheckCircle, Clock, Shield, BookOpen, HelpCircle, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mesa de Ayuda – Justificaciones Docentes | Universidad Jaime Bausate y Meza" },
      { name: "description", content: "Plataforma institucional para el registro y seguimiento de tardanzas, inasistencias, permisos e incidencias académicas docentes." },
      { property: "og:title", content: "Mesa de Ayuda – Justificaciones Docentes" },
      { property: "og:description", content: "Sistema institucional de la Universidad Jaime Bausate y Meza para gestión de justificaciones docentes." },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: FileText,
    title: "Registro formal de incidencias",
    description: "Registre tardanzas, inasistencias, permisos y otros casos de manera ordenada y formal.",
  },
  {
    icon: Upload,
    title: "Carga de evidencias",
    description: "Adjunte documentos, imágenes o archivos que sustenten su justificación.",
  },
  {
    icon: Search,
    title: "Seguimiento de solicitudes",
    description: "Consulte el estado de todas sus justificaciones con su correo institucional.",
  },
  {
    icon: CheckCircle,
    title: "Revisión por coordinación",
    description: "Cada solicitud es revisada por la coordinación académica correspondiente.",
  },
];

const faqs = [
  {
    q: "¿Qué tipo de justificaciones puedo registrar?",
    a: "Puede registrar tardanzas, inasistencias, incumplimientos, permisos, reprogramaciones y cualquier otra incidencia académica o administrativa que requiera sustento formal.",
  },
  {
    q: "¿Qué documentos puedo adjuntar como evidencia?",
    a: "Puede adjuntar imágenes (JPG, PNG), documentos PDF y videos breves. El peso máximo por archivo es de 10 MB.",
  },
  {
    q: "¿Cuánto tiempo tarda la revisión?",
    a: "Las solicitudes son revisadas por la coordinación en un plazo máximo de 3 días hábiles. Recibirá notificación cuando su caso sea atendido.",
  },
  {
    q: "¿Cómo consulto el estado de mi justificación?",
    a: "Ingrese a la sección 'Mis solicitudes' desde el menú principal. Sus justificaciones se cargan automáticamente con su correo institucional.",
  },
];

function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* HERO — uses /public/hero-bausate.jpg as editable background */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-mesa-ayuda.jpg"
            alt="Campus Universidad Jaime Bausate y Meza"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-[hsl(var(--primary))]/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-block bg-primary-foreground/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm text-primary-foreground mb-6 border border-primary-foreground/30">
              Plataforma institucional de uso interno
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Mesa de Ayuda de Justificaciones Docentes
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/85 mb-8 leading-relaxed">
              Plataforma institucional para el registro y seguimiento de tardanzas, inasistencias, permisos e incidencias académicas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/registrar">
                <Button variant="hero" size="xl">
                  <FileText className="h-5 w-5" />
                  Registrar justificación
                </Button>
              </Link>
              <Link to="/consultar">
                <Button variant="heroOutline" size="xl">
                  <Search className="h-5 w-5" />
                  Mis solicitudes
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Qué es la Mesa de Ayuda?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Sistema institucional diseñado para que los docentes de la universidad puedan registrar, sustentar y dar seguimiento a sus justificaciones de manera formal y ordenada.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL BANNER */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-registro.jpg"
            alt="Universidad Jaime Bausate y Meza"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-[hsl(var(--primary))]/85" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Registre su justificación de manera formal, segura y ordenada
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Adjunte evidencia que sustente la incidencia reportada. Su solicitud será revisada por la coordinación correspondiente.
          </p>
          <Link to="/registrar">
            <Button variant="hero" size="lg">Comenzar registro</Button>
          </Link>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Recomendaciones para un registro correcto
              </h2>
              <ul className="space-y-4">
                {[
                  "Complete todos los campos obligatorios con información precisa y veraz.",
                  "Adjunte evidencia clara que sustente su justificación (certificados médicos, documentos oficiales, etc.).",
                  "Detalle el motivo de la incidencia y el impacto académico generado.",
                  "Proponga una acción correctiva o fecha de regularización cuando corresponda.",
                  "Conserve su código de seguimiento para consultas posteriores.",
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground/80">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface rounded-xl p-8 border">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Proceso de revisión</h3>
              </div>
              <div className="space-y-4">
                {[
                  { step: "1", label: "Registro", desc: "El docente completa el formulario y adjunta evidencia." },
                  { step: "2", label: "Recepción", desc: "El sistema genera un código de seguimiento único." },
                  { step: "3", label: "Revisión", desc: "La coordinación evalúa la solicitud y evidencia." },
                  { step: "4", label: "Resolución", desc: "Se notifica la decisión con observaciones." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{s.label}</div>
                      <div className="text-sm text-muted-foreground">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card rounded-lg border overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-muted-foreground text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SUPPORT */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">¿Necesita ayuda?</h2>
          <p className="text-muted-foreground mb-6">
            Si tiene dudas sobre el proceso de justificación, comuníquese con la coordinación académica.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/soporte">
              <Button variant="outline" size="lg">Ir a soporte</Button>
            </Link>
            <Link to="/registrar">
              <Button size="lg">Registrar justificación</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
