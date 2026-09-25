import { useState } from "react";
import { Gate } from "./components/acceso/Gate";
import { ConfiguracionQuintas } from "./components/quintas/ConfiguracionQuintas";
import { ListaClientes } from "./components/clientes/ListaClientes";
import { BotonFlotanteNuevaReserva } from "./components/reservas/BotonFlotanteNuevaReserva";
import { ListaProximosAlquileres } from "./components/reservas/ListaProximosAlquileres";

type Pantalla = "calendario" | "quintas" | "clientes" | "reservas";

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("calendario");

  return (
    <Gate>
      {pantalla === "calendario" && (
        <div>
          <p>Calendario (pendiente: módulo Agenda)</p>
          <button onClick={() => setPantalla("quintas")}>Configurar quintas</button>
          <button onClick={() => setPantalla("clientes")}>Clientes</button>
          <button onClick={() => setPantalla("reservas")}>Próximos alquileres</button>
          <BotonFlotanteNuevaReserva />
        </div>
      )}

      {pantalla === "quintas" && (
        <div>
          <button onClick={() => setPantalla("calendario")}>← Volver al calendario</button>
          <ConfiguracionQuintas />
        </div>
      )}

      {pantalla === "clientes" && (
        <div>
          <button onClick={() => setPantalla("calendario")}>← Volver al calendario</button>
          <ListaClientes />
        </div>
      )}

      {pantalla === "reservas" && (
        <div>
          <button onClick={() => setPantalla("calendario")}>← Volver al calendario</button>
          <ListaProximosAlquileres />
        </div>
      )}
    </Gate>
  );
}

export default App;
