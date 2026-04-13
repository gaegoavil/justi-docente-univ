import { useRole, type UserRole } from "@/lib/roles";
import { User, ShieldCheck } from "lucide-react";

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
      <RoleButton
        active={role === "docente"}
        onClick={() => setRole("docente")}
        icon={<User className="h-3 w-3" />}
        label="Docente"
      />
      <RoleButton
        active={role === "coordinador"}
        onClick={() => setRole("coordinador")}
        icon={<ShieldCheck className="h-3 w-3" />}
        label="Coordinador"
      />
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
        active
          ? "bg-background text-primary shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
