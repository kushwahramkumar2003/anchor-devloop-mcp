import type { ServerContext } from "@modelcontextprotocol/server";
import type { CloneInput } from "../config/index.ts";
import { toolError, toolResult } from "../result.ts";
import { resetValidator } from "../../utils/validator.ts";

export const resetValidatorHandler = async (
  { clone }: CloneInput,
  _ctx: ServerContext,
) => {
  try {
    await resetValidator(clone);

    return toolResult({
      status: "success",
      message: "Validator reset successfully.",
    });
  } catch (error) {
    return toolError(error);
  }
};
