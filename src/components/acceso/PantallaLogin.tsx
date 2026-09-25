import { useState } from "react";
import type { FormEvent } from "react";
import "./PantallaLogin.css";

interface PantallaLoginProps {
  onIngresar: (pin: string) => boolean;
}

export function PantallaLogin({ onIngresar }: PantallaLoginProps) {
  const [pin, setPin] = useState("");

  function manejarSubmit(evento: FormEvent<HTMLFormElement>): void {
    evento.preventDefault();
    onIngresar(pin);
  }

  return (
    <div className="pantalla-login">
      <form className="pantalla-login__formulario" onSubmit={manejarSubmit}>
        <h1 className="pantalla-login__titulo">Quinta Serrano</h1>
        <input
          className="pantalla-login__campo"
          type="password"
          inputMode="numeric"
          placeholder="Clave de acceso"
          value={pin}
          onChange={(evento) => setPin(evento.target.value)}
          autoFocus
        />
        <button className="pantalla-login__boton" type="submit">
          Ingresar
        </button>
      </form>
    </div>
  );
}
