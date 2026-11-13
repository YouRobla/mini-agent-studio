/** Inicial del agente con el `avatar` de daisyUI; decorativa para lectores de pantalla. */
export function AgentAvatar({ name }: { name: string }) {
  return (
    <div className="avatar avatar-placeholder" aria-hidden="true">
      <div className="w-9 rounded-field bg-neutral text-neutral-content">
        <span className="text-sm font-semibold">
          {name.slice(0, 1).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
