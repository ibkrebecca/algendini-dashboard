import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { retrieveCategoriesWorkflow } from "@/workflows/categories/retrieve";

// /store/categories/retrieve/ - retrieve all categories
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { skip = 0, take = 50, q, id } = req.query;

    const skipNum = parseInt(skip as string) || 0;
    const takeNum = parseInt(take as string) || 50;

    // build filters
    const filters: Record<string, any> = {
      is_active: true,
      is_internal: false,
    };
    if (q) filters.name = { $ilike: `%${q}%` };
    if (id) filters.id = id;

    const { result: categories } = await retrieveCategoriesWorkflow(
      req.scope
    ).run({
      input: {
        filters,
        skip: skipNum,
        take: takeNum,
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
