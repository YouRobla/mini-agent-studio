import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Estilos del Markdown de las respuestas. Tailwind quita los estilos por defecto
 * (listas, títulos), así que se recuperan aquí. Heredan el color de la burbuja,
 * por eso funcionan en los dos temas sin CSS propio.
 */
const STYLES = [
  "space-y-2",
  "[&_strong]:font-semibold [&_em]:italic",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
  "[&_h1]:text-lg [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold",
  "[&_a]:link",
  "[&_code]:rounded [&_code]:bg-base-content/10 [&_code]:px-1 [&_code]:text-[0.9em]",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-field [&_pre]:bg-base-content/10 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-base-content/30 [&_blockquote]:pl-3",
  "[&_table]:text-sm [&_th]:border-b [&_th]:border-base-content/20 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_td]:border-b [&_td]:border-base-content/10 [&_td]:px-2 [&_td]:py-1",
].join(" ");

const COMPONENTS: Components = {
  // Las tablas anchas se desplazan dentro de la burbuja en vez de desbordarla.
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
  // Los enlaces de una respuesta se abren aparte, sin dar acceso a esta pestaña.
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

/**
 * Texto en Markdown (el formato en que responden los modelos) convertido en
 * elementos de React con `react-markdown`. No ejecuta HTML: si una respuesta trae
 * etiquetas, se muestran como texto. `remark-gfm` añade tablas, tachado y listas
 * de tareas.
 */
export function Markdown({ text }: { text: string }) {
  return (
    <div className={STYLES}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
