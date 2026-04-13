import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "docente" | "coordinador";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isDocente: boolean;
  isCoordinador: boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("docente");

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isDocente: role === "docente",
        isCoordinador: role === "coordinador",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
