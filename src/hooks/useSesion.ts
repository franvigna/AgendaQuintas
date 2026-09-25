import { useCallback, useState } from "react";

const CLAVE_SESION = "quintaSerrano.autenticado";

function leerAutenticado(): boolean {
  return localStorage.getItem(CLAVE_SESION) === "true";
}

export function useSesion(): {
  autenticado: boolean;
  ingresar: (pin: string) => boolean;
  cerrarSesion: () => void;
} {
  const [autenticado, setAutenticado] = useState(leerAutenticado);

  const ingresar = useCallback((pin: string): boolean => {
    if (pin === import.meta.env.VITE_APP_PIN) {
      localStorage.setItem(CLAVE_SESION, "true");
      setAutenticado(true);
      return true;
    }
    return false;
  }, []);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(CLAVE_SESION);
    setAutenticado(false);
  }, []);

  return { autenticado, ingresar, cerrarSesion };
}
