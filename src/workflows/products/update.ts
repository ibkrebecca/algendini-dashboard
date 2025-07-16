// src/workflows/product/update.ts
import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { EXTENDED_PRODUCT_MODULE } from "../../modules/product";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

interface InputType {
  id: string;
  view_count?: number;
  features?: object[];
}

const updateExtendedProduct = createStep(
  "update_extended_product",
  async (
    input: {
      product_id: string;
      view_count?: number;
      features?: object[];
    },
    { container }
  ) => {
    const extendedProductService = container.resolve(EXTENDED_PRODUCT_MODULE);
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    let exist: any = null;
    try {
      exist = await extendedProductService.retrieveExtendedProduct(
        input.product_id
      );
    } catch (_) {
      exist = null;
    }

    const update: any = {};
    if (!exist) {
      await extendedProductService.createExtendedProducts({
        id: input.product_id,
        view_count: input.view_count,
        features: input.features as unknown as Record<string, unknown>,
      });

      await link.create({
        [Modules.PRODUCT]: { product_id: input.product_id },
        extended_product: {
          extended_product_id: input.product_id,
        },
      });
    } else {
      // prepare update data for extended product
      if (input.view_count !== undefined)
        update.view_count = new Date(input.view_count);
      if (input.features !== undefined) update.features = input.features;

      if (Object.keys(update).length > 0) {
        await extendedProductService.updateExtendedProducts({
          id: input.product_id,
          ...update,
        });
      }
    }

    return new StepResponse(true, {
      product_id: input.product_id,
      original: exist,
    });
  },
  async (revert, { container }) => {
    // revert: restore original extended product data
    if (revert?.product_id && revert?.original) {
      const extendedProductService = container.resolve(EXTENDED_PRODUCT_MODULE);

      // restore original data
      await extendedProductService.updateExtendedProducts({
        id: revert.product_id,
        view_count: revert.original.view_count,
        features: revert.original.features,
      });
    }
  }
);

// main workflow
export const updateProductsWorkflow = createWorkflow(
  "update_product_workflow",
  function (input: InputType) {
    const extended_product = updateExtendedProduct({
      product_id: input.id,
      view_count: input.view_count,
      features: input.features,
    });

    return new WorkflowResponse({
      extended_product,
    });
  }
);
