import type { ServerContext } from "@modelcontextprotocol/server";
import type { CloneInput } from "../config/index.ts";
import { toolError, toolResult } from "../result.ts";
import { startValidator } from "../../utils/validator.ts";

export const startValidatorHandler = async (
  { clone }: CloneInput,
  _ctx: ServerContext,
) => {
  try {
    await startValidator(clone);
    const source = clone?.url ? ` Cloned from ${clone.url}.` : "";

    return toolResult({
      status: "success",
      message: `Validator started successfully.${source}`,
    });
  } catch (error) {
    return toolError(error);
  }
};
