import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Agent } from "../../types/agent.ts";
import { ApiError } from "../../api/client.ts";
import { useCreateAgent, useUpdateAgent } from "./useAgentMutations.ts";
import {
  createAgentSchema,
  type CreateAgentInput,
} from "../../schemas/agent.schemas.ts";

/**
 * Formulario único para crear y editar. Con `agent` entra en modo editar y
 * parte de sus valores; sin él, crea. Cada vez que se abre el formulario se
 * monta de nuevo, así que no queda nada del uso anterior.
 */
export function useAgentForm(
  agent: Agent | null,
  onSaved: (agent: Agent) => void,
) {
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const saveAgent = agent ? updateAgent : createAgent;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: agent?.name ?? "",
      instructions: agent?.instructions ?? "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    const callbacks = {
      onSuccess: (saved: Agent) => onSaved(saved),
      onError: (error: Error) => {
        // Si el servidor rechaza un campo, el mensaje aparece junto a ese campo.
        if (error instanceof ApiError) {
          for (const detail of error.details) {
            if (detail.field === "name" || detail.field === "instructions") {
              setError(detail.field, { message: detail.message });
            }
          }
        }
      },
    };

    if (agent) {
      updateAgent.mutate({ id: agent.id, input: values }, callbacks);
    } else {
      createAgent.mutate(values, callbacks);
    }
  });

  // El error general se muestra solo si no se pudo asignar a un campo concreto.
  const hasFieldErrors = Boolean(errors.name || errors.instructions);
  const showGeneralError = saveAgent.isError && !hasFieldErrors;

  return { register, errors, onSubmit, saveAgent, showGeneralError };
}
