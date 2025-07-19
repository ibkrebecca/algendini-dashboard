import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { deleteBrandWorkflow } from "@/workflows/admin/brand/delete";

interface InputType {
  id: string;
}

// /store/brands/delete/ - delete a brand
export async function POST(
  req: MedusaRequest<InputType>,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.body as InputType;

    // validate required fields
    if (!id) {
      res.status(400).json({
        error: "Bad Request",
        message: "Brand id is required",
      });
    }

    const { result: deleted } = await deleteBrandWorkflow(req.scope).run({
      input: {
        id,
      },
    });

    res.status(201).json(deleted);
  } catch (error) {
    console.error("Error deleting brand:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Brand not found",
      });
    }

    if (error.message?.includes("Invalid date")) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid date format provided",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete brand",
    });
  }
}
