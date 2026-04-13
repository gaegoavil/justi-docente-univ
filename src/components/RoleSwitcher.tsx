import { useRole } from "@/lib/roles";
import { LogOut, User, ShieldCheck } from "lucide-react";

export function RoleSwitcher() {
  const { role, email, logout } = useRole();

  if (!role) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs">
        {role === "docente" ? (
          <User className="h-3 w-3" />
        ) : (
          <ShieldCheck className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">{email}</span>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-inherit hover:bg-primary-foreground/10 transition-colors"
      >
        <LogOut className="h-3 w-3" />
        Salir
      </button>
    </div>
  );
}
