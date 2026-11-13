import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { errorMessage, fieldError } from "../../api/client.ts";
import {
  createAgentSchema,
  type CreateAgentInput,
} from "../../schemas/agent.schemas.ts";
import type { Agent } from "../../types/agent.ts";
import { useCreateAgent, useUpdateAgent } from "./useAgentMutations.ts";

/**
 * Lógica del formulario de agente. Con `agent` edita y parte de sus valores;
 * sin él, crea. Valida con Zod antes de enviar y, si el servidor rechaza un
 * campo, coloca su mensaje junto a ese campo.
 */
export function useAgentForm(
  agent: Agent | undefined,
  onSaved: (agent: Agent) => void,
) {
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const mutation = agent ? updateAgent : createAgent;

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

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = agent
        ? await updateAgent.mutateAsync({ id: agent.id, input: values })
        : await createAgent.mutateAsync(values);
      onSaved(saved);
    } catch (error) {
      for (const field of ["name", "instructions"] as const) {
        const message = fieldError(error, field);
        if (message) setError(field, { message });
      }
    }
  });

  const hasFieldErrors = Boolean(errors.name || errors.instructions);

  return {
    register,
    errors,
    onSubmit,
    isSaving: mutation.isPending,
    // El error general solo se muestra si no se pudo asignar a un campo.
    generalError:
      mutation.isError && !hasFieldErrors ? errorMessage(mutation.error) : null,
  };
}
