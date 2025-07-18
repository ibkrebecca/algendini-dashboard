import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { retrieveBrandWorkflow } from "../../../../workflows/brand/retrieve";

// /store/brand/retrieve/ - retrieve all brand
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.query;

    // build filters
    const filters: any = {};
    if (id) filters.id = id;

    const { result: brand } = await retrieveBrandWorkflow(req.scope).run({
      input: {
        filters,
      },
    });

    res.json(brand);
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
