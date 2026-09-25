export function esTelefonoValido(telefono: string): boolean {
  return /^\d{10}$/.test(telefono.trim());
}
