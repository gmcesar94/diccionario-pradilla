// Botones: totalmente redondeados (píldora).
// Área clicable mínima de 48 × 48 px:
// - en pantallas táctiles (pointer: coarse) los controles miden 48 px;
// - con ratón se ven de 40 px y AREA amplía 4 px por lado el área clicable,
//   de forma invisible. Por eso los grupos de controles se separan con gap-2
//   (8 px): así las áreas ampliadas no se solapan.
export const AREA = "relative after:absolute after:-inset-1 after:content-['']"

// Estado pulsado (:active) común a todo lo interactivo.
export const PULSADO = 'active:opacity-70 motion-reduce:transition-none'

export const BOTON = `inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap transition-[color,background-color,opacity] duration-100 sm:px-4 pointer-coarse:h-12 pointer-coarse:text-base ${AREA} ${PULSADO}`
export const ACTIVA = 'border-ink bg-ink text-paper hover:opacity-85'
export const INACTIVA = 'border-ink hover:bg-ink hover:text-paper'

// Variantes para la barra superior, sobre la franja oscura.
export const ACTIVA_OSCURO = 'border-paper bg-paper text-oscuro hover:opacity-85'
export const INACTIVA_OSCURO = 'border-paper/70 text-paper hover:bg-paper hover:text-oscuro'

// Llamada a la acción principal (Colabora), en el verde de la marca.
// Sin contorno sobre la franja oscura (lupa e Índice de la barra): solo Colabora va con fondo.
export const SIN_BORDE_OSCURO = 'border-transparent text-paper hover:bg-paper/15'
export const VERDE = 'border-acento bg-acento text-oscuro hover:opacity-85'

// Botones de la barra fija (Índice, Colabora, Buscar, ✕): más discretos, 36 px de alto
// siempre. La zona táctil invisible llega a 48 px de alto (36 + 6 + 6); a lo ancho, 4 px por lado para no solaparse con 8 px de separación.
export const BOTON_CABECERA = `relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap transition-[color,background-color,opacity] duration-100 after:absolute after:-inset-x-1 after:-inset-y-1.5 after:content-[''] sm:px-3.5 ${PULSADO}`
