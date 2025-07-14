import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { retrieveXchangeWorkflow } from "../../../../workflows/xchange/retrieve";

// /store/xchange/retrieve/ - retrieve all xchange
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // build filters
    const filters: any = { id: "xchange" };

    const { result: xchange } = await retrieveXchangeWorkflow(req.scope).run({
      input: {
        filters,
      },
    });

    res.json(xchange);
  } catch (error) {
    console.error("Error retriving xchange:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Xchange not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve xchange",
    });
  }
}
