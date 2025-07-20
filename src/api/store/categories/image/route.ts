import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { imageCategoryWorkflow } from "@/workflows/store/category/image";

// /store/categories/image/ - retrieve category image
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.query;

    // build filters
    const filters: Record<string, any> = {
      id: id,
    };

    const { result: image } = await imageCategoryWorkflow(req.scope).run({
      input: {
        filters,
      },
    });

    res.json(image[0].image);
  } catch (error) {
    console.error("Error retriving category image:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Customer not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve category image",
    });
  }
}
