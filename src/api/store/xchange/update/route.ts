import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateXchangeWorkflow } from "@/workflows/store/xchange/update";

interface InputType {
  id: string;
  usd: string;
  gbp: string;
  eur: string;
  lira: string;
  created_on: string;
}

// /store/xchange/update/ - update a xchange
export async function POST(
  req: MedusaRequest<InputType>,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id, usd, gbp, eur, lira, created_on } = req.body as InputType;

    // validate required fields
    if (!id || !usd || !gbp || !eur || !lira || !created_on) {
      res.status(400).json({
        error: "Bad Request",
        message: "Xchange id, usd, gbp, eur, lira and created_on is required",
      });
    }

    // validate created_on format if provided
    if (created_on) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z?$/;
      if (!dateRegex.test(created_on)) {
        res.status(400).json({
          error: "Bad Request",
          message:
            "Invalid date format for created_on. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
        });
      }
    }

    const { result } = await updateXchangeWorkflow(req.scope).run({
      input: {
        id,
        usd,
        gbp,
        eur,
        try: lira,
        created_on: new Date(created_on),
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error updating xchange:", error);

    if (error.message?.includes("not found")) {
      res.status(404).json({
        error: "Not Found",
        message: "Xchange not found",
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
      message: "Failed to update xchange",
    });
  }
}
