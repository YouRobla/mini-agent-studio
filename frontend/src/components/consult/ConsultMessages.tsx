import { lazy, Suspense, useEffect, useRef } from "react";
import type { ConversationMessage } from "../../hooks/useConversation.ts";
import { AgentAvatar } from "../agents/AgentAvatar.tsx";
import { ChatIcon } from "../ui/icons.tsx";

/*
 * El Markdown (react-markdown + remark-gfm) pesa unos 50 KB comprimidos: se
 * descarga aparte, con la primera respuesta del agente, y no retrasa la carga
 * inicial de la aplicación.
 */
const Markdown = lazy(() =>
  import("../ui/Markdown.tsx").then((module) => ({ default: module.Markdown })),
);

interface ConsultMessagesProps {
  agentName: string;
  messages: ConversationMessage[];
  /** Consulta enviada que aún espera respuesta. */
  pendingQuery?: string;
  error: string | null;
}

/**
 * Mensajes de la conversación (`chat` de daisyUI): cada consulta con su
 * respuesta, la espera de la siguiente y el error si lo hubo. Tiene su propio
 * scroll y baja solo al último mensaje.
 */
export function ConsultMessages({
  agentName,
  messages,
  pendingQuery,
  error,
}: ConsultMessagesProps) {
  const scrollBox = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0 && !pendingQuery && !error;

  useEffect(() => {
    const box = scrollBox.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages.length, pendingQuery, error]);

  return (
    <div
      ref={scrollBox}
      aria-live="polite"
      aria-label="Mensajes de la consulta"
      tabIndex={0}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
    >
      {isEmpty && (
        <div className="flex h-full flex-col items-center justify-center px-3 text-center">
          <ChatIcon className="mb-3 size-8 text-base-content/50" />
          <p className="font-medium">Inicia la conversación</p>
          <p className="mt-1.5 max-w-xs text-sm text-base-content/70">
            Escribe tu consulta abajo; el agente recordará lo que hablen.
          </p>
        </div>
      )}

      {messages.map((message, index) =>
        message.role === "user" ? (
          <UserBubble key={index} text={message.content} />
        ) : (
          <AgentBubble
            key={index}
            agentName={agentName}
            text={message.content}
            provider={message.provider}
          />
        ),
      )}

      {pendingQuery && (
        <>
          <UserBubble text={pendingQuery} />
          <AgentBubble agentName={agentName} />
        </>
      )}

      {error && (
        <div role="alert" className="alert alert-error alert-soft">
          {error}
        </div>
      )}
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="chat chat-end">
      <div className="chat-header mb-1 text-xs text-base-content/70">Tú</div>
      <div className="chat-bubble chat-bubble-primary max-w-[85%] whitespace-pre-wrap [overflow-wrap:anywhere]">
        {text}
      </div>
    </div>
  );
}

/** Respuesta del agente en Markdown; sin `text` muestra que la está generando. */
function AgentBubble({
  agentName,
  text,
  provider,
}: {
  agentName: string;
  text?: string;
  provider?: string;
}) {
  return (
    <div className="chat chat-start">
      <div className="chat-image">
        <AgentAvatar name={agentName} />
      </div>
      <div className="chat-header mb-1 text-xs text-base-content/70">
        Agente
      </div>
      <div className="chat-bubble max-w-[85%] leading-relaxed [overflow-wrap:anywhere]">
        {text !== undefined ? (
          // Mientras llega el código del Markdown, el texto se ve tal cual.
          <Suspense fallback={<p className="whitespace-pre-wrap">{text}</p>}>
            <Markdown text={text} />
          </Suspense>
        ) : (
          <>
            <span
              className="loading loading-dots loading-sm"
              aria-hidden="true"
            />
            <span className="sr-only">Generando respuesta…</span>
          </>
        )}
      </div>
      {provider && (
        <div className="chat-footer mt-1 text-xs opacity-60">
          Proveedor: {provider}
        </div>
      )}
    </div>
  );
}
