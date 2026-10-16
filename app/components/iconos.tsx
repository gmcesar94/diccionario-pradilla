// Iconos compartidos de la interfaz (16 × 16, trazo 1,5).

// ✕ dentro de un círculo: cierra la píldora activa en la que va.
// «invertido»: para píldoras claras sobre la franja oscura (cuadrado oscuro, ✕ clara).
export function Cerrar({ invertido = false }: { invertido?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-5 items-center justify-center rounded-full transition-opacity group-hover:opacity-80 ${
        invertido ? 'bg-oscuro text-paper' : 'bg-paper text-ink'
      }`}
    >
      <svg viewBox="0 0 10 10" className="size-2">
        <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export function IconoIndice() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.75" y="1.75" width="5" height="5" rx="1" />
      <rect x="9.25" y="1.75" width="5" height="5" rx="1" />
      <rect x="1.75" y="9.25" width="5" height="5" rx="1" />
      <rect x="9.25" y="9.25" width="5" height="5" rx="1" />
    </svg>
  )
}

export function Lupa() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0">
      <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ✕ suelta, del tamaño de la lupa: botones de cerrar (buscador desplegado, ventanas en móvil).
export function IconoCerrar() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
