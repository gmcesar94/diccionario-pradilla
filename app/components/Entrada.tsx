import { slugify } from '@/lib/normalizar'
import type { Palabra } from '@/lib/types'

// Una fila del listado: lema (serif) a la izquierda; etimología, acepciones,
// ejemplos y sinónimos a la derecha. En escritorio, la misma rejilla que la cabecera:
// el lema bajo el buscador y la definición bajo las letras (empieza en «Todas»).
// - nivel: h3 bajo los separadores de letra del listado; h2 donde no los hay.
// - slugs: palabras del diccionario; las que aparecen en definiciones y sinónimos se enlazan.
export default function Entrada({
  palabra,
  nivel = 2,
  slugs,
  destacada = false,
}: {
  palabra: Palabra
  nivel?: 2 | 3
  slugs?: Set<string>
  destacada?: boolean
}) {
  const numeradas = palabra.acepciones.length > 1
  const Titulo = nivel === 3 ? 'h3' : 'h2'

  return (
    <article
      id={palabra.slug}
      className={`scroll-mt-[calc(var(--alto-cabecera)+0.5rem)] md:scroll-mt-[calc(var(--alto-cabecera)+var(--alto-indice)+4px)] border-b border-rule px-margen py-6 transition-colors duration-700 motion-reduce:transition-none ${destacada ? 'bg-ink/5' : ''} md:grid md:grid-cols-[12rem_1fr] md:gap-6 lg:grid-cols-[minmax(0,1fr)_var(--ancho-letras)] lg:gap-10 lg:py-10`}
    >
      <Titulo className="font-serif text-[1.75rem] leading-tight lg:text-4xl">{palabra.palabra}</Titulo>

      <div className="mt-2 max-w-[60ch] text-[0.9375rem] leading-relaxed md:mt-1.5 lg:text-base">
        {palabra.etimologia && <p className="mb-1.5 text-muted">{palabra.etimologia}</p>}

        <ol className={numeradas ? 'list-decimal space-y-1.5 pl-5 marker:text-muted' : ''}>
          {palabra.acepciones.map((acep) => (
            <li key={acep.id}>
              {acep.categoria_gramatical && <span className="text-muted">{acep.categoria_gramatical} </span>}
              <TextoEnlazado texto={acep.definicion} slugs={slugs} propio={palabra.slug} />
              {/* Un ejemplo por línea */}
              {acep.ejemplo?.split('\n').map((ejemplo) => (
                <p key={ejemplo} className="italic text-muted">
                  «{ejemplo}»
                </p>
              ))}
              {acep.sinonimos && acep.sinonimos.length > 0 && (
                <p className="mt-0.5 text-xs text-muted">
                  Sin.:{' '}
                  {acep.sinonimos.map((sinonimo, i) => (
                    <span key={sinonimo}>
                      {i > 0 && ', '}
                      <Sinonimo texto={sinonimo} existe={slugs?.has(slugify(sinonimo)) ?? false} />
                    </span>
                  ))}
                  .
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </article>
  )
}

// Palabras de una definición que son entradas del diccionario («mies» en Parva):
// se enlazan a su entrada. Nunca a la propia palabra que se está definiendo.
function TextoEnlazado({ texto, slugs, propio }: { texto: string; slugs?: Set<string>; propio: string }) {
  if (!slugs) return <>{texto}</>
  // Separa palabras (letras, con tildes y ñ) del resto (espacios, signos), conservando todo.
  return (
    <>
      {texto.split(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)/).map((trozo, i) => {
        const slug = i % 2 === 1 ? slugify(trozo) : ''
        if (!slug || slug === propio || !slugs.has(slug)) return trozo
        return <Enlace key={i} slug={slug} texto={trozo} />
      })}
    </>
  )
}

// Si el sinónimo es una palabra del diccionario, enlaza a su entrada en el listado.
// Es un enlace dentro del texto: no se amplía a 48 px (excepción de WCAG para enlaces en línea).
// <a> y no <Link>: navegación normal, así el listado lee el #palabra al cargar y la resalta.
function Sinonimo({ texto, existe }: { texto: string; existe: boolean }) {
  if (!existe) return <>{texto}</>
  return <Enlace slug={slugify(texto)} texto={texto} />
}

function Enlace({ slug, texto }: { slug: string; texto: string }) {
  return (
    <a
      href={`/#${slug}`}
      className="text-ink underline underline-offset-2 transition-opacity hover:no-underline active:opacity-70"
    >
      {texto}
    </a>
  )
}
