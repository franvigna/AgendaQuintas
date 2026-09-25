import type { ReactNode } from "react";
import { useSesion } from "../../hooks/useSesion";
import { PantallaLogin } from "./PantallaLogin";

interface GateProps {
  children: ReactNode;
}

export function Gate({ children }: GateProps) {
  const { autenticado, ingresar } = useSesion();

  if (!autenticado) {
    return <PantallaLogin onIngresar={ingresar} />;
  }

  return <>{children}</>;
}
