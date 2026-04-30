import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type ArchivoAdjunto } from "@/lib/justificacion";
import { ConfirmationView } from "@/components/ConfirmationView";
import { useRole } from "@/lib/roles";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import {
  generarCodigoSeguimientoUnico,
  crearJustificacion,
  subirEvidencia,
} from "@/lib/supabase-service";
import { generarCodigoSeguimiento } from "@/lib/justificacion";

interface FormErrors {
  [key: string]: string;
}

const ESCUELAS = [
  "Periodismo",
  "Comunicación Audiovisual",
  "Administración",
  "Contabilidad",
  "Ingeniería Informática – Sistemas de Información",
];

export function RegistrationForm() {
  const { email } = useRole();
  const [submitted, setSubmitted] = useState(false);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([]);
  const [archivoFiles, setArchivoFiles] = useState<File[]>([]);
  const [fechaIncidencia, setFechaIncidencia] = useState<Date | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

const [form, setForm] = useState({
  nombre_completo: "",
  dni_codigo_docente: "",
  correo_institucional: email || "",
  celular: "",
  facultad_area: "",
  curso_asignatura: "",
  tipo_justificacion: "",
  hora_incidencia: "",
  modalidad: "",
  descripcion: "",
});

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "video/mp4",
      ];
      const maxSize = 10 * 1024 * 1024;

      const newFiles: ArchivoAdjunto[] = [];
      const newRawFiles: File[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!validTypes.includes(file.type)) continue;
        if (file.size > maxSize) continue;

        newFiles.push({
          nombre: file.name,
          tipo: file.type,
          tamano: file.size,
        });
        newRawFiles.push(file);
      }

      setArchivos((prev) => [...prev, ...newFiles]);
      setArchivoFiles((prev) => [...prev, ...newRawFiles]);

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [],
  );

  const removeFile = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
    setArchivoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    const files = e.dataTransfer.files;
    if (!files.length) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "video/mp4",
    ];
    const maxSize = 10 * 1024 * 1024;

    const newFiles: ArchivoAdjunto[] = [];
    const newRawFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type) || file.size > maxSize) continue;

      newFiles.push({
        nombre: file.name,
        tipo: file.type,
        tamano: file.size,
      });
      newRawFiles.push(file);
    }

    setArchivos((prev) => [...prev, ...newFiles]);
    setArchivoFiles((prev) => [...prev, ...newRawFiles]);
  }, []);

  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!form.nombre_completo.trim()) e.nombre_completo = "Campo obligatorio";

    if (!form.dni_codigo_docente.trim()) {
      e.dni_codigo_docente = "Campo obligatorio";
    } else if (form.dni_codigo_docente.length < 6) {
      e.dni_codigo_docente = "Mínimo 6 caracteres";
    }

    if (!form.correo_institucional.trim()) {
      e.correo_institucional = "Campo obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo_institucional)) {
      e.correo_institucional = "Correo inválido";
    }

    if (!form.celular.trim()) e.celular = "Campo obligatorio";
    if (!form.facultad_area.trim()) e.facultad_area = "Campo obligatorio";
    if (!form.curso_asignatura.trim()) e.curso_asignatura = "Campo obligatorio";
    if (!form.tipo_justificacion)
      e.tipo_justificacion = "Seleccione un tipo";
    if (!fechaIncidencia) e.fecha_incidencia = "Seleccione una fecha";
    if (!form.hora_incidencia) e.hora_incidencia = "Campo obligatorio";
    if (!form.modalidad) e.modalidad = "Seleccione modalidad";

    if (!form.descripcion.trim()) {
      e.descripcion = "Campo obligatorio";
    } else if (form.descripcion.trim().length < 10) {
      e.descripcion = "Mínimo 10 caracteres";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const codigo = isSupabaseConfigured()
        ? await generarCodigoSeguimientoUnico()
        : generarCodigoSeguimiento();

      let archivoUrl: string | null = null;
      let archivoPath: string | null = null;
      let archivoTipo: string | null = null;

      if (archivoFiles.length > 0 && isSupabaseConfigured()) {
        const file = archivoFiles[0];
        const result = await subirEvidencia(file, codigo);

        if (result.error) {
          setSubmitError(`Error al subir archivo: ${result.error}`);
          setSubmitting(false);
          return;
        }

        archivoUrl = result.url;
        archivoPath = result.path;
        archivoTipo = file.type;
      }

      if (isSupabaseConfigured()) {
        const correoDocente = (email || form.correo_institucional).toLowerCase();

        const result = await crearJustificacion({
          codigo_seguimiento: codigo,
          correo_docente: correoDocente,
          nombre_completo: form.nombre_completo,
          dni_codigo_docente: form.dni_codigo_docente,
          celular: form.celular,
          facultad_area: form.facultad_area,
          curso_asignatura: form.curso_asignatura,
          tipo_justificacion: form.tipo_justificacion as any,
          fecha_incidencia: fechaIncidencia!.toISOString().split("T")[0],
hora_incidencia: form.hora_incidencia,
turno: "no especificado",
modalidad: form.modalidad,
sede_aula_enlace: null,
          cantidad_estudiantes_afectados: null,
          descripcion: form.descripcion,
          motivo_principal: form.descripcion,
          impacto_academico: null,
          accion_correctiva: null,
          fecha_regularizacion: null,
          archivo_url: archivoUrl,
          archivo_path: archivoPath,
          archivo_tipo: archivoTipo,
        });

        if (result.error) {
          setSubmitError(`Error al guardar: ${result.error}`);
          setSubmitting(false);
          return;
        }
      }

      setCodigoSeguimiento(codigo);
      setSubmitted(true);
    } catch (err) {
      setSubmitError("Ocurrió un error inesperado. Intente nuevamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <ConfirmationView
        codigo={codigoSeguimiento}
        nombre={form.nombre_completo}
        tipo={form.tipo_justificacion}
        fecha={fechaIncidencia?.toLocaleDateString("es-PE") || ""}
        onReset={() => {
          setSubmitted(false);
          setForm({
  nombre_completo: "",
  dni_codigo_docente: "",
  correo_institucional: email || "",
  celular: "",
  facultad_area: "",
  curso_asignatura: "",
  tipo_justificacion: "",
  hora_incidencia: "",
  modalidad: "",
  descripcion: "",
});
          setArchivos([]);
          setArchivoFiles([]);
          setFechaIncidencia(undefined);
          setErrors({});
        }}
      />
    );
  }

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
        <AlertCircle className="h-3.5 w-3.5" /> {errors[field]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SECCIÓN A */}
      <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            A
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Datos del Docente
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={form.nombre_completo}
              onChange={(e) => updateField("nombre_completo", e.target.value)}
              placeholder="Ej: Juan Carlos Pérez López"
              className={errors.nombre_completo ? "border-destructive" : ""}
            />
            <FieldError field="nombre_completo" />
          </div>

          <div>
            <Label htmlFor="dni">DNI *</Label>
            <Input
              id="dni"
              value={form.dni_codigo_docente}
              onChange={(e) =>
                updateField("dni_codigo_docente", e.target.value)
              }
              placeholder="Ej: 45678901"
              className={errors.dni_codigo_docente ? "border-destructive" : ""}
            />
            <FieldError field="dni_codigo_docente" />
          </div>

          <div>
            <Label htmlFor="correo">Correo institucional *</Label>
            <Input
              id="correo"
              type="email"
              value={email || form.correo_institucional}
              onChange={(e) =>
                updateField("correo_institucional", e.target.value)
              }
              placeholder="correo@bausate.edu.pe"
              disabled={!!email}
              className={errors.correo_institucional ? "border-destructive" : ""}
            />
            <FieldError field="correo_institucional" />
          </div>

          <div>
            <Label htmlFor="celular">Número de celular *</Label>
            <Input
              id="celular"
              value={form.celular}
              onChange={(e) => updateField("celular", e.target.value)}
              placeholder="Ej: 987654321"
              className={errors.celular ? "border-destructive" : ""}
            />
            <FieldError field="celular" />
          </div>

          <div>
            <Label>Escuela *</Label>
            <Select
              value={form.facultad_area}
              onValueChange={(v) => updateField("facultad_area", v)}
            >
              <SelectTrigger
                className={errors.facultad_area ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Seleccione escuela" />
              </SelectTrigger>
              <SelectContent>
                {ESCUELAS.map((escuela) => (
                  <SelectItem key={escuela} value={escuela}>
                    {escuela}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError field="facultad_area" />
          </div>

          <div>
            <Label htmlFor="curso">Asignatura *</Label>
            <Input
              id="curso"
              value={form.curso_asignatura}
              onChange={(e) =>
                updateField("curso_asignatura", e.target.value)
              }
              placeholder="Ej: Periodismo Digital I"
              className={errors.curso_asignatura ? "border-destructive" : ""}
            />
            <FieldError field="curso_asignatura" />
          </div>
        </div>
      </div>

      {/* SECCIÓN B */}
      <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            B
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Datos de la Incidencia
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label>Tipo de justificación *</Label>
            <Select
              value={form.tipo_justificacion}
              onValueChange={(v) => updateField("tipo_justificacion", v)}
            >
              <SelectTrigger
                className={
                  errors.tipo_justificacion ? "border-destructive" : ""
                }
              >
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tardanza">Tardanza</SelectItem>
                <SelectItem value="inasistencia">Inasistencia</SelectItem>
              </SelectContent>
            </Select>
            <FieldError field="tipo_justificacion" />
          </div>

          <div>
            <Label>Fecha de la incidencia *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fechaIncidencia && "text-muted-foreground",
                    errors.fecha_incidencia && "border-destructive",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaIncidencia
                    ? fechaIncidencia.toLocaleDateString("es-PE")
                    : "Seleccione fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaIncidencia}
                  onSelect={(d) => {
                    setFechaIncidencia(d);
                    if (errors.fecha_incidencia) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.fecha_incidencia;
                        return next;
                      });
                    }
                  }}
                  className="pointer-events-auto p-3"
                />
              </PopoverContent>
            </Popover>
            <FieldError field="fecha_incidencia" />
          </div>

          <div>
            <Label htmlFor="hora">Hora de la incidencia *</Label>
            <Input
              id="hora"
              type="time"
              value={form.hora_incidencia}
              onChange={(e) => updateField("hora_incidencia", e.target.value)}
              className={errors.hora_incidencia ? "border-destructive" : ""}
            />
            <FieldError field="hora_incidencia" />
          </div>

         <div>
  <Label htmlFor="aula">Aula</Label>
  <Input
    id="aula"
    value={form.sede_aula_enlace}
    onChange={(e) => updateField("sede_aula_enlace", e.target.value)}
    placeholder="Ej: Aula 301"
  />
</div>

          <div>
            <Label>Modalidad *</Label>
            <Select
              value={form.modalidad}
              onValueChange={(v) => updateField("modalidad", v)}
            >
              <SelectTrigger
                className={errors.modalidad ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Seleccione modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="semipresencial">Semipresencial</SelectItem>
              </SelectContent>
            </Select>
            <FieldError field="modalidad" />
          </div>

          <div>
            <Label htmlFor="aula">Aula</Label>
            <Input
              id="aula"
              value={form.sede_aula_enlace}
              onChange={(e) => updateField("sede_aula_enlace", e.target.value)}
              placeholder="Ej: Aula 301"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN C */}
      <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            C
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Descripción y Sustento
          </h2>
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="descripcion">Descripción de lo sucedido *</Label>
            <Textarea
              id="descripcion"
              rows={4}
              value={form.descripcion}
              onChange={(e) => updateField("descripcion", e.target.value)}
              placeholder="Describa brevemente lo sucedido..."
              className={errors.descripcion ? "border-destructive" : ""}
            />
            <div className="mt-1 flex justify-between">
              <FieldError field="descripcion" />
              <span className="text-xs text-muted-foreground">
                {form.descripcion.length} caracteres
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN D */}
      <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            D
          </div>
          <h2 className="text-xl font-bold text-foreground">Evidencias</h2>
        </div>

        <div
          className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="mb-1 font-semibold text-foreground">
            Arrastre archivos aquí o haga clic para seleccionar
          </p>
          <p className="text-sm text-muted-foreground">
            JPG, PNG, PDF, MP4 — Máximo 10 MB por archivo
          </p>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4"
            onChange={handleFileChange}
          />
        </div>

        {archivos.length > 0 && (
          <div className="mt-4 space-y-2">
            {archivos.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-surface px-4 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{a.nombre}</span>
                  <span className="text-muted-foreground">
                    ({(a.tamano / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {submitError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          type="submit"
          size="xl"
          className="w-full md:w-auto"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          {submitting ? "Enviando..." : "Enviar justificación"}
        </Button>
      </div>
    </form>
  );
}
