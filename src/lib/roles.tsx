import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "docente" | "coordinador";

const ADMIN_KEY = "bausate2026";

interface RoleContextType {
  role: UserRole | null;
  email: string | null;
  isAuthenticated: boolean;
  isDocente: boolean;
  isCoordinador: boolean;
  loginAsDocente: (email: string) => string | null;
  loginAsCoordinador: (key: string) => string | null;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => {
    if (typeof window === "undefined") return null;
    return (sessionStorage.getItem("role") as UserRole) || null;
  });
  const [email, setEmail] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("email") || null;
  });

  const loginAsDocente = (correo: string): string | null => {
    const trimmed = correo.trim().toLowerCase();
    if (!trimmed.endsWith("@bausate.edu.pe")) {
      return "Ingrese un correo institucional válido de la Universidad Jaime Bausate y Meza (@bausate.edu.pe).";
    }
    if (!trimmed.includes("@") || trimmed.split("@")[0].length < 2) {
      return "El correo ingresado no es válido.";
    }
    setRole("docente");
    setEmail(trimmed);
    sessionStorage.setItem("role", "docente");
    sessionStorage.setItem("email", trimmed);
    return null;
  };

  const loginAsCoordinador = (key: string): string | null => {
    if (key !== ADMIN_KEY) {
      return "La clave administrativa ingresada es incorrecta.";
    }
    setRole("coordinador");
    setEmail("coordinacion@bausate.edu.pe");
    sessionStorage.setItem("role", "coordinador");
    sessionStorage.setItem("email", "coordinacion@bausate.edu.pe");
    return null;
  };

  const logout = () => {
    setRole(null);
    setEmail(null);
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        email,
        isAuthenticated: role !== null,
        isDocente: role === "docente",
        isCoordinador: role === "coordinador",
        loginAsDocente,
        loginAsCoordinador,
        logout,
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
