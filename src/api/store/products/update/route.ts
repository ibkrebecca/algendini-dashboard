import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateProductsWorkflow } from "@/workflows/store/product/update";

interface InputType {
  id: string;
  features?: object[];
}

// /store/products/update/ - update a product
export async function POST(
  req: MedusaRequest<InputType>,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id, features } = req.body as InputType;

    // validate required fields
    if (!id) {
      res.status(400).json({
        error: "Bad Request",
        message: "Product id is required",
      });
    }

    const { result: updated } = await updateProductsWorkflow(req.scope).run({
      input: {
        id,
        features,
      },
    });

    res.status(201).json(updated);
  } catch (error) {
    console.error("Error updating product:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Product not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update product",
    });
  }
}
