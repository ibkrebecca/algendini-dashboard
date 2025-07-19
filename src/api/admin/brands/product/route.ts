import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateBrandProductWorkflow } from "@/workflows/admin/brand/product";

interface InputType {
  brand_id: string;
  old_brand_id: string;
  product_id: string;
  is_remove: string;
}

// /store/brands/product/ - update a product brand
export async function POST(
  req: MedusaRequest<InputType>,
  res: MedusaResponse
): Promise<void> {
  try {
    const { brand_id, old_brand_id, product_id, is_remove } =
      req.body as InputType;

    // validate required fields
    if (!brand_id || !old_brand_id || !product_id || !is_remove) {
      res.status(400).json({
        error: "Bad Request",
        message:
          "Brand id, old brand id, product id and is_remove are required",
      });
    }

    const isRemove: boolean = is_remove === "true";

    const { result: updated } = await updateBrandProductWorkflow(req.scope).run(
      {
        input: {
          brand_id,
          old_brand_id,
          product_id,
          is_remove: isRemove,
        },
      }
    );

    res.status(201).json(updated);
  } catch (error) {
    console.error("Error updating product brand:", error);

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update product brand",
    });
  }
}
