import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { retrieveCategoriesWorkflow } from "../../../../workflows/categories/retrieve";

// /store/categories/retrieve/ - retrieve all categories
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { limit = 50, offset = 0, q, is_active, is_internal } = req.query;

    // build filters
    const filters: any = {};
    if (q) filters.name = { $ilike: `%${q}%` };
    if (is_active !== undefined) filters.is_active = is_active === "true";
    if (is_internal !== undefined) filters.is_internal = is_internal === "true";

    const { result: categories } = await retrieveCategoriesWorkflow(
      req.scope
    ).run({
      input: {
        filters,
        limit,
        offset,
      },
    });

    res.json(categories);
  } catch (error) {
    console.error("Error retriving categories:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Customer not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve categories",
    });
  }
}
