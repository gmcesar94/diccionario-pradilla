import type { Palabra } from '@/lib/types'

// Una fila del listado: lema a la izquierda; etimología, acepciones,
// ejemplos y sinónimos a la derecha.
export default function Entrada({ palabra }: { palabra: Palabra }) {
  const numeradas = palabra.acepciones.length > 1

  return (
    <article
      id={palabra.slug}
      className="scroll-mt-[calc(var(--alto-cabecera)+4rem)] border-b border-rule px-5 py-5 md:grid md:grid-cols-[12rem_1fr] md:gap-6 md:px-6"
    >
      <h2 className="text-lg font-bold leading-snug">{palabra.palabra}</h2>

      <div className="mt-1.5 max-w-[60ch] text-[0.9375rem] leading-relaxed md:mt-0.5">
        {palabra.etimologia && <p className="mb-1.5 text-muted">{palabra.etimologia}</p>}

        <ol className={numeradas ? 'list-decimal space-y-1.5 pl-5 marker:text-muted' : ''}>
          {palabra.acepciones.map((acep) => (
            <li key={acep.id}>
              {acep.categoria_gramatical && (
                <span className="text-muted">{acep.categoria_gramatical} </span>
              )}
              {acep.definicion}
              {acep.ejemplo && <p className="italic text-muted">«{acep.ejemplo}»</p>}
              {acep.sinonimos && acep.sinonimos.length > 0 && (
                <p className="mt-0.5 text-xs text-muted">Sin.: {acep.sinonimos.join(', ')}.</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </article>
  )
}
