// src/workflows/xchange/update.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { XCHANGE_MODULE } from "@/modules/xchange";
import XchangeService from "@/modules/xchange/service";

interface InputType {
  id: string;
  usd: string;
  gbp: string;
  eur: string;
  try: string;
  created_on: Date;
}

const updateXchange = createStep(
  "update_xchange",
  async (input: InputType, { container }) => {
    const xchangeService: XchangeService = container.resolve(XCHANGE_MODULE);

    let exist: any = null;
    try {
      exist = await xchangeService.retrieveXchange(input.id);
    } catch (_) {
      exist = null;
    }

    if (!exist) {
      await xchangeService.createXchanges({
        id: input.id,
        usd: input.usd,
        gbp: input.gbp,
        eur: input.eur,
        try: input.try,
        created_on: input.created_on,
      });
    } else {
      await xchangeService.updateXchanges({
        id: input.id,
        usd: input.usd,
        gbp: input.gbp,
        eur: input.eur,
        try: input.try,
        created_on: input.created_on,
      });
    }

    return new StepResponse(true);
  },
  async (revert, { container }) => {
    // NO REVERT
  }
);

// main workflow
export const updateXchangeWorkflow = createWorkflow(
  "update_xchange_workflow",
  function (input: InputType) {
    const xchange = updateXchange(input);

    return new WorkflowResponse(xchange);
  }
);
