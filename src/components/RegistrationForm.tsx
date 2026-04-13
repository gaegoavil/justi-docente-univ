import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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

export function RegistrationForm() {
  const { email } = useRole();
  const [submitted, setSubmitted] = useState(false);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([]);
  const [archivoFiles, setArchivoFiles] = useState<File[]>([]);
  const [declaracion, setDeclaracion] = useState(false);
  const [fechaIncidencia, setFechaIncidencia] = useState<Date | undefined>();
  const [fechaRegularizacion, setFechaRegularizacion] = useState<Date | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nombre_completo: "",
    dni_codigo_docente: "",
    correo_institucional: "",
    celular: "",
    facultad_area: "",
    curso_asignatura: "",
    tipo_justificacion: "",
    hora_incidencia: "",
    turno: "",
    modalidad: "",
    sede_aula_enlace: "",
    cantidad_estudiantes_afectados: "",
    descripcion: "",
    motivo_principal: "",
    impacto_academico: "",
    accion_correctiva: "",
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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4"];
    const maxSize = 10 * 1024 * 1024;
    const newFiles: ArchivoAdjunto[] = [];
    const newRawFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type)) continue;
      if (file.size > maxSize) continue;
      newFiles.push({ nombre: file.name, tipo: file.type, tamano: file.size });
      newRawFiles.push(file);
    }
    setArchivos((prev) => [...prev, ...newFiles]);
    setArchivoFiles((prev) => [...prev, ...newRawFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeFile = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
    setArchivoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4"];
    const maxSize = 10 * 1024 * 1024;
    const newFiles: ArchivoAdjunto[] = [];
    const newRawFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type) || file.size > maxSize) continue;
      newFiles.push({ nombre: file.name, tipo: file.type, tamano: file.size });
      newRawFiles.push(file);
    }
    setArchivos((prev) => [...prev, ...newFiles]);
    setArchivoFiles((prev) => [...prev, ...newRawFiles]);
  }, []);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.nombre_completo.trim()) e.nombre_completo = "Campo obligatorio";
    if (!form.dni_codigo_docente.trim()) e.dni_codigo_docente = "Campo obligatorio";
    else if (form.dni_codigo_docente.length < 6) e.dni_codigo_docente = "Mínimo 6 caracteres";
    if (!form.correo_institucional.trim()) e.correo_institucional = "Campo obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo_institucional)) e.correo_institucional = "Correo inválido";
    if (!form.celular.trim()) e.celular = "Campo obligatorio";
    if (!form.facultad_area.trim()) e.facultad_area = "Campo obligatorio";
    if (!form.curso_asignatura.trim()) e.curso_asignatura = "Campo obligatorio";
    if (!form.tipo_justificacion) e.tipo_justificacion = "Seleccione un tipo";
    if (!fechaIncidencia) e.fecha_incidencia = "Seleccione una fecha";
    if (!form.hora_incidencia) e.hora_incidencia = "Campo obligatorio";
    if (!form.turno) e.turno = "Seleccione un turno";
    if (!form.modalidad) e.modalidad = "Seleccione modalidad";
    if (!form.descripcion.trim()) e.descripcion = "Campo obligatorio";
    else if (form.descripcion.length < 20) e.descripcion = "Mínimo 20 caracteres";
    if (!form.motivo_principal.trim()) e.motivo_principal = "Campo obligatorio";
    if (!declaracion) e.declaracion = "Debe aceptar la declaración";
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

      // Subir archivo si existe y Supabase está configurado
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
        const correoDocente = email || form.correo_institucional;
        const result = await crearJustificacion({
          codigo_seguimiento: codigo,
          correo_docente: correoDocente.toLowerCase(),
          nombre_completo: form.nombre_completo,
          dni_codigo_docente: form.dni_codigo_docente,
          celular: form.celular,
          facultad_area: form.facultad_area,
          curso_asignatura: form.curso_asignatura,
          tipo_justificacion: form.tipo_justificacion as any,
          fecha_incidencia: fechaIncidencia!.toISOString().split("T")[0],
          hora_incidencia: form.hora_incidencia,
          turno: form.turno,
          modalidad: form.modalidad,
          sede_aula_enlace: form.sede_aula_enlace || null,
          cantidad_estudiantes_afectados: form.cantidad_estudiantes_afectados
            ? parseInt(form.cantidad_estudiantes_afectados)
            : null,
          descripcion: form.descripcion,
          motivo_principal: form.motivo_principal,
          impacto_academico: form.impacto_academico || null,
          accion_correctiva: form.accion_correctiva || null,
          fecha_regularizacion: fechaRegularizacion
            ? fechaRegularizacion.toISOString().split("T")[0]
            : null,
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
            correo_institucional: "",
            celular: "",
            facultad_area: "",
            curso_asignatura: "",
            tipo_justificacion: "",
            hora_incidencia: "",
            turno: "",
            modalidad: "",
            sede_aula_enlace: "",
            cantidad_estudiantes_afectados: "",
            descripcion: "",
            motivo_principal: "",
            impacto_academico: "",
            accion_correctiva: "",
          });
          setArchivos([]);
          setArchivoFiles([]);
          setDeclaracion(false);
          setFechaIncidencia(undefined);
          setFechaRegularizacion(undefined);
          setErrors({});
        }}
      />
    );
  }

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-sm text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="h-3.5 w-3.5" /> {errors[field]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SECCIÓN A */}
      <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">A</div>
          <h2 className="text-xl font-bold text-foreground">Datos del Docente</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input id="nombre" value={form.nombre_completo} onChange={(e) => updateField("nombre_completo", e.target.value)} placeholder="Ej: Juan Carlos Pérez López" className={errors.nombre_completo ? "border-destructive" : ""} />
            <FieldError field="nombre_completo" />
          </div>
          <div>
            <Label htmlFor="dni">DNI o código de docente *</Label>
            <Input id="dni" value={form.dni_codigo_docente} onChange={(e) => updateField("dni_codigo_docente", e.target.value)} placeholder="Ej: 45678901" className={errors.dni_codigo_docente ? "border-destructive" : ""} />
            <FieldError field="dni_codigo_docente" />
          </div>
          <div>
            <Label htmlFor="correo">Correo institucional *</Label>
            <Input id="correo" type="email" value={form.correo_institucional} onChange={(e) => updateField("correo_institucional", e.target.value)} placeholder="correo@bausate.edu.pe" className={errors.correo_institucional ? "border-destructive" : ""} />
            <FieldError field="correo_institucional" />
          </div>
          <div>
            <Label htmlFor="celular">Número de celular *</Label>
            <Input id="celular" value={form.celular} onChange={(e) => updateField("celular", e.target.value)} placeholder="Ej: 987654321" className={errors.celular ? "border-destructive" : ""} />
            <FieldError field="celular" />
          </div>
          <div>
            <Label htmlFor="facultad">Facultad / Escuela / Área *</Label>
            <Input id="facultad" value={form.facultad_area} onChange={(e) => updateField("facultad_area", e.target.value)} placeholder="Ej: Facultad de Periodismo" className={errors.facultad_area ? "border-destructive" : ""} />
            <FieldError field="facultad_area" />
          </div>
          <div>
            <Label htmlFor="curso">Curso o asignatura *</Label>
            <Input id="curso" value={form.curso_asignatura} onChange={(e) => updateField("curso_asignatura", e.target.value)} placeholder="Ej: Periodismo Digital I" className={errors.curso_asignatura ? "border-destructive" : ""} />
            <FieldError field="curso_asignatura" />
          </div>
        </div>
      </div>

      {/* SECCIÓN B */}
      <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">B</div>
          <h2 className="text-xl font-bold text-foreground">Datos de la Incidencia</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label>Tipo de justificación *</Label>
            <Select value={form.tipo_justificacion} onValueChange={(v) => updateField("tipo_justificacion", v)}>
              <SelectTrigger className={errors.tipo_justificacion ? "border-destructive" : ""}><SelectValue placeholder="Seleccione tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tardanza">Tardanza</SelectItem>
                <SelectItem value="inasistencia">Inasistencia</SelectItem>
                <SelectItem value="incumplimiento">Incumplimiento</SelectItem>
                <SelectItem value="permiso">Permiso</SelectItem>
                <SelectItem value="reprogramacion">Reprogramación</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            <FieldError field="tipo_justificacion" />
          </div>
          <div>
            <Label>Fecha de la incidencia *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !fechaIncidencia && "text-muted-foreground", errors.fecha_incidencia && "border-destructive")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaIncidencia ? fechaIncidencia.toLocaleDateString("es-PE") : "Seleccione fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={fechaIncidencia} onSelect={(d) => { setFechaIncidencia(d); if (errors.fecha_incidencia) { setErrors((p) => { const n = {...p}; delete n.fecha_incidencia; return n; }); }}} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <FieldError field="fecha_incidencia" />
          </div>
          <div>
            <Label htmlFor="hora">Hora de la incidencia *</Label>
            <Input id="hora" type="time" value={form.hora_incidencia} onChange={(e) => updateField("hora_incidencia", e.target.value)} className={errors.hora_incidencia ? "border-destructive" : ""} />
            <FieldError field="hora_incidencia" />
          </div>
          <div>
            <Label>Turno *</Label>
            <Select value={form.turno} onValueChange={(v) => updateField("turno", v)}>
              <SelectTrigger className={errors.turno ? "border-destructive" : ""}><SelectValue placeholder="Seleccione turno" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mañana">Mañana</SelectItem>
                <SelectItem value="tarde">Tarde</SelectItem>
                <SelectItem value="noche">Noche</SelectItem>
              </SelectContent>
            </Select>
            <FieldError field="turno" />
          </div>
          <div>
            <Label>Modalidad *</Label>
            <Select value={form.modalidad} onValueChange={(v) => updateField("modalidad", v)}>
              <SelectTrigger className={errors.modalidad ? "border-destructive" : ""}><SelectValue placeholder="Seleccione modalidad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="semipresencial">Semipresencial</SelectItem>
              </SelectContent>
            </Select>
            <FieldError field="modalidad" />
          </div>
          <div>
            <Label htmlFor="sede">Sede, aula o enlace virtual</Label>
            <Input id="sede" value={form.sede_aula_enlace} onChange={(e) => updateField("sede_aula_enlace", e.target.value)} placeholder="Ej: Aula 301 / Zoom" />
          </div>
          <div>
            <Label htmlFor="estudiantes">Estudiantes afectados (opcional)</Label>
            <Input id="estudiantes" type="number" min={0} value={form.cantidad_estudiantes_afectados} onChange={(e) => updateField("cantidad_estudiantes_afectados", e.target.value)} placeholder="Ej: 35" />
          </div>
        </div>
      </div>

      {/* SECCIÓN C */}
      <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">C</div>
          <h2 className="text-xl font-bold text-foreground">Descripción y Sustento</h2>
        </div>
        <div className="space-y-5">
          <div>
            <Label htmlFor="descripcion">Descripción detallada *</Label>
            <Textarea id="descripcion" rows={4} value={form.descripcion} onChange={(e) => updateField("descripcion", e.target.value)} placeholder="Describa con detalle la incidencia ocurrida..." className={errors.descripcion ? "border-destructive" : ""} />
            <div className="flex justify-between mt-1">
              <FieldError field="descripcion" />
              <span className="text-xs text-muted-foreground">{form.descripcion.length} caracteres</span>
            </div>
          </div>
          <div>
            <Label htmlFor="motivo">Motivo principal *</Label>
            <Input id="motivo" value={form.motivo_principal} onChange={(e) => updateField("motivo_principal", e.target.value)} placeholder="Ej: Emergencia médica personal" className={errors.motivo_principal ? "border-destructive" : ""} />
            <FieldError field="motivo_principal" />
          </div>
          <div>
            <Label htmlFor="impacto">Impacto académico o administrativo</Label>
            <Textarea id="impacto" rows={2} value={form.impacto_academico} onChange={(e) => updateField("impacto_academico", e.target.value)} placeholder="Describa el impacto generado..." />
          </div>
          <div>
            <Label htmlFor="correctiva">Acción correctiva propuesta</Label>
            <Textarea id="correctiva" rows={2} value={form.accion_correctiva} onChange={(e) => updateField("accion_correctiva", e.target.value)} placeholder="Ej: Clase de recuperación programada para..." />
          </div>
          <div>
            <Label>Fecha estimada de regularización (si aplica)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !fechaRegularizacion && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaRegularizacion ? fechaRegularizacion.toLocaleDateString("es-PE") : "Seleccione fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={fechaRegularizacion} onSelect={setFechaRegularizacion} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* SECCIÓN D */}
      <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">D</div>
          <h2 className="text-xl font-bold text-foreground">Evidencias</h2>
        </div>
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-semibold mb-1">Arrastre archivos aquí o haga clic para seleccionar</p>
          <p className="text-sm text-muted-foreground">JPG, PNG, PDF, MP4 — Máximo 10 MB por archivo</p>
          <input ref={fileInputRef} type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4" onChange={handleFileChange} />
        </div>
        {archivos.length > 0 && (
          <div className="mt-4 space-y-2">
            {archivos.map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-surface rounded-lg px-4 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{a.nombre}</span>
                  <span className="text-muted-foreground">({(a.tamano / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN E */}
      <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">E</div>
          <h2 className="text-xl font-bold text-foreground">Declaración Jurada</h2>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox id="declaracion" checked={declaracion} onCheckedChange={(checked) => { setDeclaracion(!!checked); if (errors.declaracion) { setErrors((p) => { const n = {...p}; delete n.declaracion; return n; }); }}} className={errors.declaracion ? "border-destructive" : ""} />
          <label htmlFor="declaracion" className="text-sm text-foreground/80 leading-relaxed cursor-pointer font-[family-name:var(--font-body)]">
            Declaro que la información registrada y los archivos adjuntos son verídicos y corresponden a la incidencia reportada. Asumo la responsabilidad sobre la veracidad de los datos proporcionados.
          </label>
        </div>
        <FieldError field="declaracion" />
      </div>

      {submitError && (
        <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex justify-center">
        <Button type="submit" size="xl" className="w-full md:w-auto" disabled={submitting}>
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
