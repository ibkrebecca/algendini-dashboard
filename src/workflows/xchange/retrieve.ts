// src/workflows/xchange/retrieve.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// retrieve xchange
const retrieveXchange = createStep(
  "retrieve_xchange",
  async (input: any, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: xchange, metadata: { count } = {} } = await query.graph({
      entity: "xchange",
      fields: ["*"],
      filters: input.filters,

    });

    if (!xchange) throw new Error(`No xchange found`);
    return new StepResponse({
      xchange,
      count,
    });
  }
);

// workflow
export const retrieveXchangeWorkflow = createWorkflow(
  "retrieve_xchange_workflow",
  function (input) {
    const xchange = retrieveXchange(input);

    return new WorkflowResponse(xchange);
  }
);
