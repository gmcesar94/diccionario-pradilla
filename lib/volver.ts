import type { useRouter } from 'next/navigation'

// Pila de «de dónde venías» para las palabras enlazadas: al tocar «mies» en la
// definición de Parva se abre solo Mies, y la ✕ devuelve al listado en el mismo punto.
// Se pueden encadenar (mies → otra → …): cada ✕ deshace un paso.
// En sessionStorage: sobrevive a recargas de la pestaña y no se comparte entre pestañas.
const CLAVE = 'pradilla:volver'

interface Paso {
  // Vista desde la que se tocó el enlace y su posición de scroll.
  desde: string
  y: number
  // Vista que abrió el enlace: solo se vuelve si estás en ella.
  hacia: string
}

function leer(): Paso[] {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE) ?? '[]')
  } catch {
    return []
  }
}

function escribir(pila: Paso[]) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(pila.slice(-20)))
  } catch {}
}

const actual = () => window.location.pathname + window.location.search

export function guardarPosicion(hacia: string) {
  escribir([...leer(), { desde: actual(), y: window.scrollY, hacia }])
}

// Cierra la palabra abierta. Si se llegó por un enlace, vuelve atrás en el historial
// (como el botón del navegador) y recupera el scroll; si no (enlace compartido,
// palabra del día), va al listado completo.
export function volver(router: ReturnType<typeof useRouter>) {
  const pila = leer()
  const i = pila.findLastIndex((paso) => paso.hacia === actual())
  if (i === -1) {
    router.push('/')
    return
  }
  const { y } = pila[i]
  escribir(pila.slice(0, i))
  window.addEventListener(
    'popstate',
    () => {
      // El listado tarda un instante en pintarse: se repite hasta que la página es lo bastante alta.
      let intentos = 0
      const recolocar = () => {
        window.scrollTo({ top: y, behavior: 'instant' })
        if (Math.abs(window.scrollY - y) > 2 && ++intentos < 20) setTimeout(recolocar, 50)
      }
      requestAnimationFrame(recolocar)
    },
    { once: true }
  )
  router.back()
}
