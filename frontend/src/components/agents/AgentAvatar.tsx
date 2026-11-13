/** Inicial del agente en un recuadro; decorativo para lectores de pantalla. */
export function AgentAvatar({ name }: { name: string }) {
  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-field border border-base-300 bg-base-200 text-sm font-semibold"
      aria-hidden="true"
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
