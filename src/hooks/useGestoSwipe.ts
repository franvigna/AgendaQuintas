import { useRef } from "react";
import type { TouchEvent } from "react";

export function useGestoSwipe(
  onSwipeIzquierda: () => void,
  onSwipeDerecha: () => void,
  umbralPx = 50,
): {
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
} {
  const inicioX = useRef<number | null>(null);

  function onTouchStart(e: TouchEvent): void {
    inicioX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: TouchEvent): void {
    if (inicioX.current === null) {
      return;
    }
    const distancia = e.changedTouches[0].clientX - inicioX.current;
    if (distancia <= -umbralPx) {
      onSwipeIzquierda();
    } else if (distancia >= umbralPx) {
      onSwipeDerecha();
    }
    inicioX.current = null;
  }

  return { onTouchStart, onTouchEnd };
}
