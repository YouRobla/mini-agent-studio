import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { fieldError } from "../../api/client.ts";
import {
  runAgentSchema,
  type RunAgentInput,
} from "../../schemas/agent.schemas.ts";

/**
 * Lógica del campo de consulta: valida con Zod y envía. Si todo va bien, limpia
 * el campo y le devuelve el foco; si falla, conserva el texto para reintentar.
 */
export function useQueryForm(send: (input: RunAgentInput) => Promise<unknown>) {
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    setFocus,
    formState: { errors },
  } = useForm<RunAgentInput>({
    resolver: zodResolver(runAgentSchema),
    defaultValues: { query: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await send(values);
      resetField("query");
      setFocus("query");
    } catch (error) {
      // Aquí solo el error del propio campo; los demás los muestra el chat.
      const message = fieldError(error, "query");
      if (message) setError("query", { message });
    }
  });

  return { register, queryError: errors.query?.message, onSubmit };
}
