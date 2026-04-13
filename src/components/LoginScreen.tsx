import { useState } from "react";
import { useRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, ShieldCheck, ArrowLeft, AlertCircle, GraduationCap } from "lucide-react";
import logoImg from "@/assets/logo-university.png";
import heroCampus from "@/assets/hero-campus.jpg";

export function LoginScreen() {
  const [view, setView] = useState<"main" | "docente" | "coordinador">("main");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img src={heroCampus} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/85 backdrop-blur-sm" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logoImg} alt="Logo Universidad" className="h-16 w-16 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground leading-tight">
              Mesa de Ayuda
            </h1>
            <p className="text-primary-foreground/80 text-base mt-1">
              Justificaciones Docentes
            </p>
            <p className="text-primary-foreground/60 text-sm mt-1">
              Universidad Jaime Bausate y Meza
            </p>
          </div>

          {view === "main" && <MainView onSelect={setView} />}
          {view === "docente" && <DocenteLogin onBack={() => setView("main")} />}
          {view === "coordinador" && <CoordinadorLogin onBack={() => setView("main")} />}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-primary-foreground/50 text-xs">
        © 2026 Universidad Jaime Bausate y Meza — Uso interno institucional
      </div>
    </div>
  );
}

function MainView({ onSelect }: { onSelect: (v: "docente" | "coordinador") => void }) {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Bienvenido</CardTitle>
          <CardDescription className="text-base">
            Seleccione su tipo de acceso para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-6">
          <Button
            variant="default"
            size="xl"
            className="w-full text-lg"
            onClick={() => onSelect("docente")}
          >
            <GraduationCap className="h-6 w-6" />
            Ingresar como Docente
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Acceso con correo institucional @bausate.edu.pe
          </p>
        </CardContent>
      </Card>

      <button
        onClick={() => onSelect("coordinador")}
        className="w-full text-center text-primary-foreground/70 hover:text-primary-foreground text-sm underline-offset-4 hover:underline transition-colors py-2"
      >
        <ShieldCheck className="h-4 w-4 inline mr-1.5" />
        Acceso de coordinación
      </button>
    </div>
  );
}

function DocenteLogin({ onBack }: { onBack: () => void }) {
  const { loginAsDocente } = useRole();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Ingrese su correo institucional.");
      return;
    }
    const err = loginAsDocente(email);
    if (err) setError(err);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Portal Docente</CardTitle>
            <CardDescription className="text-base">
              Ingrese con su correo institucional
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base font-semibold text-foreground mb-2">
              Correo institucional
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="ejemplo@bausate.edu.pe"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="pl-11 h-12 text-base"
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 mt-3 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <Button type="submit" size="xl" className="w-full text-lg">
            Ingresar
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Solo se permite el acceso con correo institucional @bausate.edu.pe
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function CoordinadorLogin({ onBack }: { onBack: () => void }) {
  const { loginAsCoordinador } = useRole();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError("Ingrese la clave administrativa.");
      return;
    }
    const err = loginAsCoordinador(key);
    if (err) setError(err);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-institutional/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-institutional" />
          </div>
          <div>
            <CardTitle className="text-xl">Acceso de Coordinación</CardTitle>
            <CardDescription className="text-base">
              Ingrese la clave administrativa
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base font-semibold text-foreground mb-2">
              Clave administrativa
            </label>
            <Input
              type="password"
              placeholder="Ingrese la clave"
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(""); }}
              className="h-12 text-base"
              autoFocus
            />
            {error && (
              <div className="flex items-start gap-2 mt-3 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <Button type="submit" variant="institutional" size="xl" className="w-full text-lg">
            Ingresar como Coordinador
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Acceso exclusivo para personal de coordinación autorizado
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
