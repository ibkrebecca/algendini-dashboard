import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateBrandWorkflow } from "@/workflows/admin/brand/update";

interface InputType {
  id?: string;
  name: string;
}

// /store/brands/update/ - update a brand
export async function POST(
  req: MedusaRequest<InputType>,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id, name } = req.body as InputType;

    const { result: updated } = await updateBrandWorkflow(req.scope).run({
      input: {
        id: id!,
        name,
      },
    });

    res.status(201).json(updated);
  } catch (error) {
    console.error("Error updating brand:", error);

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
      message: "Failed to update brand",
    });
  }
}
