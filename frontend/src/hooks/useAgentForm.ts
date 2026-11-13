import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Agent } from "../types/agent.ts";
import { ApiError } from "../api/client.ts";
import { useCreateAgent } from "./useAgents.ts";
import { createAgentSchema, type CreateAgentInput } from "../schemas/agent.schemas.ts";

export function useAgentForm(onCreated: (agent: Agent) => void) {
  const createAgent = useCreateAgent();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: { name: "", instructions: "" },
  });

  const onSubmit = handleSubmit((values) => {
    createAgent.mutate(values, {
      onSuccess: (agent) => {
        reset();
        onCreated(agent);
      },
      onError: (error) => {
        // Si el servidor rechaza un campo, el mensaje aparece junto a ese campo.
        if (error instanceof ApiError) {
          for (const detail of error.details) {
            if (detail.field === "name" || detail.field === "instructions") {
              setError(detail.field, { message: detail.message });
            }
          }
        }
      },
    });
  });

  // El error general se muestra solo si no se pudo asignar a un campo concreto.
  const hasFieldErrors = Boolean(errors.name || errors.instructions);
  const showGeneralError = createAgent.isError && !hasFieldErrors;

  function resetForm() {
    reset();
    createAgent.reset();
  }

  return { register, errors, onSubmit, createAgent, showGeneralError, resetForm };
}
