'use client'

import { useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { IconoCerrar } from '@/app/components/iconos'
import { AREA, PULSADO } from '@/lib/estilos'

// Estado de la búsqueda. Escribe la consulta en la URL (?q=) para que el
// listado se filtre y la búsqueda se pueda compartir.
export function useBusqueda(): [string, (texto: string) => void] {
  const router = useRouter()
  const ruta = usePathname()
  const q = useSearchParams().get('q') ?? ''
  const [valor, setValor] = useState(q)
  const [qAnterior, setQAnterior] = useState(q)

  // Si la URL cambia desde fuera (p. ej. al pulsar «Listado»), el campo se actualiza.
  if (q !== qAnterior) {
    setQAnterior(q)
    setValor(q)
  }

  function buscar(texto: string) {
    setValor(texto)
    const destino = texto.trim() ? `/?q=${encodeURIComponent(texto)}` : '/'
    // En el listado se sustituye la URL; desde otras vistas se navega a él.
    if (ruta === '/') router.replace(destino, { scroll: false })
    else router.push(destino)
  }

  return [valor, buscar]
}

export function CampoBusqueda({
  valor,
  onChange,
  autoFocus,
}: {
  valor: string
  onChange?: (texto: string) => void
  autoFocus?: boolean
}) {
  const campo = useRef<HTMLInputElement>(null)
  return (
    <label
      className={`${AREA} flex h-11 min-w-0 flex-1 lg:h-9 cursor-text items-center gap-2 rounded-full border border-ink bg-campo px-4 text-sm text-ink focus-within:ring-1 focus-within:ring-ink focus-within:ring-inset pointer-coarse:text-base`}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0 text-muted">
        <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        ref={campo}
        type="search"
        aria-label="Buscar una palabra"
        placeholder="Buscar una palabra…"
        value={valor}
        readOnly={!onChange}
        autoFocus={autoFocus}
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onChange?.(e.target.value)}
        // Sin la ✕ nativa del navegador (cada uno la pinta distinta): va la nuestra.
        className="h-full w-full min-w-0 bg-transparent placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      {valor && onChange && (
        <button
          type="button"
          aria-label="Borrar la búsqueda"
          onClick={(e) => {
            e.preventDefault()
            onChange('')
            campo.current?.focus()
          }}
          // relative z-10: por encima de la zona táctil ampliada del campo (AREA), que si no se queda el clic.
          className={`relative z-10 -mr-2.5 flex size-9 shrink-0 lg:-mr-3 lg:size-8 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/10 ${PULSADO}`}
        >
          <IconoCerrar />
        </button>
      )}
    </label>
  )
}
