import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiError } from "../api/client.ts";
import { useRunAgent } from "./useAgents.ts";
import { runAgentSchema, type RunAgentInput } from "../schemas/agent.schemas.ts";

export function useQueryForm(agentId: string) {
  const runAgent = useRunAgent(agentId);
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

  const onSubmit = handleSubmit((values) => {
    if (runAgent.isPending) return;
    runAgent.mutate(values, {
      onSuccess: () => {
        resetField("query");
        setFocus("query");
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          const detail = error.details.find((d) => d.field === "query");
          if (detail) setError("query", { message: detail.message });
        }
      },
    });
  });

  const showGeneralError = runAgent.isError && !errors.query;

  return { register, errors, onSubmit, runAgent, showGeneralError };
}
