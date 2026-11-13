/**
 * Inicial del agente con el `avatar` de daisyUI (variante sin imagen), en un
 * recuadro claro con borde. Es decorativa para los lectores de pantalla.
 */
export function AgentAvatar({ name }: { name: string }) {
  return (
    <div className="avatar avatar-placeholder shrink-0" aria-hidden="true">
      <div className="w-9 rounded-field border border-base-300 bg-base-200 text-base-content">
        <span className="text-sm font-semibold">
          {name.slice(0, 1).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
