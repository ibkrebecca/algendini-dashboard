import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { retrieveBrandWorkflow } from "@/workflows/admin/brand/retrieve";

// /store/brands/retrieve/ - retrieve all brand
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { q, id } = req.query;

    // build filters
    const filters: Record<string, any> = {};
    if (id) filters.id = id;
    if (q) filters.name = { $like: `%${q}%` };

    const { result: brands } = await retrieveBrandWorkflow(req.scope).run({
      input: {
        filters,
      },
    });

    res.status(201).json(brands);
  } catch (error) {
    console.error("Error retriving brand:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Brand not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve brand",
    });
  }
}
