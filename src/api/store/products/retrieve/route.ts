import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { retrieveProductsWorkflow } from "../../../../workflows/products/retrieve";

// /store/products/retrieve/ - retrieve all products
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { limit = 50, offset = 0, q, id } = req.query;

    // build filters
    const filters: any = { status: "published" };
    if (q) filters.title = { $ilike: `%${q}%` };
    if (id) filters.id = id;

    const { result: products } = await retrieveProductsWorkflow(
      req.scope
    ).run({
      input: {
        filters,
        limit,
        offset,
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Error retriving products:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Customer not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve products",
    });
  }
}
